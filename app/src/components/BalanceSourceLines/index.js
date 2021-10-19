import React from 'react';
import SourceMonthValue from "../SourceMonthValue";

const BalanceSourceLines = ({sources, months}) => {

    return Object.keys(sources).map((sourceKey) => {
        const source = sources[sourceKey];
        const values = months.map((month) => {
            let value = source.months.hasOwnProperty(month) ? source.months[month] : 0;
            return <SourceMonthValue month={month} sourceValue={value} />
        });

        return <tr className="source-line" key={source.id}>
            <th className="source-name">{source.name}</th>
            {values}
        </tr>
    })
};

export default BalanceSourceLines;