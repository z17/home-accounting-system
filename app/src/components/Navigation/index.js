import React from 'react';
import './Navigation.css'
import strings from "../../models/lang";

const Navigation = ({onSettingsClick, onTabSelect, activeTab}) => {
    const onIncomeSelect = () => {
        onTabSelect('income')
    };
    const onBalanceSelect = () => {
        onTabSelect('balance')
    };
    return <div className="buttons">
        <div className="tabs">
            <a className={`tab js-tab ${activeTab === 'income' ? 'active' : ''}`} data-name="income" onClick={onIncomeSelect}>{strings.income}</a>
            <a className={`tab js-tab ${activeTab === 'balance' ? 'active' : ''}`} data-name="balance" onClick={onBalanceSelect}>{strings.balance}</a>
        </div>
        <div className="settings-button js-settings-button" onClick={onSettingsClick}>{strings.settings}</div>
    </div>
};


export default Navigation;