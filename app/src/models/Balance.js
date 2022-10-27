import moment from "moment";
import Utils from "../Utils";
import strings from "./lang";
import {convertCurrency, getLastMothRates} from "./Currency";

function BalanceModel(sources, months, rates, defaultCurrency) {
    this.sources = sources;
    this.months = months;
    this.rates = rates;
    this.defaultCurrency = defaultCurrency;
}


function getMonthsArray(sourceData) {
    let firstMonth = moment().startOf('month');
    let lastMonth = moment().startOf('month');

    // search first and last months
    for (let i in sourceData) {
        if (!sourceData.hasOwnProperty(i)) {
            continue;
        }

        let months = Object.keys(sourceData[i].value);
        let monthData = months.map((month) => moment(month, "MMYYYY"));

        [firstMonth, lastMonth] = Utils.calcStartEndDates(firstMonth, lastMonth, monthData);
    }

    const countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;

    // prepare array of all months
    let month = firstMonth.clone();
    const monthsMapIndexToValue = [];
    for (let i = 0; i < countMonths; i++) {
        monthsMapIndexToValue[i] = month.format("MMYYYY");
        month.add(1, 'M');
    }
    return monthsMapIndexToValue;
}


function convertSourceData(sourceData) {
    // prepare sources object
    const sourcesInit = {};
    let index = 0;
    for (let i in sourceData) {
        if (!sourceData.hasOwnProperty(i)) {
            continue;
        }
        const source = sourceData[i];
        sourcesInit[source.id] = {
            id: source.id,
            name: source.name,
            months: source.value,
            currency: source.currency,
            index: index
        };

        index++;
    }
    return sourcesInit;
}

BalanceModel.prototype.getBalanceSum = function () {
    let balanceSum = 0;
    // search last unempty months
    let lastUnEmptyMonth = null;
    for (let month of this.months.slice().reverse()) {
        for (let source in this.sources) {
            if (this.sources[source].months.hasOwnProperty(month)) {
                lastUnEmptyMonth = month;
                break;
            }
        }
        if (lastUnEmptyMonth !== null) {
            break
        }
    }

    let isCurrentMonthEmpty = true;
    if (lastUnEmptyMonth === moment().format("MMYYYY")) {
        isCurrentMonthEmpty = false;
    }

    const lastMonthRates = getLastMothRates(this.rates, lastUnEmptyMonth);
    for (let sourceId in this.sources) {
        let source = this.sources[sourceId];
        let value = source.months[lastUnEmptyMonth];
        if (value) {
            let convertedSum = convertCurrency(source['currency'], this.defaultCurrency, value, lastMonthRates);
            balanceSum += convertedSum;
        }
    }

    return [balanceSum, lastUnEmptyMonth, isCurrentMonthEmpty];
}

BalanceModel.prototype.getBestMonth = function () {
    let bestMonth = this.months.map((month) => {
        let sum = 0;
        for (let sourceId in this.sources) {
            let source = this.sources[sourceId];
            if (!source.months.hasOwnProperty(month)) {
                continue;
            }
            let source_value = source.months[month];
            let current_rates = getLastMothRates(this.rates, month);
            sum += convertCurrency(source['currency'], this.defaultCurrency, source_value, current_rates);
        }
        return [month, sum];
    }).reduce((month1, month2) => {
        if (month1[1] < month2[1]) {
            month1 = month2;
        }
        return month1;
    }, ['', 0]);

    if (bestMonth[1] === 0) {
        return [0, 'Empty'];
    }

    let balanceMaxSum = bestMonth[1];
    let balanceMaxMonth = moment(bestMonth[0], "MMYYYY").format("MMM YYYY");
    return [balanceMaxSum, balanceMaxMonth]
}

