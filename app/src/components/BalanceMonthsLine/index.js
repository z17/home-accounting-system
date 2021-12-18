import React from 'react';
import moment from "moment";

const BalanceMonthsLine = ({months}) => {
  return <tr>
    <th className="source-line-name"/>
    {months.map((month) => <th key={month}>{moment(month, "MMYYYY").format("MMM YYYY")}</th>)}
  </tr>
};


export default BalanceMonthsLine;