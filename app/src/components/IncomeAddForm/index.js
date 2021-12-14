import React, {useState} from 'react';
import moment from "moment";
import './IncomeAddForm.css'
import {Income} from "../../models/income";

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const IncomeAddForm = ({item, toggleEditMode}) => {
  const updateMode = item !== undefined && toggleEditMode !== undefined;

  const [date, setDate] = useState(item ? item.date: moment().unix());
  const [month, setMonth] = useState(item ? item.month: moment().unix());
  const [sum, setSum] = useState(item ? item.sum: '');
  const [paymentType, setPaymentType] = useState(item ? item.paymentType: '');
  const [contact, setContact] = useState(item ? item.contact: '');
  const [description, setDescription] = useState(item ? item.description: '');

  const onChangeDate= (event) => {
    setDate(moment(event.target.value).unix());
  };
  const onChangeMonth = (event) => {
    setMonth(moment(event.target.value).unix());
  };
  const onChangeSum = (event) => {
    setSum(parseInt(event.target.value));
  };
  const onChangePaymentType = (event) => {
    setPaymentType(event.target.value);
  };
  const onChangeContact = (event) => {
    setContact(event.target.value);
  };
  const onChangeDescription = (event) => {
    setDescription(event.target.value);
  };

  const onCreate = () => {
    const incomeItem = new Income(date,  month, sum, paymentType, contact, description);
    ipcRenderer.send('income-add', incomeItem);
  };

  const onUpdate = () => {
    const updatedItem = new Income(date, month, sum, paymentType, contact, description);
    updatedItem.id = item.id;
    ipcRenderer.send('income-edit', updatedItem);
  };

  let controlButtons = <input className="submit" type="submit" onClick={onCreate}/>

  if (updateMode) {
    controlButtons = <span className="save income-button" onClick={onUpdate}/>
  }

  //todo: autocomplete, see setFieldsAutocomplete
  return <tr className={`${updateMode ? 'row update' : 'form'}`}>
    <td><input type="date" placeholder="Date"
               min="1900-01-01" max="2100-01-01" value={moment.unix(date).format("YYYY-MM-DD")}  onChange={onChangeDate} required/></td>
    <td><input type="month" placeholder="Month"
               min="1900-01" max="2100-01" value={moment.unix(month).format("YYYY-MM")}  onChange={onChangeMonth} required/></td>
    <td><input type="number" placeholder="[[sum]]" value={sum} onChange={onChangeSum} required/></td>
    <td>
      <input placeholder="[[type]]" value={paymentType} onChange={onChangePaymentType} required/>
    </td>
    <td><input type="text" placeholder="[[contact]]" value={contact}  onChange={onChangeContact} required/>
    </td>
    <td>
      <input type="text" value={description} placeholder="[[description]]"  onChange={onChangeDescription}/>
      {controlButtons}
    </td>
  </tr>
};


export default IncomeAddForm;