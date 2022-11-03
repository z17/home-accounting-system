import React, {useState, useEffect} from 'react';
import './App.css';
import Navigation from './components/Navigation'
import Income from './components/Income'
import Balance from './components/Balance'
import Settings from './components/Settings'
import strings from "./models/lang";
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

function App() {
    const [settings_active, setSettingsActive] = useState(false);
    const [active_tab, setActiveTab] = useState('income');
    const [isReady, setReady] = useState(false);
    const [defaultCurrency, setDefaultCurrency] = useState('');

    useEffect(() => {
        ipcRenderer.send('app-ready');
        ipcRenderer.on('init_settings', function (event, settings) {
            if (settings.language) {
                strings.setLanguage(settings.language);
            }
            if(settings.defaultCurrency) {
                setDefaultCurrency(settings.defaultCurrency);
            } else {
                setSettingsActive(true);
            }
            document.title = strings.title;
            setReady(true);
        });

        return () => {
            ipcRenderer.removeAllListeners('current_language');
        };
    }, []);

    const settingsToggle = () => {
        setSettingsActive(!settings_active)
    };

    const onTabSelect = (tab) => {
        setActiveTab(tab)
    };

    if (!isReady) {
        return  <div className="wrapper"><div>Loading..</div></div>
    }

    return (
        <div className="wrapper">
            <Navigation onSettingsClick={settingsToggle} onTabSelect={onTabSelect} activeTab={active_tab}/>
            <Settings active={settings_active} settingsToggle={settingsToggle}
                      defaultCurrency={defaultCurrency} setDefaultCurrency={setDefaultCurrency}/>

            <div className="content">
                <Income active={active_tab === 'income'}/>
                <Balance active={active_tab === 'balance'} defaultCurrency={defaultCurrency} />
            </div>
        </div>
    );
}

export default App;
