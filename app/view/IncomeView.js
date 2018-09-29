const functions = require('../scripts/functions');
const Income = require('../models/income');
const moment = require('moment');
const languages = require('../scripts/languages');

function IncomeView() {
    this.data = {};
    this.dataByMonth = {
        cols: ["Month", "Sum"],
        data: null,
        chart: null,
        chartData: null,
        chartOptions: null,
    };
    this.dataByYear = {
        cols: ["Year", "Sum"],
        data: null,
        chart: null,
        chartData: null,
        chartOptions: null,
    };
    this.dataAverage = {
        cols: ["Year", "Middle sum"],
        data: null,
        chart: null,
        chartData: null,
        chartOptions: null,
    };
    this.sum = 0;
    this.average = 0;
    this.topMonth = {
        name: '',
        value: 0
    };
    this.worstMonth = {
        name: '',
        value: 0
    };
    this.paymentTypes = [];
    this.contacts = [];
    this.ready = false;
}

IncomeView.prototype.setData = function (data) {
    data.sort((a, b) => {
        return a.date - b.date;
    });
    this.data = data;
    insertIncomeData(data);
    updateGraphData(this);

    let paymentTypes = data.map(function (e) {
        return e.paymentType;
    });
    this.paymentTypes = paymentTypes.filter(functions.uniqueArrayFilter);

    let contacts = data.map(function (e) {
        return e.contact;
    });
    this.contacts = contacts.filter(functions.uniqueArrayFilter);

    if (this.ready) {
        setFieldsAutocomplete(this.paymentTypes, this.contacts);
    }

    this.reloadGraph();
};

IncomeView.prototype.insertIncome = function (item) {
    this.data.push(item);
    updateGraphData(this);
    this.reloadGraph();
    insertIncomeToPage(item);
};

IncomeView.prototype.deleteIncome = function (id) {
    let index = getIndexById(id, this.data);
    this.data.splice(index, 1);
    document.querySelector('tr[data-id="' + id + '"]').remove();

    updateGraphData(this);
    this.reloadGraph();
};

IncomeView.prototype.updateIncome = function (income) {
    let index = getIndexById(income.id, this.data);
    this.data[index] = income;

    let row = document.querySelector('.js-income-row[data-id="' + income.id + '"]');
    this.setRowFromItem(income, row);

    updateGraphData(this);
    this.reloadGraph();
};

IncomeView.prototype.reloadGraph = function () {
    if (this.dataByMonth.data === null || this.dataByYear === null || this.dataAverage === null || this.data === null) {
        return;
    }

    drawByMonth(this.dataByMonth);
    drawByYear(this.dataByYear);
    drawAverage(this.dataAverage);
    drawByType(this.data);
    drawByContact(this.data);
};

IncomeView.prototype.setRowFromItem = function (item, row) {
    setupIncomeRow(item, row);
};

IncomeView.prototype.preparePage = function (addIncomeFunction) {
    $('.js-add-month').val(moment().format("YYYY-MM"));
    $('.js-add-date').val(moment().format("YYYY-MM-DD"));

    $(".js-income-page .js-income-add").on('submit', (e) => {
        e.preventDefault();
        const incomeItem = getItemFromForm(document.querySelector('.js-income-page .form'));
        addIncomeFunction(incomeItem);
    });
    this.ready = true;

    setFieldsAutocomplete(this.paymentTypes, this.contacts);
};

IncomeView.prototype.editClickHandler = function (event) {
    const row = event.target.closest('.js-income-row');

    const fields = [
        [row,
            ".js-date",
            ".js-add-date",
            {format: "YYYY-MM-DD"}
        ],
        [
            row,
            ".js-month",
            ".js-add-month",
            {format: "YYYY-MM"}
        ],
        [row, ".js-sum", ".js-add-sum"],
        [row, ".js-payment-type", ".js-add-payment-type"],
        [row, ".js-contact", ".js-add-contact"],
        [row, ".js-description", ".js-add-description"]
    ];

    fields.forEach(copyField);
    row.className += ' update';
    setFieldsAutocomplete(this.paymentTypes, this.contacts);
};

IncomeView.prototype.saveClickHandler = function (event) {
    const row = event.target.closest('.js-income-row');
    return getItemFromForm(row);
};

function drawByMonth(dataByMonth) {
    draw(dataByMonth, '100%', 400, "js-income-month-chart");
}

function drawByYear(dataByYear) {
    draw(dataByYear, '100%', 300, "js-income-year-chart");
}

function drawAverage(dataAverage) {
    draw(dataAverage, '100%', 300, "js-income-average-chart");
}

function drawByType(data){
    let chartData = preparePieChartDataByField(data, 'paymentType');
    drawPie(chartData, 'js-income-by-types-chart')
}

