import React, {useEffect, useState} from 'react';
import './Settings.css'
import strings from "../../models/lang";
import CurrencySelect from "../CurrencySelect";

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const RESPONSE_OK = 'ok';
const RESPONSE_ERROR = 'error';

const Settings = ({active, settingsToggle, defaultCurrency, setDefaultCurrency}) => {

    let [id, setId] = useState('');
    let [email, setEmail] = useState('');
    let [remind, setRemind] = useState(false);
    let [backupFolder, setBackupFolder] = useState('');
    let [databaseFolder, setDatabaseFolder] = useState('');
    let [language, setLanguage] = useState('');
    let [lastBackupDateTimestamp, setLastBackupDateTimestamp] = useState('');

    let [responseCode, setResponseCode] = useState('');
    let [response, setResponse] = useState('');

    useEffect(() => {
        ipcRenderer.send('component-settings-ready');

        ipcRenderer.on('settings', function (event, data) {
            setId(data.id);
            setEmail(data.email);
            setRemind(data.remind);
            setDefaultCurrency(data.defaultCurrency);
            setBackupFolder(data.backupFolder);
            setDatabaseFolder(data.databaseFolder);
            setLanguage(data.language);
            setLastBackupDateTimestamp(data.lastBackupDateTimestamp);

            if (data.language) {
                strings.setLanguage(data.language);
            }
        });

        ipcRenderer.on('settings-saved', function (event, isLanguageUpdated) {
            if (isLanguageUpdated) {
                setTimeout(() => {
                    ipcRenderer.send('reload');
                }, 500);
            }
            setResponse('ok');
            setResponseCode(RESPONSE_OK);
        });
    }, [id]);


    const onChangeEmail = (event) => {
        setEmail(event.target.value);
    };

    const onChangeRemind = () => {
        setRemind(!remind);
    };
    const onChangeDatabaseFolder = (event) => {
        setDatabaseFolder(event.target.files[0].path);
    };

    const onChangeBackupFolder = (event) => {
        setBackupFolder(event.target.files[0].path);
    };

    const onChangeLanguage = (event) => {
        setLanguage(event.target.value);
    };

    const onChangeDefaultCurrency = (event) => {
        setDefaultCurrency(event.target.value);
    };

    const onSubmit = (event) => {
        event.preventDefault();
        setResponse('');

        if (remind === true && email.length === 0) {
            setResponse('Empty email');
            setResponseCode(RESPONSE_ERROR);
            return;
        }

        const settings = {
            backupFolder: backupFolder,
            databaseFolder: databaseFolder,
            email: email,
            id: id,
            language: language,
            lastBackupDateTimestamp: lastBackupDateTimestamp,
            remind: remind,
            defaultCurrency: defaultCurrency,
        };

        ipcRenderer.send('update-settings', settings);
    };

    let currencyWarning = defaultCurrency ? ' ' : <div className="settings-currency-warning">{strings.settingsSetDefaultCurrency}</div>;

    // noinspection HtmlUnknownAttribute
    return <div className={`settings-window ${active ? "active" : ""}`}>

        <div className="settings-close-button" onClick={settingsToggle}>&#10006;</div>
        <h1>{strings.settings}</h1>
        {currencyWarning}

        <form className="settings-form" onSubmit={onSubmit}>
            <div className="settings-row"><label className="settings-label">{strings.remind}:</label>
                <input type="checkbox" checked={remind} onChange={onChangeRemind}/>
            </div>
            <div className="settings-row"><label className="settings-label">{strings.defaultCurrency}:</label>
                <CurrencySelect defaultValue={defaultCurrency} onChange={onChangeDefaultCurrency}/>
            </div>
            <div className="settings-row"><label className="settings-label">{strings.remind_email}:</label>
                <input type="email" value={email} onChange={onChangeEmail}/>
            </div>
            <div className="settings-row"><label className="settings-label">{strings.database_folder}:</label><br/>
                <input type="file" className="settings-folder" directory="" webkitdirectory="" multiple
                       onChange={onChangeDatabaseFolder}/>
                <input type="text" className="settings-folder-text" readOnly={true} value={databaseFolder}
                       placeholder={strings.choose_folder}/>
            </div>
            <div className="settings-row"><label className="settings-label">{strings.backup_folder}:</label><br/>
                <input type="file" className="settings-folder" directory="" webkitdirectory="" multiple
                       onChange={onChangeBackupFolder}/>
                <input type="text" className="settings-folder-text" readOnly={true} value={backupFolder}
                       placeholder={strings.choose_folder}/>
            </div>
            <div className="settings-row"><label className="settings-label">{strings.language}:</label>
                <select value={language} onChange={onChangeLanguage}>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                </select>
            </div>
            <div className="settings-row">
                <input type="submit" value={strings.save}/> <span
                className={`settings-response ${responseCode === RESPONSE_ERROR ? 'error' : ''}`}>{response}</span>
            </div>
        </form>
    </div>
};


export default Settings;
