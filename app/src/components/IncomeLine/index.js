import React, {useState} from 'react';
import moment from "moment";
import Utils from "../../Utils";
import IncomeAddForm from "../IncomeAddForm";

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const IncomeLine = ({item, contacts, paymentTypes}) => {
  const [isEditMode, setEditMode] = useState(false);

  const toggleEditMod = () => {
    setEditMode(!isEditMode);
  };

  const onDelete = () => {
    ipcRenderer.send('income-delete', item.id);
  };

  if (isEditMode) {
    return <IncomeAddForm item={item} toggleEditMode={toggleEditMod} contacts={contacts} paymentTypes={paymentTypes}/>
  }

  return <tr className="row">
    <td>{moment.unix(item.date).format("DD.MM.YYYY")}</td>
    <td>{moment.unix(item.month).format("MMM YYYY")}</td>
    <td>{Utils.numberWithSpaces(item.sum)}</td>
    <td>{item.paymentType}</td>
    <td>{item.contact}</td>
    <td>
      <span className="js-description">{item.description}</span>
      <span className="edit income-button" onClick={toggleEditMod}/>
      <span className="delete income-button" onClick={onDelete}/>
    </td>
  </tr>
};


export default IncomeLine;