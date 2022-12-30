import moment from "moment";

const Currencies = {
    EUR: 'EUR',
    USD: 'USD',
    RUB: 'RUB',
    GBP: 'GBP',
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
        case Currencies.GBP:
            return '£';
        default:
            return 'ERROR'
    }
}

function convertCurrency(currencyFrom, currencyTo, value, rates) {
    let baseValue;
    if (currencyFrom === BaseCurrency) {
        baseValue = value;
    } else {
        baseValue = value / (rates[currencyFrom] / 100);
    }

    if (currencyTo === BaseCurrency) {
        return Math.round(baseValue);
    }
    return Math.round(baseValue * (rates[currencyTo] / 100));
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
