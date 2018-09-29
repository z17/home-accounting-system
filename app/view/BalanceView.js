'use strict';

const functions = require('../scripts/functions');
const moment = require('moment');
let balanceView = null;
const languages = require('../scripts/languages');

function BalanceView() {
    this.data = {};
    this.dataByMonth = [];
    this.addBalanceFunction = undefined;
    this.removeBalanceFunction = undefined;
    this.incomeByMonth = {};
    balanceView = this;
    return this;
}

BalanceView.prototype.addBalanceSource = function (source) {
    this.data[source.id] = {
        'name': source.name,
        'value': source.value,
    };
    this.addBalanceSourceToDOM(source.id, source.name, []);
};

BalanceView.prototype.addBalance = function (id, month, sum) {
    if (typeof this.data[id] === 'undefined') {
        this.data[id] = {'value': []};
    }

    if (isMonthInDOM(id, month)) {
        this.updateSumDOM(id, month, sum);
    } else {
        this.addMonthDOM(id, month, sum);
    }
    this.data[id]['value'][month] = sum;

    this.dataByMonth = convertData(this.data);
    this.reloadGraph();
};

BalanceView.prototype.deleteBalance = function (id, month) {
    if (typeof this.data[id] === 'undefined') {
        throw new Error('this id does not exist');
    }
    this.data[id]['value'][month] = 0;
    this.updateSumDOM(id, month, 0);

    this.dataByMonth = convertData(this.data);
    this.reloadGraph();
};

BalanceView.prototype.addBalanceSourceToDOM = function (sourceId, sourceName, dataByMonth) {
    let section = document.createElement('SECTION');
    section.className = 'balance-source';
    let h2 = document.createElement('H2');
    let form = document.createElement('FORM');
    let monthInput = document.createElement('INPUT');
    let sumInput = document.createElement('INPUT');
    let submit = document.createElement('BUTTON');

    h2.dataset.id = sourceId;
    h2.className = 'balance-source-name js-balance-source-name';

    fillSourceName(sourceId, h2, sourceName);
    section.appendChild(h2);

    form.className = 'addBalance';
    form.dataset.id = sourceId;
    form.onsubmit = (e) => {
        onBalanceSubmit(e, this.addBalanceFunction);
    };

    monthInput.type = 'month';
    monthInput.name = 'month';
    monthInput.required = 'required';
    monthInput.className = 'js-balance-form-month month';
    monthInput.min = '1900-01';
    monthInput.max = '2100-01';
    monthInput.value = moment().format('YYYY-MM');
    form.appendChild(monthInput);

    sumInput.type = 'number';
    sumInput.name = 'balanceValue';
    sumInput.placeholder = 'Enter balance';
    sumInput.required = 'required';
    sumInput.className = 'js-balance-form-sum sum';
    form.appendChild(sumInput);

    submit.type = 'submit';
    submit.textContent = '+';
    form.appendChild(submit);

    section.appendChild(form);
    document.querySelector('.balance-items').appendChild(section);

    dataByMonth.forEach((month) => {
        this.addMonthDOM(sourceId, month.month.format('MMYYYY'), month.sum);
    });
};

BalanceView.prototype.addMonthDOM = function (id, month, sum) {
    let form = document.querySelector('form[data-id="' + id + '"');
    let section = form.parentNode;
    let p = document.createElement('P');
    p.className = 'balance-item';

    let monthTag = document.createElement('span');
    monthTag.className = 'month';
    monthTag.textContent = moment(month, "MMYYYY").format("MMM YYYY") + ':';

    let sumTag = document.createElement('span');
    sumTag.className = ' sum';
    sumTag.textContent = functions.numberWithSpaces(sum);
    p.dataset.month = month;
    p.appendChild(monthTag);
    let deleteIcon = document.createElement('span');
    deleteIcon.className = 'delete-month-balance';
    deleteIcon.onclick = (e) => {
        onDeleteClick(e, this.removeBalanceFunction);
    };
    p.appendChild(deleteIcon);
    p.appendChild(sumTag);
    section.insertBefore(p, form);
};

BalanceView.prototype.updateSumDOM = function (id, month, sum) {
    let block = document.querySelector('h2[data-id="' + id + '"').parentNode;
    block.querySelector('p[data-month="' + month + '"] span.sum').textContent = functions.numberWithSpaces(sum);
};

BalanceView.prototype.setBalance = function (balanceSources) {
    balanceSources.forEach(balanceSource => {
        this.data[balanceSource.id] = {
            name: balanceSource.name,
            value: balanceSource.value
        };
    });

    this.dataByMonth = convertData(this.data);

    let sourceIndex = 0;
    balanceSources.forEach(balanceSource => {
        let dataByMonthForCurrentSource = [];

        this.dataByMonth.forEach(month => {
            dataByMonthForCurrentSource.push(
                {
                    month: month.month,
                    sum: month.value[sourceIndex]
                }
            );
        });

        this.addBalanceSourceToDOM(balanceSource.id, balanceSource.name, dataByMonthForCurrentSource);

        sourceIndex++;
    });
};