function drawByContact(data) {
    let chartData = preparePieChartDataByField(data, 'contact');
    drawPie(chartData, 'js-income-by-contacts-chart')
}

function preparePieChartDataByField(data, field) {
    let map = data.reduce(
        (accumulator, item) => {
            if (accumulator.hasOwnProperty(item[field])) {
                accumulator[item[field]] += item.sum;
            } else {
                accumulator[item[field]] = item.sum;
            }
            return accumulator;
        }, {}
    );

    let result = [];
    for (let type in map) {
        if (map.hasOwnProperty(type)) {
            result.push([type, map[type]]);
        }
    }
    return result;
}

function draw(chartData, width, height, chartId) {
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        let dataTable = prepareChartData(chartData);
        if (chartData.chart !== null) {
            chartData.chart.draw(dataTable, chartData.chartOptions);
            chartData.chartData = dataTable;
            return
        }

        let view = new google.visualization.DataView(dataTable);

        let options = {
            width: width,
            height: height,
            bar: {groupWidth: "95%"},
            legend: {position: "none"},
            animation: {
                duration: 500,
                easing: 'out',
            },
            vAxis: {
                minValue: 0
            }
            // chartArea: {
            //     width: '80%',
            //     height: '80%'
            // }
        };
        let chart = new google.visualization.ColumnChart(document.getElementById(chartId));
        chart.draw(view, options);

        chartData.chart = chart;
        chartData.chartData = dataTable;
        chartData.chartOptions = options;
    }
}

function drawPie(pieData, chartId) {
    google.charts.setOnLoadCallback(chart);

    function chart() {
        let data = google.visualization.arrayToDataTable([['','']].concat(pieData));

        let sliceVisibilityThreshold = 0;
        if (pieData.length > 8) {
            sliceVisibilityThreshold = 0.05
        }
        let options = {
            width: '100%',
            height: 350,
            pieSliceText: 'label',
            sliceVisibilityThreshold: sliceVisibilityThreshold,
        };

        let chart = new google.visualization.PieChart(document.getElementById(chartId));

        chart.draw(data, options);
    }
}

function insertIncomeData(data) {
    data.forEach(insertIncomeToPage);
}

function updateGraphData(incomeItem) {
    let data = incomeItem.data;

    let firstMonth = moment().startOf('month');
    let firstYear = moment().startOf('year');
    let lastMonth = moment().startOf('month');
    let lastYear = moment().startOf('year');
    if (data.length !== 0) {
        firstMonth = moment.unix(data[0]['month']).startOf('month');
        firstYear = moment.unix(data[0]['month']).startOf('year');
        lastMonth = moment.unix(data[data.length - 1]['month']).startOf('month');
        lastYear = moment.unix(data[data.length - 1]['month']).startOf('year');
    }
    let firstYearStr = firstYear.format('YYYY');
    let firstYearMonthCount = 12 - firstMonth.month();

    let countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;
    let countYears = lastYear.diff(firstYear, 'years', false) + 1;

    let dataByMonth = {};
    let dataByYear = {};
    let dataAverage = {};
    for (let i = 0; i < countMonths; i++) {
        dataByMonth[firstMonth.format("MMM YYYY")] = 0;
        firstMonth.add(1, 'M');
    }

    for (let i = 0; i < countYears; i++) {
        dataByYear[firstYear.format("YYYY")] = 0;
        dataAverage[firstYear.format("YYYY")] = 0;
        firstYear.add(1, 'Y');
    }

    incomeItem.sum = 0;
    data.forEach(function (element) {
        incomeItem.sum += element.sum;

        let month = moment.unix(element.month).format("MMM YYYY");
        dataByMonth[month] += element.sum;

        let year = moment.unix(element.month).format("YYYY");
        dataByYear[year] += element.sum;

        // если разница меньше нуля, значит анализируется месяц за прошлые годы
        let monthDiff = 12;

        let isPreviousYear = moment().format("YYYY") !== year;
        if (!isPreviousYear) {
            monthDiff = moment().month() + 1;
        } else if (year === firstYearStr) {
            monthDiff = firstYearMonthCount;
        }

        dataAverage[year] += element.sum / monthDiff;
    });

    incomeItem.dataByMonth.data = [];
    for (let property in dataByMonth) {
        if (dataByMonth.hasOwnProperty(property)) {
            if (incomeItem.topMonth.value < dataByMonth[property] || incomeItem.topMonth.name === '') {
                incomeItem.topMonth.value = dataByMonth[property];
                incomeItem.topMonth.name = property;
            }
            if (incomeItem.worstMonth.value > dataByMonth[property] || incomeItem.worstMonth.name === '') {
                incomeItem.worstMonth.value = dataByMonth[property];
                incomeItem.worstMonth.name = property;
            }
            incomeItem.dataByMonth.data.push({
                name: property,
                value: dataByMonth[property],
                time: moment(property, "MMM YYYY").unix()
            });
        }
    }

    incomeItem.dataByYear.data = [];
    for (let property in dataByYear) {
        if (dataByYear.hasOwnProperty(property)) {
            incomeItem.dataByYear.data.push({
                name: property,
                value: dataByYear[property],
                time: moment(property, "YYYY").unix()
            });
        }
    }

    incomeItem.dataAverage.data = [];
    for (let property in dataAverage) {
        if (dataAverage.hasOwnProperty(property)) {
            incomeItem.dataAverage.data.push({
                name: property,
                value: dataAverage[property],
                time: moment(property, "YYYY").unix()
            });
        }
    }

    incomeItem.dataByMonth.data.sort(function (a, b) {
        return a.time - b.time;
    });
    incomeItem.dataByYear.data.sort(function (a, b) {
        return a.time - b.time;
    });
    incomeItem.dataAverage.data.sort(function (a, b) {
        return a.time - b.time;
    });

    incomeItem.average = Math.round(incomeItem.sum / Object.keys(incomeItem.dataByMonth.data).length);
    document.getElementsByClassName('js-income-sum')[0].innerHTML = functions.numberWithSpaces(incomeItem.sum);
    document.getElementsByClassName('js-income-average')[0].innerHTML = functions.numberWithSpaces(incomeItem.average);
    document.getElementsByClassName('js-income-top')[0].innerHTML = functions.numberWithSpaces(incomeItem.topMonth.value);
    document.getElementsByClassName('js-income-worst')[0].innerHTML = functions.numberWithSpaces(incomeItem.worstMonth.value);
}

