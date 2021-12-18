import React from 'react';
import strings from "../../models/lang";
import './BalanceSumLine.css'
import * as Utils from "../../Utils";

const BalanceSumLine = ({sources, months}) => {
    const values = months.map((month) => {
        let sum = 0;
        for (let source in sources) {
            if (sources[source].months.hasOwnProperty(month)) {
                sum += sources[source].months[month];
            }
        }

        return <td className="source-month-value" key={'sum_' + month}>
            {Utils.numberWithSpaces(sum)}
        </td>
    });

    return <tr className="source-line source-line-sum" key="sources-sum">
        <th className="source-name control-with-buttons">{strings.balance_sum}</th>
        {values}
    </tr>

};

export default BalanceSumLine;