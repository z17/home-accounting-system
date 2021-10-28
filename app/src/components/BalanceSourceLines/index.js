import React from 'react';
import SourceMonthValue from "../SourceMonthValue";

const BalanceSourceLines = ({sources, months}) => {

    const lastMonth = months[months.length - 1];
    return Object.keys(sources).map((sourceKey) => {
        const source = sources[sourceKey];
        const values = months.map((month) => {
            let value = source.months.hasOwnProperty(month) ? source.months[month] : 0;
            let isEditMode = !source.months.hasOwnProperty(month) && lastMonth === month;
            return <SourceMonthValue month={month} sourceValue={value} sourceId={source.id} isEditMode={isEditMode} key={source.id + '_' +  month}/>
        });

        return <tr className="source-line" key={source.id}>
            <th className="source-name">{source.name}</th>
            {values}
        </tr>
    })
};

export default BalanceSourceLines;