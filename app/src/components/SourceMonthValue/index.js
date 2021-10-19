import React, {useState} from 'react';
import * as Utils from "../../Utils";
import './SourceMonthValue.css'

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const SourceMonthValue = ({month, sourceValue}) => {

    const [updateMode, setUpdateMode] = useState(false);
    const [value, setValue] = useState(sourceValue);

    const onChangeValue = (event) => {
        setValue(parseInt(event.target.value));
    };

    const onChangeUpdateMode = () => {
        if (updateMode) {
            // todo: send updates
        } else {
            setUpdateMode(true);
        }
    };

    const onDelete = () => {

    }

    if (updateMode) {
        return <td className="source-month-value edit-mode" key={month}>
            <input type="number" placeholder="[[sum]]" className="source-month-value-input" value={value} onChange={onChangeValue}/>
            <span className="save control-button" onClick={onChangeUpdateMode}/>
        </td>
    }

    return <td className="source-month-value" key={month}>
        {Utils.numberWithSpaces(value)}
        <span className="edit control-button" onClick={onChangeUpdateMode}/>
        <span className="delete control-button" onClick={onDelete}/>
    </td>
};

export default SourceMonthValue;