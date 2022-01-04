import React, {useState} from 'react';
import * as Utils from "../../Utils";
import './SourceMonthValue.css'
import strings from "../../models/lang";

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const SourceMonthValue = ({month, sourceValue, sourceId, isEditMode}) => {

    const [editMode, setEditMode] = useState(isEditMode);
    const [value, setValue] = useState(sourceValue);

    const onChangeValue = (event) => {
        setValue(parseInt(event.target.value));
    };

    const onChangeUpdateMode = () => {
        if (editMode) {
            ipcRenderer.send('balance-update', sourceId, month, value);
            setEditMode(false);
        } else {
            setEditMode(true);
        }
    };

    const onDelete = () => {
        setValue(0);
        ipcRenderer.send('balance-month-remove', sourceId, month);
    };

    if (editMode) {
        return <td className="source-month-value control-with-buttons edit-mode" key={month}>
            <input type="number" placeholder={strings.sum} className="source-month-value-input" value={value} onChange={onChangeValue}/>
            <span className="save control-button" onClick={onChangeUpdateMode}/>
        </td>
    }

    return <td className="source-month-value control-with-buttons" key={month}>
        {Utils.numberWithSpaces(value)}
        <span className="edit control-button" onClick={onChangeUpdateMode}/>
        <span className="delete control-button" onClick={onDelete}/>
    </td>
};

export default SourceMonthValue;