BalanceModel.prototype.getBalanceChartData = function (isCurrentMonthEmpty) {

    let balanceChartArray = [["month"]];
    for (let source in this.sources) {
        balanceChartArray[0].push(this.sources[source].name);
    }

    let chart_data = this.months.map((month) => {
        let month_time = moment(month, "MMYYYY");
        let chartMonthData = [month_time.format("MMM YYYY")];

        if (isCurrentMonthEmpty && month_time.isSame(moment(), 'month')) {
            return null;
        }

        for (let sourceId in this.sources) {
            let source = this.sources[sourceId];
            if (!source.months.hasOwnProperty(month)) {
                chartMonthData.push('0');
            }
            let current_rates = getLastMothRates(this.rates, month);
            let val = convertCurrency(source['currency'], this.defaultCurrency, source.months[month], current_rates);

            chartMonthData.push(val);
        }
        return chartMonthData;
    }).filter((month_data) => month_data);

    balanceChartArray.push(...chart_data);

    return balanceChartArray
}

BalanceModel.prototype.getBalancePieChartData = function (lastUnEmptyMonth) {
    let balancePieChartArray = [["Source", "Sum"]];
    for (let sourceId in this.sources) {
        let source = this.sources[sourceId];
        let value = source.months[lastUnEmptyMonth];
        if (value) {
            let current_rates = getLastMothRates(this.rates, lastUnEmptyMonth);
            let converted_value = convertCurrency(source['currency'], this.defaultCurrency, value, current_rates);
            balancePieChartArray.push([source.name, converted_value])
        }
    }
    return balancePieChartArray;
}

BalanceModel.prototype.getBalanceDiffChartData = function (isCurrentMonthEmpty) {
    let chartPartNames = [['month', 'diff']];

    let prevMonthSum = null;
    for (let month of this.months) {
        let month_time = moment(month, "MMYYYY");

        if (isCurrentMonthEmpty && month_time.isSame(moment(), 'month')) {
            continue;
        }

        let monthsSum = 0;
        for (let sourceId in this.sources) {
            let source = this.sources[sourceId];
            if (!source.months.hasOwnProperty(month)) {
                continue;
            }
            let current_rates = getLastMothRates(this.rates, month);
            monthsSum += convertCurrency(source['currency'], this.defaultCurrency, source.months[month], current_rates);
        }
        let diff = 0;
        if (prevMonthSum !== undefined) {
            diff = monthsSum - prevMonthSum;
        }
        prevMonthSum = monthsSum;

        chartPartNames.push([month_time.format("MMM YYYY"), diff])
    }
    return chartPartNames;
}

BalanceModel.prototype.getCostsChartData = function (incomes, isCurrentMonthEmpty) {
    let incomeByMonth = {};
    incomes.forEach(function (element) {
        let month = moment.unix(element.date).format("MMYYYY");
        if (!(month in incomeByMonth)) {
            incomeByMonth[month] = 0;
        }
        incomeByMonth[month] += element.sum;
    });

    let costsData = [
        [strings.month, strings.cost]
    ];

    let prevBalance = undefined;
    for (let month of this.months) {
        let month_time = moment(month, "MMYYYY");

        if (isCurrentMonthEmpty && month_time.isSame(moment(), 'month')) {
            continue;
        }

        let currentBalance = 0;
        for (let sourceId in this.sources) {
            let source = this.sources[sourceId];
            if (!source.months.hasOwnProperty(month)) {
                continue;
            }
            let current_rates = getLastMothRates(this.rates, month);
            currentBalance += convertCurrency(source['currency'], this.defaultCurrency, source.months[month], current_rates);
        }
        let currentIncome = incomeByMonth.hasOwnProperty(month) ? incomeByMonth[month] : 0;

        let currentCosts = 0;
        if (prevBalance !== undefined) {
            currentCosts = currentIncome - (currentBalance - prevBalance);
        }

        prevBalance = currentBalance;

        costsData.push(
            [month_time.format("MMM YYYY"), currentCosts]
        );
    }

    return costsData;
}

export {
    BalanceModel,
    getMonthsArray,
    convertSourceData,
}
