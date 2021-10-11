import React from 'react';
import * as Utils from "../../Utils";

const BalanceSourceLines = ({sources, months}) => {
    return Object.keys(sources).map((sourceKey) => {
            const source = sources[sourceKey];

            const values = months.map((month) => {
                let value = source.months.hasOwnProperty(month) ? source.months[month] : 0;
                return <td>{Utils.numberWithSpaces(value)}</td>
            });

            return <tr key={source.id}>
                <th className="source-line-name">{source.name}</th>
                {values}
            </tr>
        }
    )
};

export default BalanceSourceLines;