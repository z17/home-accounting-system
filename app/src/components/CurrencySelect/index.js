import React from 'react';
import {Currencies} from "../../models/Currency";


const CurrencySelect = ({className, defaultValue, onChange}) => {

    return <select className={className} value={defaultValue} onChange={onChange}>
        <option value={Currencies.USD}>{Currencies.USD}</option>
        <option value={Currencies.EUR}>{Currencies.EUR}</option>
        <option value={Currencies.RUB}>{Currencies.RUB}</option>
    </select>

};

export default CurrencySelect;