BalanceView.prototype.reloadGraph = function () {
    let chartData = prepareDataForBalanceChart(this.data, this.dataByMonth);
    drawChart(chartData, 'js-balance-chart', {legend: {position: 'top'}});

    let chartDiffData = prepareDataForBalanceDiffChart(this.dataByMonth);
    drawChart(chartDiffData, 'js-balance-diff-chart');

    let costsChartData = prepareDataForCostsChart(this.dataByMonth, this.incomeByMonth);
    drawChart(costsChartData, 'js-costs-chart');

    let [pieData, lastMonth] = prepareDataForPieChart(this.data, this.dataByMonth);
    drawPieChart(pieData, lastMonth, 'js-balance-pie-chart');

    let lastMonthSum = pieData.reduce(function f(a, b) {
        return a + b[1];
    }, 0);
    document.getElementsByClassName('js-balance-sum')[0].innerHTML = functions.numberWithSpaces(lastMonthSum);
};

BalanceView.prototype.preparePage = function (addBalanceSourceFunction, addBalanceFunction, removeBalanceFunction, renameBalanceSourceFunction) {
    $('.js-balance-source-form').on('submit', (e) => {
        e.preventDefault();
        const source = {
            name: document.getElementById('balancesource').value,
            value: {},
        };
        addBalanceSourceFunction(source);
    });

    this.addBalanceFunction = addBalanceFunction;
    this.removeBalanceFunction = removeBalanceFunction;
    this.renameBalanceSourceFunction = renameBalanceSourceFunction;
};

BalanceView.prototype.setIncomeData = function (data) {
    let incomeByMonth = [];
    data.forEach((value) => {
        let monthStr = moment.unix(value.date).format("YYYY-MM");

        if (!incomeByMonth.hasOwnProperty(monthStr)) {
            incomeByMonth[monthStr] = value.sum;
        } else {
            incomeByMonth[monthStr] += value.sum;
        }
    });
    this.incomeByMonth = incomeByMonth;
};

function onBalanceSubmit(e, addBalanceFunction) {
    e.preventDefault();

    let id = e.target.dataset.id;
    let month = moment(e.target.querySelector('.js-balance-form-month').value).format("MMYYYY");
    let value = parseFloat(e.target.querySelector('.js-balance-form-sum').value);
    if (addBalanceFunction === undefined) {
        alert("error");
        return;
    }
    addBalanceFunction(id, month, value);
}

function onDeleteClick(e, removeBalanceFunction) {
    e.preventDefault();
    let element = e.target.parentNode.parentNode.getElementsByTagName('h2')[0];
    let id = element.dataset.id;
    let month = e.target.parentNode.dataset.month;
    if (removeBalanceFunction === undefined) {
        alert("error");
        return;
    }
    removeBalanceFunction(id, month);
}

function drawChart(chartData, chartId, options = {}) {
    google.charts.setOnLoadCallback(chart);

    let chart_options = {
        width: '100%',
        height: 400,
        legend: options.legend ? options.legend : 'none',
        bar: {groupWidth: '75%'},
        isStacked: true,
        vAxis: {
            minValue: 0
        }
    };

    function chart() {
        let data = google.visualization.arrayToDataTable(chartData);
        let view = new google.visualization.DataView(data);
        let chart = new google.visualization.ColumnChart(document.getElementById(chartId));
        chart.draw(view, chart_options);
    }
}

function drawPieChart(pieData, lastMonth, chartId) {
    google.charts.setOnLoadCallback(chart);

    function chart() {
        let data = google.visualization.arrayToDataTable([['','']].concat(pieData));

        let options = {
            width: '100%',
            height: 350,
            title: languages.getTextWithPlaceholders('balance-pie-chart-title', [lastMonth.format('MMM YYYY')]),
            pieSliceText: 'label',
        };

        let chart = new google.visualization.PieChart(document.getElementById(chartId));

        chart.draw(data, options);
    }
}

function prepareDataForCostsChart(balanceByMonth, incomeByMonth) {
    let prevBalance = undefined;
    let costsData = [
        [languages.getText('month'), languages.getText('cost')]
    ];

    for (let i = 0; i < balanceByMonth.length; i++) {
        let currentMonth = balanceByMonth[i];
        let currentBalance = currentMonth.value.reduce(function (total, val) {
            return total + val;
        });

        let monthStr = currentMonth.month.format('YYYY-MM');
        let currentIncome = incomeByMonth.hasOwnProperty(monthStr) ? incomeByMonth[monthStr] : 0;
        let currentCosts = prevBalance != undefined ? currentIncome - (currentBalance - prevBalance) : 0;
        costsData.push(
            [currentMonth.month.format('MMM YYYY'), currentCosts]
        );
        prevBalance = currentBalance;
    }

    costsData.push(
        [moment().format('MMM YYYY'), 0]
    );
    return costsData;
}

