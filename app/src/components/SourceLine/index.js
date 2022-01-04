import React, {useState} from 'react';
import SourceMonthValue from "../SourceMonthValue";
import './SourceLine.css'

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const SourceLine = ({source, months}) => {

    const [editMode, setEditMode] = useState(false);
    const [sourceName, setValue] = useState(source.name);

    const onChangeValue = (event) => {
        setValue(event.target.value);
    };

    const onChangeUpdateMode = () => {
        if (editMode) {
            ipcRenderer.send('rename-balance-source', source.id, sourceName);
            setEditMode(false);
        } else {
            setEditMode(true);
        }
    };

    const lastMonth = months[months.length - 1];

    const values = months.map((month) => {
        let value = source.months.hasOwnProperty(month) ? source.months[month] : 0;
        let isEditMode = !source.months.hasOwnProperty(month) && lastMonth === month;
        return <SourceMonthValue month={month} sourceValue={value} sourceId={source.id} isEditMode={isEditMode}
                                 key={source.id + '_' + month}/>
    });


    if (editMode) {
        return <tr className="source-line" key={source.id}>
            <th className="source-name control-with-buttons edit-mode">
                <input type="text" className="source-edit-input" value={sourceName} onChange={onChangeValue}/>
                <span className="save control-button" onClick={onChangeUpdateMode}/></th>
            {values}
        </tr>
    }
    return <tr className="source-line" key={source.id}>
        <th className="source-name control-with-buttons">{sourceName} <span className="edit control-button" onClick={onChangeUpdateMode}/></th>
        {values}
    </tr>

};

export default SourceLine;