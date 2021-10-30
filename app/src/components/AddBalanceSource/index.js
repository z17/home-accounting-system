import React, {useState} from 'react';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const AddBalanceSource = ({}) => {

    const [name, setName] = useState();

    const onChangeName = (event) => {
        setName(event.target.value);
    };

    const addBalanceSource = (e) => {
        e.preventDefault();
        const source = {
            name: name,
            value: {},
        };
        ipcRenderer.send('balance-add', source);
    };

    return <form className="js-balance-source-form" onSubmit={addBalanceSource}>
        <label htmlFor="balancesource">[[balance-source-input]]:</label>
        <input type="text" id="balancesource" name="balancesource" value={name} onChange={onChangeName}/>
        <button type="submit" name="incrementsources">+</button>
    </form>

};

export default AddBalanceSource;