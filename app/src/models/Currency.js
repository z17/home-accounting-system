import moment from "moment";

const Currencies = {
    EUR: 'EUR',
    USD: 'USD',
    RUB: 'RUB',
}

const BaseCurrency = Currencies.USD;

function mergeCurrencyRates(rates1, rates2) {
    return {...rates1, ...rates2};
}

function convertCurrency(currencyFrom, currencyTo, value, rates) {
    let baseValue = value / rates[currencyFrom];
    if (currencyTo === BaseCurrency) {
        return baseValue;
    }
    return baseValue * rates[currencyTo];
}

function getLastMothRates(rates, month) {
    return rates[moment(month, "MMYYYY").endOf('month').format("DD.MM.YYYY")];
}

export {
    Currencies, mergeCurrencyRates, convertCurrency, getLastMothRates
}
