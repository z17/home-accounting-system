import moment from "moment";

const Currencies = {
    EUR: 'EUR',
    USD: 'USD',
    RUB: 'RUB',
}

const BaseCurrency = Currencies.USD;
const LATEST_CURRENCY_KEY = 'latest';

function mergeCurrencyRates(rates1, rates2) {
    return {...rates1, ...rates2};
}

function getCurrencySymbol(currency) {
    switch (currency) {
        case Currencies.EUR:
            return '€';
        case Currencies.USD:
            return '$';
        case Currencies.RUB:
            return '₽';
        default:
            return 'ERROR'
    }
}

function convertCurrency(currencyFrom, currencyTo, value, rates) {
    let baseValue;
    if (currencyFrom === BaseCurrency) {
        baseValue = value;
    } else {
        baseValue = value / rates[currencyFrom];
    }

    if (currencyTo === BaseCurrency) {
        return baseValue;
    }
    return baseValue * rates[currencyTo];
}

function getLastMothRates(rates, month) {
    let lastMonthDay = moment(month, "MMYYYY").endOf('month').format("DD.MM.YYYY");
    if (lastMonthDay in rates) {
        return rates[lastMonthDay];
    } else {
        return rates[LATEST_CURRENCY_KEY];
    }
}

export {
    Currencies, mergeCurrencyRates, convertCurrency, getLastMothRates, getCurrencySymbol
}
