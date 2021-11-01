import React from 'react';
import './Navigation.css'

const Navigation = ({onSettingsClick, onTabSelect, activeTab}) => {
    const onIncomeSelect = () => {
        onTabSelect('income')
    };
    const onBalanceSelect = () => {
        onTabSelect('balance')
    };
    return <div className="buttons">
        <div className="tabs">
            <a className={`tab js-tab ${activeTab === 'income' ? 'active' : ''}`} data-name="income" onClick={onIncomeSelect}>[[income]]</a>
            <a className={`tab js-tab ${activeTab === 'balance' ? 'active' : ''}`} data-name="balance" onClick={onBalanceSelect}>[[balance]]</a>
        </div>
        <div className="settings-button js-settings-button" onClick={onSettingsClick}>[[settings]]</div>
    </div>
};


export default Navigation;