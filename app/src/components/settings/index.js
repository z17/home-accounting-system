import React, {useState}  from 'react';
import './Settings.css'
import '../../models/Settings'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const Settings = ({active, settingsToggle}) => {

    const [settings, updateSettings] = useState(false);

    ipcRenderer.on('settings', function (event, data) {
        updateSettings(data)
    });


    // todo: loader befor settings loaded
    return <div className={`settings-window ${active ? "active" : ""}`}>

        <div className="settings-close-button" onClick={settingsToggle}>&#10006;</div>
        <h1>[[settings]]</h1>

        <form className="settings-form js-settings-form">
            <label>[[remind]]:
                <input type="checkbox" className="js-settings-remind" checked={settings.remind}/>
            </label>
            <label>[[remind-email]]:
                <input type="email" className="js-settings-email" value={settings.email}/>
            </label>
            <label>[[database-folder]]:<br/>
                <input type="file" className="js-settings-database settings-folder" webkitdirectory directory multiple/>
                <input type="text" className="js-settings-database-text settings-folder-text" value={settings.databaseFolder} placeholder="[[choose-folder]]"/>
            </label>
            <label>[[backup-folder]]:<br/>
                <input type="file" className="js-settings-backup settings-folder" webkitdirectory directory multiple/>
                <input type="text" className="js-settings-backup-text settings-folder-text" value={settings.backupFolder} placeholder="[[choose-folder]]"/>
            </label>
            <label>[[language]]:
                <select className="js-settings-language" value={settings.language}>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                </select>
            </label>
            <input type="submit" value="[[save]]"/> <span
            className="js-settings-response settings-response"></span>
        </form>
    </div>
};


export default Settings;