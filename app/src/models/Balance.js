import moment from "moment";
import Utils from "../Utils";
import strings from "./lang";
import {convertCurrency, getLastMothRates} from "./Currency";

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

function getBalanceSum(sources, months, rates, defaultCurrency) {
    let balanceSum = 0;
    // search last unempty months
    let lastUnEmptyMonth = null;
    for (let month of months.slice().reverse()) {
        for (let source in sources) {
            if (sources[source].months.hasOwnProperty(month)) {
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

    const lastMonthRates = getLastMothRates(rates, lastUnEmptyMonth);
    for (let sourceId in sources) {
        let source = sources[sourceId];
        let value = source.months[lastUnEmptyMonth];
        if (value) {
            let convertedSum = convertCurrency(source['currency'], defaultCurrency, value, lastMonthRates);
            balanceSum += convertedSum;
        }
    }

    return [balanceSum, lastUnEmptyMonth, isCurrentMonthEmpty];
}

function getBestMonth(sources, months, rates, defaultCurrency) {
    let bestMonth = months.map((month) => {
        let sum = 0;
        for (let sourceId in sources) {
            let source = sources[sourceId];
            if (!source.months.hasOwnProperty(month)) {
                continue;
            }
            let source_value = source.months[month];
            let current_rates = getLastMothRates(rates, month);
            sum += convertCurrency(source['currency'], defaultCurrency, source_value, current_rates);
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

function getBalanceChartData(sources, months, isCurrentMonthEmpty, rates, defaultCurrency) {

    let balanceChartArray = [["month"]];
    for (let source in sources) {
        balanceChartArray[0].push(sources[source].name);
    }

    let chart_data = months.map((month) => {
        let month_time = moment(month, "MMYYYY");
        let chartMonthData = [month_time.format("MMM YYYY")];

        if (isCurrentMonthEmpty && month_time.isSame(moment(), 'month')) {
            return null;
        }

        for (let sourceId in sources) {
            let source = sources[sourceId];
            if (!source.months.hasOwnProperty(month)) {
                chartMonthData.push('0');
            }
            let current_rates = getLastMothRates(rates, month);
            let val = convertCurrency(source['currency'], defaultCurrency, source.months[month], current_rates);

            chartMonthData.push(val);
        }
        return chartMonthData;
    }).filter((month_data) => month_data);

    balanceChartArray.push(...chart_data);

    return balanceChartArray
}

function getBalancePieChartData(sources, lastUnEmptyMonth, rates, defaultCurrency) {
    let balancePieChartArray = [["Source", "Sum"]];
    for (let sourceId in sources) {
        let source = sources[sourceId];
        let value = source.months[lastUnEmptyMonth];
        if (value) {
            let current_rates = getLastMothRates(rates, lastUnEmptyMonth);
            let converted_value = convertCurrency(source['currency'], defaultCurrency, value, current_rates);
            balancePieChartArray.push([source.name, converted_value])
        }
    }
    return balancePieChartArray;
}

function getBalanceDiffChartData(sources, months, isCurrentMonthEmpty, rates, defaultCurrency) {
    let chartPartNames = [['month', 'diff']];

    let prevMonthSum = null;
    for (let month of months) {
        let month_time = moment(month, "MMYYYY");

        if (isCurrentMonthEmpty && month_time.isSame(moment(), 'month')) {
            continue;
        }

        let monthsSum = 0;
        for (let sourceId in sources) {
            let source = sources[sourceId];
            if (!source.months.hasOwnProperty(month)) {
                continue;
            }
            let current_rates = getLastMothRates(rates, month);
            monthsSum += convertCurrency(source['currency'], defaultCurrency, source.months[month], current_rates);
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

function getCostsChartData(sources, months, incomes, isCurrentMonthEmpty, rates, defaultCurrency) {
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
    for (let month of months) {
        let month_time = moment(month, "MMYYYY");

        if (isCurrentMonthEmpty && month_time.isSame(moment(), 'month')) {
            continue;
        }

        let currentBalance = 0;
        for (let sourceId in sources) {
            let source = sources[sourceId];
            if (!source.months.hasOwnProperty(month)) {
                continue;
            }
            let current_rates = getLastMothRates(rates, month);
            currentBalance += convertCurrency(source['currency'], defaultCurrency, source.months[month], current_rates);
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
    getMonthsArray,
    convertSourceData,
    getBalanceSum,
    getBestMonth,
    getBalanceChartData,
    getBalancePieChartData,
    getBalanceDiffChartData,
    getCostsChartData,
}
