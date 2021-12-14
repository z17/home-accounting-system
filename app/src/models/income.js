import moment from "moment";

function Income(date, month, sum, paymentType, contact, description) {
    this.id = null;
    this.date = date;
    this.month = month;
    this.sum = sum;
    this.paymentType = paymentType;
    this.contact = contact;
    this.description = description;
}

function getChartsData(incomeArray) {
    let firstMonth = moment().startOf('month');
    let firstYear = moment().startOf('year');
    let lastMonth = moment().startOf('month');
    let lastYear = moment().startOf('year');
    if (incomeArray.length !== 0) {
        firstMonth = moment.unix(incomeArray[0]['month']).startOf('month');
        firstYear = moment.unix(incomeArray[0]['month']).startOf('year');
        lastMonth = moment.unix(incomeArray[incomeArray.length - 1]['month']).startOf('month');
        lastYear = moment.unix(incomeArray[incomeArray.length - 1]['month']).startOf('year');
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
        firstYear.add(1, 'Y');
    }

    incomeArray.forEach(function (element) {

        let month = moment.unix(element.month).format("MMM YYYY");
        dataSumByMonth[month] += element.sum;

        let year = moment.unix(element.month).format("YYYY");
        dataSumByYear[year] += element.sum;

        // если разница меньше нуля, значит анализируется месяц за прошлые годы
        let monthDiff = 12;

        let isCurrentYear = moment().format("YYYY") === year;
        if (isCurrentYear) {
            monthDiff = moment().month() + 1;
        } else if (year === firstYearStr) {
            monthDiff = firstYearMonthCount;
        }

        dataAverageByYear[year] += element.sum / monthDiff;
    });

    return [dataSumByMonth, dataSumByYear, dataAverageByYear]
}

function getIncomeSum(incomes) {
    let incomeSum = 0;
    incomes.forEach(function (element) {
        incomeSum += element.sum;
    });
    return incomeSum;
}

function getTopAndWorstValues(dataSumByMonth) {
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

function generateDataForPieChart(incomes, field, fieldTitles) {
    let map = incomes.reduce(
        (accumulator, item) => {
            if (accumulator.hasOwnProperty(item[field])) {
                accumulator[item[field]] += item.sum;
            } else {
                accumulator[item[field]] = item.sum;
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

export {
    Income,
    getChartsData,
    getIncomeSum,
    getTopAndWorstValues,
    generateDataForMonthChart,
    generateDataForYearChart,
    generateDataForAverageYearChart,
    generateDataForPieChart
}