function prepareChartData(chartData) {
    let data = [chartData.cols];
    data = data.concat(chartData.data.map(function (element) {
        return [element.name, element.value];
    }));
    return google.visualization.arrayToDataTable(data);
}

function insertIncomeToPage(item) {
    let rowExample = document.querySelector('.js-income-page .js-row');
    let row = rowExample.cloneNode(true);
    setupIncomeRow(item, row);
    let rowParent = rowExample.parentNode;
    rowParent.insertBefore(row, rowExample);
}

function setupIncomeRow(item, row) {
    let id = item.id.toString();
    row.classList.remove('js-row');
    row.classList.remove('update');
    row.dataset.id = id;
    row.querySelector('.js-date').textContent = moment.unix(item.date).format("DD.MM.YYYY");
    row.querySelector('.js-date').dataset.time = item.date;
    row.querySelector('.js-month').textContent = moment.unix(item.month).format("MMM YYYY");
    row.querySelector('.js-month').dataset.time = item.month;
    row.querySelector('.js-sum').textContent = functions.numberWithSpaces(item.sum);
    row.querySelector('.js-payment-type').textContent = item.paymentType;
    row.querySelector('.js-contact').textContent = item.contact;
    row.querySelector('.js-description').textContent = item.description;
}

function getIndexById(id, data) {
    for (let i = 0; i < data.length; i++) {
        if (data[i]['id'] === id) {
            return i;
        }
    }
    return null;
}

function copyField([row, elementClass, fieldClass, options = {}]) {
    const {format} = options;
    const element = row.querySelector(elementClass);
    const field = document.querySelector(fieldClass).cloneNode(true);
    let val = element.innerHTML;
    if (field.type == 'number') {
        val = parseFloat(val.replace(' ', ''));
    }
    field.value = val;
    if (format !== undefined) {
        const time = element.dataset.time;
        field.value = moment.unix(time).format(format);
    }
    element.innerHTML = '';
    element.appendChild(field);
}

function getItemFromForm(row) {
    let date = row.querySelector('input.js-add-date').value;
    let month = row.querySelector('input.js-add-month').value;
    let sum = row.querySelector('input.js-add-sum').value;
    let type = row.querySelector('input.js-add-payment-type').value;
    let contact = row.querySelector('input.js-add-contact').value;
    let description = row.querySelector('input.js-add-description').value;
    if (date.length === 0 || month.length === 0 || sum.length === 0) {
        alert("Error");
        return;
    }
    let income = new Income(moment(date), moment(month), parseInt(sum), type, contact, description);
    let id = row.dataset.id;
    if (id !== undefined) {
        income.id = id;
    }
    return income;
}

function setFieldsAutocomplete(types, contacts) {
    if (contacts.length > 0) {
        setAutocomplete('.js-add-contact', contacts);
    }
    if (types.length > 0) {
        setAutocomplete('.js-add-payment-type', types);
    }
}

function setAutocomplete(jsClass, data) {
    $(".js-income-page " + jsClass).autocomplete({
        source: data,
        minLength: 0,
    });
}

module.exports = new IncomeView();
