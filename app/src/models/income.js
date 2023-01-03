import moment from "moment";
import {convertCurrency, getNearestRates} from "./Currency";


function IncomeModel(incomes, defaultCurrency, displayedCurrency, currencyRates) {
    this.incomes = incomes;
    this.displayedCurrency = displayedCurrency;
    this.defaultCurrency =  defaultCurrency;
    this.currencyRates = currencyRates;
}


function Income(date, month, sum, paymentType, contact, description) {
    this.id = null;
    this.date = date;
    this.month = month;
    this.sum = sum;
    this.paymentType = paymentType;
    this.contact = contact;
    this.description = description;
}

function getLastMonthTime(incomes) {
    let maxDate = incomes[0]['month'];
    for (let i = 0; i < incomes.length; i++) {
        if (incomes[i]['month'] > maxDate) {
            maxDate = incomes[i]['month']
        }
    }
    return maxDate
}

IncomeModel.prototype.getIncomeSum = function () {
    let incomeSum = 0;

    console.log('getIncomeSum')
    this.incomes.forEach((element) => {
        console.log(element);
        console.log(this.currencyRates);
        let rates = getNearestRates(this.currencyRates, element['date']);
        let convertedSum = convertCurrency(this.defaultCurrency, this.displayedCurrency, element.sum, rates);
        incomeSum += convertedSum;
    });
    return incomeSum;
};

IncomeModel.prototype.getChartsData = function () {
    let firstMonth = moment().startOf('month');
    let firstYear = moment().startOf('year');
    let lastMonth = moment().startOf('month');
    let lastYear = moment().startOf('year');
    if (this.incomes.length !== 0) {
        firstMonth = moment.unix(this.incomes[0]['month']).startOf('month');
        firstYear = moment.unix(this.incomes[0]['month']).startOf('year');
        // we need to find last month, because it can be not in the last element of array
        // example: when you add today new income (it will be the last element) for previous month
        let lastMonthTime = getLastMonthTime(this.incomes);
        lastMonth = moment.unix(lastMonthTime).startOf('month');
        lastYear = moment.unix(lastMonthTime).startOf('year');
    }

    let firstYearStr = firstYear.format('YYYY');
    let firstYearMonthCount = 12 - firstMonth.month();

    let countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;
    let countYears = lastYear.diff(firstYear, 'years', false) + 1;

    let dataSumByMonth = {};
    let dataSumByYear = {};
    let dataAverageByYear = {};
    for (let i = 0; i < countMonths; i++) {
        dataSumByMonth[firstMonth.format("MMM YYYY")] = 0;
        firstMonth.add(1, 'M');
    }

    for (let i = 0; i < countYears; i++) {
        dataSumByYear[firstYear.format("YYYY")] = 0;
        dataAverageByYear[firstYear.format("YYYY")] = 0;
        firstYear.add(1, 'year');
    }

    this.incomes.forEach((element) => {
        let rates = getNearestRates(this.currencyRates, element['date']);
        let sum = convertCurrency(this.defaultCurrency, this.displayedCurrency, element.sum, rates);
        let month = moment.unix(element.month).format("MMM YYYY");
        dataSumByMonth[month] += sum;

        let year = moment.unix(element.month).format("YYYY");
        dataSumByYear[year] += sum;

        // если разница меньше нуля, значит анализируется месяц за прошлые годы
        let monthDiff = 12;

        let isCurrentYear = moment().format("YYYY") === year;
        if (isCurrentYear) {
            monthDiff = moment().month() + 1;
        } else if (year === firstYearStr) {
            monthDiff = firstYearMonthCount;
        }

        dataAverageByYear[year] += sum / monthDiff;
    });

    return [dataSumByMonth, dataSumByYear, dataAverageByYear]
}

IncomeModel.prototype.getTopAndWorstValues = function (dataSumByMonth) {
    let incomeTopMonthValue = 0;
    let incomeTopMonthName = null;
    let incomeWorstMonthValue = 0;
    let incomeWorstMonthName = null;

    for (let property in dataSumByMonth) {
        if (dataSumByMonth.hasOwnProperty(property)) {
            if (incomeTopMonthValue < dataSumByMonth[property] || incomeTopMonthName === null) {
                incomeTopMonthValue = dataSumByMonth[property];
                incomeTopMonthName = property;
            }
            if (incomeWorstMonthValue > dataSumByMonth[property] || incomeWorstMonthName === null) {
                incomeWorstMonthValue = dataSumByMonth[property];
                incomeWorstMonthName = property;
            }
        }
    }
    return [incomeTopMonthValue, incomeTopMonthName, incomeWorstMonthValue, incomeWorstMonthName];
}


IncomeModel.prototype.generateDataForPieChart = function (field, fieldTitles) {
    let map = this.incomes.reduce(
        (accumulator, item) => {
            let rates = getNearestRates(this.currencyRates, item.date);
            let sum = convertCurrency(this.defaultCurrency, this.displayedCurrency, item.sum, rates);
            if (accumulator.hasOwnProperty(item[field])) {
                accumulator[item[field]] += sum;
            } else {
                accumulator[item[field]] = sum;
            }
            return accumulator;
        }, {}
    );

    let result = [fieldTitles];
    for (let type in map) {
        if (map.hasOwnProperty(type)) {
            result.push([type, map[type]]);
        }
    }
    return result;
}

function generateDataForMonthChart(dataSumByMonth) {
    let incomeByMonthsChartArray = [["Month", "Sum"]];
    for (let property in dataSumByMonth) {
        if (dataSumByMonth.hasOwnProperty(property)) {
            incomeByMonthsChartArray.push([property, dataSumByMonth[property]]);
        }
    }
    return incomeByMonthsChartArray;
}

function generateDataForYearChart(dataSumByYear) {
    let incomeByYearChartArray = [["Year", "Sum"]];
    for (let property in dataSumByYear) {
        if (dataSumByYear.hasOwnProperty(property)) {
            incomeByYearChartArray.push([property, dataSumByYear[property]])
        }
    }
    return incomeByYearChartArray;
}

function generateDataForAverageYearChart(dataAverageByYear) {
    let averageChartArray = [["Year", "Middle sum"]];
    for (let property in dataAverageByYear) {
        if (dataAverageByYear.hasOwnProperty(property)) {
            averageChartArray.push([property, dataAverageByYear[property]]);
        }
    }
    return averageChartArray;
}


export {
    Income,
    IncomeModel,
    generateDataForMonthChart,
    generateDataForYearChart,
    generateDataForAverageYearChart,
}
