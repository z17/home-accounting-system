import React, {useState} from 'react';
import strings from "../../models/lang";
import {Currencies} from "../../models/Currency";
import CurrencySelect from "../CurrencySelect";

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const AddBalanceSource = () => {

    const [name, setName] = useState();
    const [currency, setCurrency] = useState(Currencies.USD);

    const onChangeName = (event) => {
        setName(event.target.value);
    };
    const onChangeCurrency = (event) => {
        setCurrency(event.target.value);
    };

    const addBalanceSource = (e) => {
        e.preventDefault();
        const source = {
            name: name,
            currency: currency,
            value: {},
        };
        ipcRenderer.send('balance-add', source);
    };

    return <form onSubmit={addBalanceSource}>
        <label htmlFor="balancesource">{strings.balance_source_input}: </label>
        <input className="balance-source-add-field" type="text" id="balancesource" name="balancesource" value={name} onChange={onChangeName}/>
        <CurrencySelect className="balance-source-add-field" onChange={onChangeCurrency} />
        <button type="submit" name="incrementsources">{strings.balance_source_add}</button>
    </form>

};

export default AddBalanceSource;
