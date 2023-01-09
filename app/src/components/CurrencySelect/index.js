import React from 'react';
import {Currencies} from "../../models/Currency";


const CurrencySelect = ({className, defaultValue, onChange}) => {
   if (!defaultValue) {
       defaultValue = '--'
   }
    return <select className={className} defaultValue={defaultValue} onChange={onChange}>
        <option value='--' disabled>--</option>
        <option value={Currencies.USD}>{Currencies.USD}</option>
        <option value={Currencies.EUR}>{Currencies.EUR}</option>
        <option value={Currencies.RUB}>{Currencies.RUB}</option>
        <option value={Currencies.GBP}>{Currencies.GBP}</option>
    </select>

};

export default CurrencySelect;
