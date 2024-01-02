import React from 'react';
import strings from "../../models/lang";
import './BalanceSumLine.css'
import * as Utils from "../../Utils";
import {convertCurrency, getLastMothRates} from "../../models/Currency";

const BalanceSumLine = ({sources, months, rates, currency}) => {
    const values = months.map((month) => {
        let sum = 0;
        for (let sourceKey in sources) {
            let source = sources[sourceKey]
            if (source.months.hasOwnProperty(month)) {

                let value = source.months[month];
                let current_rates = getLastMothRates(rates, month);
                sum += convertCurrency(source['currency'], currency, value, current_rates);

            }
        }

        return <td className="source-month-value" key={'sum_' + month}>
            {Utils.numberWithSpaces(sum)} {currency}
        </td>
    });

    return <tr className="source-line source-line-sum" key="sources-sum">
        <th className="source-name control-with-buttons">{strings.balance_sum}</th>
        {values}
    </tr>

};

export default BalanceSumLine;