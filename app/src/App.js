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

    useEffect(() => {
        ipcRenderer.send('app-ready');
        ipcRenderer.on('current_language', function (event, language) {
            if (language) {
                strings.setLanguage(language);
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
            <Settings active={settings_active} settingsToggle={settingsToggle}/>

            <div className="content">
                <Income active={active_tab === 'income'}/>
                <Balance active={active_tab === 'balance'}/>
            </div>
        </div>
    );
}

export default App;
