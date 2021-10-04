import React, {useState} from 'react';
import moment from "moment";
import Utils from "../../Utils";
import IncomeAddForm from "../IncomeAddForm";

const IncomeLine = ({item}) => {
  const [isEditMode, setEditMode] = useState(false)

  const toggleEditMod = () => {
    setEditMode(!isEditMode);
  }
  if (isEditMode) {
    return <IncomeAddForm item={item} onSubmit={toggleEditMod} />
  }

  return <tr className="row">
    <td>{moment.unix(item.date).format("DD.MM.YYYY")}</td>
    <td>{moment.unix(item.month).format("MMM YYYY")}</td>
    <td>{Utils.numberWithSpaces(item.sum)}</td>
    <td>{item.paymentType}</td>
    <td>{item.contact}</td>
    <td>
      <span className="js-description">{item.description}</span>
      <span className="edit income-button js-income-edit" onClick={toggleEditMod}/>
      <span className="delete income-button js-income-delete"/>
    </td>
  </tr>
};


export default IncomeLine;