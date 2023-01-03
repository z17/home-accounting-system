import moment from "moment";

const Currencies = {
    EUR: 'EUR',
    USD: 'USD',
    RUB: 'RUB',
    GBP: 'GBP',
}

const BaseCurrency = Currencies.USD;
const LATEST_CURRENCY_KEY = 'latest';

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

function getNearestRates(rates, dateTime) {
    let date = moment.unix(dateTime)
    for (let i = 0; i < 16; i++) {
        let newDate = date.clone().add(i, 'days');
        if (newDate.format("DD.MM.YYYY") in rates) {
            return rates[newDate.format("DD.MM.YYYY")]
        }
        newDate = date.clone().subtract(i, 'days');
        if (newDate.format("DD.MM.YYYY") in rates) {
            return rates[newDate.format("DD.MM.YYYY")]
        }
    }
    return rates[LATEST_CURRENCY_KEY];
}

export {
    Currencies, convertCurrency, getLastMothRates, getCurrencySymbol, getNearestRates
}