function prepareDataForBalanceChart(balanceData, dataByMonth) {
    let chartPartNames = ['month'];
    for (let source in balanceData) {
        if (!balanceData.hasOwnProperty(source)) {
            continue;
        }
        chartPartNames.push(balanceData[source].name);

    }
    chartPartNames.push({role: 'annotation'});

    let dataChart = [];

    dataByMonth.forEach((month) => {
        let chartMonthData = [month.month.format('MMM YYYY')];
        chartMonthData = chartMonthData.concat(month.value);
        chartMonthData.push('');
        dataChart.push(chartMonthData);
    });

    return [chartPartNames].concat(dataChart);
}

function prepareDataForBalanceDiffChart(dataByMonth) {
    let chartPartNames = ['month', 'diff'];

    let chartData = [];
    let prevMonthSum = undefined;
    for (let i = 0; i < dataByMonth.length; i++) {
        let currentMonthSum = dataByMonth[i].value.reduce((x, y) => x + y);
        let diff = 0;
        if (prevMonthSum !== undefined) {
            diff = currentMonthSum - prevMonthSum;
        }
        let monthName = dataByMonth[i].month.format('MMM YYYY');
        chartData.push([monthName, diff]);

        prevMonthSum = currentMonthSum;
    }
    return [chartPartNames].concat(chartData);
}

function prepareDataForPieChart(balanceData, dataByMonth) {
    let lastAddedMonth = null;
    for (let i = dataByMonth.length - 1; i >= 0; i--) {
        let monthData = dataByMonth[i];
        let isNotEmpty = true;
        isNotEmpty = monthData['value'].some(function (balance) {
            return balance != 0;
        });
        if (isNotEmpty) {
            lastAddedMonth = monthData;
            break;
        }
    }

    let data = [];

    let index = 0;
    for (let source in balanceData) {
        if (!balanceData.hasOwnProperty(source)) {
            continue;
        }
        data.push([balanceData[source].name, lastAddedMonth['value'][index]]);
        index++;
    }
    return [data, lastAddedMonth.month];
}

function convertData(balanceSources) {
    // todo: refactor this, to another return format: array of (month(string), values) instead of array(month(object), values)
    let firstMonth = moment().startOf('month');
    let lastMonth = moment().startOf('month');
    let currentMonth = moment().startOf('month');

    for (let balanceId in balanceSources) {
        if (!balanceSources.hasOwnProperty(balanceId)) {
            continue;
        }

        let currentSource = balanceSources[balanceId];
        let months = Object.keys(currentSource.value);
        let monthData = [];
        for (let i = 0; i < months.length; i++) {
            monthData.push(moment(months[i], "MMYYYY"));
        }

        [firstMonth, lastMonth] = functions.calcStartEndDates(firstMonth, lastMonth, monthData);
    }

    let data = [];

    let countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;
    let month = firstMonth;
    for (let i = 0; i < countMonths; i++) {
        let monthData = {
            month: month.clone(),
            value: []
        };

        let addedAnuValue = false;
        for (let balanceId in balanceSources) {
            if (!balanceSources.hasOwnProperty(balanceId)) {
                continue;
            }

            let currentSource = balanceSources[balanceId];
            if (currentSource.value[month.format("MMYYYY")] !== undefined) {
                monthData.value.push(currentSource.value[month.format("MMYYYY")]);
                addedAnuValue = true;
            } else {
                monthData.value.push(0);
            }
        }

        if (addedAnuValue === false && currentMonth.format("MMYYYY") === month.format("MMYYYY")) {
            continue;
        }
        data.push(monthData);

        month.add(1, 'M');
    }
    return data;
}

function isMonthInDOM(sourceId, monthStr) {
    let block = document.querySelector('h2[data-id="' + sourceId + '"').parentNode;
    return block.querySelector('p[data-month="' + monthStr + '"] span.sum') !== null
}

function fillSourceName(id, element, sourceName) {
    element.textContent = sourceName;
    let editBalance = document.createElement('span');
    editBalance.className = 'balance-edit js-balance-edit';
    editBalance.onclick = () => {
        let input = document.createElement('input');
        input.value = sourceName;
        input.className = 'balance-edit-input';
        let save = document.createElement('span');
        save.className = 'balance-edit-save';

        save.onclick = () => {
            if (sourceName !== input.value) {
                balanceView.renameBalanceSourceFunction(id, input.value);
                balanceView.data[id].name = input.value;
                balanceView.reloadGraph();
            }
            fillSourceName(id, element, input.value);
        };
        element.innerHTML = '';
        element.appendChild(input);
        element.appendChild(save);
    };

    element.appendChild(editBalance);
}

module.exports = new BalanceView();
