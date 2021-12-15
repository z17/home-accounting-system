import moment from "moment";
import Utils from "../Utils";
import strings from "./lang";

function getMonthsArray(sourceData) {
    let anyMonth = moment().startOf('month');
    if (0 in sourceData && sourceData[0].value) {
        anyMonth = moment(Object.keys(sourceData[0].value)[0], "MMYYYY");
    }
    let firstMonth = anyMonth;
    let lastMonth = anyMonth;


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
            index: index
        };

        index++;
    }
    return sourcesInit;
}

function getBalanceSum(sources, months) {
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

    for (let source in sources) {
        let value = sources[source].months[lastUnEmptyMonth];
        if (value) {
            balanceSum += value;
        }
    }

    return [balanceSum, lastUnEmptyMonth];
}

function getBestMonth(sources, months) {
    let bestMonth = months.map((month) => {
        let sum = 0;
        for (let source in sources) {
            sum += sources[source].months.hasOwnProperty(month) ? sources[source].months[month] : 0;
        }
        return [month, sum];
    }).reduce((month1, month2) => {
        if (month1[1] < month2[1]) {
            month1 = month2;
        }
        return month1;
    }, ['', 0]);

    let balanceMaxSum = bestMonth[1];
    let balanceMaxMonth = moment(bestMonth[0], "MMYYYY").format("MMM YYYY");
    return [balanceMaxSum, balanceMaxMonth]
}

function getBalanceChartData(sources, months) {

    let balanceChartArray = [["month"]];
    for (let source in sources) {
        balanceChartArray[0].push(sources[source].name);
    }

    balanceChartArray.push(...months.map((month) => {
        let chartMonthData = [moment(month, "MMYYYY").format("MMM YYYY")];

        for (let source in sources) {
            let val = sources[source].months.hasOwnProperty(month) ? sources[source].months[month] : 0;
            chartMonthData.push(val);
        }
        return chartMonthData;
    }));

    return balanceChartArray
}

function getBalancePieChartData(sources, lastUnEmptyMonth) {
    let balancePieChartArray = [["Source", "Sum"]];
    for (let source in sources) {
        let value = sources[source].months[lastUnEmptyMonth];
        if (value) {
            balancePieChartArray.push([sources[source].name, value])
        }
    }
    return balancePieChartArray;
}

function getBalanceDiffChartData(sources, months) {
    let chartPartNames = [['month', 'diff']];

    let prevMonthSum = null;
    for (let month of months) {

        let monthsSum = 0;
        for (let source in sources) {
            monthsSum += sources[source].months.hasOwnProperty(month) ? sources[source].months[month] : 0;
        }
        let diff = 0;
        if (prevMonthSum !== undefined) {
            diff = monthsSum - prevMonthSum;
        }
        prevMonthSum = monthsSum;

        chartPartNames.push([moment(month, "MMYYYY").format("MMM YYYY"), diff])
    }
    return chartPartNames;
}

function getCostsChartData(sources, months, incomes) {
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
        let currentBalance = 0;
        for (let source in sources) {
            currentBalance += sources[source].months.hasOwnProperty(month) ? sources[source].months[month] : 0;
        }
        let currentIncome = incomeByMonth.hasOwnProperty(month) ? incomeByMonth[month] : 0;

        let currentCosts = 0;
        if (prevBalance !== undefined) {
            currentCosts = currentIncome - (currentBalance - prevBalance);
        }

        prevBalance = currentBalance;

        costsData.push(
            [moment(month, "MMYYYY").format("MMM YYYY"), currentCosts]
        );
    }

    costsData.push(
        [moment().format('MMM YYYY'), 0]
    );
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