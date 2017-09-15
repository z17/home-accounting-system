'use strict';

const functions = require('../scripts/functions');
const moment = require('moment');

function BalanceView() {
  this.data = {};
  this.dataByMonth = [];
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

BalanceView.prototype.deleteBalance = function(id, month) {
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
    let remove = document.createElement('A');
    let form = document.createElement('FORM');
    let monthInput = document.createElement('INPUT');
    let sumInput = document.createElement('INPUT');
    let submit = document.createElement('BUTTON');

    let id = sourceId;
    h2.dataset.id = sourceId;

    form.className = 'addBalance';
    form.dataset.id = sourceId;

    h2.textContent = sourceName;

    remove.className = 'delete-balance-item';

    h2.appendChild(remove);
    section.appendChild(h2);

    monthInput.type = 'month';
    monthInput.name = 'month';
    monthInput.required = 'required';
    monthInput.className = 'month';
    form.appendChild(monthInput);

    sumInput.type = 'number';
    sumInput.name = 'balanceValue';
    sumInput.placeholder = 'Enter balance';
    sumInput.required = 'required';
    sumInput.className = 'sum';
    form.appendChild(sumInput);

    submit.type = 'submit';
    submit.className = 'submit';
    submit.textContent = '+';
    form.appendChild(submit);

    section.appendChild(form);
    document.querySelector('.balance-items').appendChild(section);

    dataByMonth.forEach((month) => {
        this.addMonthDOM(id, month.month.format('MMYYYY'), month.sum);
    });
};

BalanceView.prototype.addMonthDOM = function(id, month, sum) {
  let form = document.querySelector('form[data-id="'+id+'"');
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
  let deleteIcon = document.createElement('A');
  deleteIcon.className = 'delete-month-balance';
  deleteIcon.href = '#';
  p.appendChild(deleteIcon);
  p.appendChild(sumTag);
  section.insertBefore(p, form);
};

BalanceView.prototype.updateSumDOM = function(id, month, sum) {
  let block = document.querySelector('h2[data-id="'+id+'"').parentNode;
  block.querySelector('p[data-month="'+month+'"] span.sum').textContent = functions.numberWithSpaces(sum);
};

BalanceView.prototype.setBalance = function (balanceSources) {
    balanceSources.forEach(balanceSource => {
        this.data[balanceSource.id] = {
            name : balanceSource.name,
            value : balanceSource.value
        };
    });

    this.dataByMonth = convertData(this.data);

    let sourceIndex = 0;
    balanceSources.forEach(balanceSource => {
        let dataByMonthForCurrentSource = [];

        this.dataByMonth.forEach(month => {
           dataByMonthForCurrentSource.push(
               {
                   month : month.month,
                   sum : month.value[sourceIndex]
               }
           );
        });

        this.addBalanceSourceToDOM(balanceSource.id, balanceSource.name, dataByMonthForCurrentSource);

        sourceIndex++;
    });
};

BalanceView.prototype.reloadGraph = function () {
    drawChart(this.data, this.dataByMonth);
};

function drawChart(balanceData, dataByMonth) {
    let chartData = prepareDataForChart(balanceData, dataByMonth);

    google.charts.setOnLoadCallback(drawBalanceChart);

    function drawBalanceChart() {
        let data = google.visualization.arrayToDataTable(chartData);

        let options = {
            width: '100%',
            height: 400,
            legend: {position: 'top', maxLines: 3},
            bar: {groupWidth: '75%'},
            isStacked: true,
        };

        let view = new google.visualization.DataView(data);

        let chart = new google.visualization.ColumnChart(document.getElementById('js-balance-chart'));
        chart.draw(view, options);
    }
}

function prepareDataForChart(balanceData, dataByMonth) {

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

function convertData(balanceSources) {
    let firstMonth = moment().startOf('month');
    let lastMonth = moment().startOf('month');

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
    let currentMonth = firstMonth;
    for (let i = 0; i < countMonths; i++) {

        let monthData = {
            month : currentMonth.clone(),
            value : []
        };

        for (let balanceId in balanceSources) {
            if (!balanceSources.hasOwnProperty(balanceId)) {
                continue;
            }

            let currentSource = balanceSources[balanceId];
            if (currentSource.value[currentMonth.format("MMYYYY")] !== undefined) {
                monthData.value.push(currentSource.value[currentMonth.format("MMYYYY")]);
            } else {
                monthData.value.push(0);
            }
        }

        currentMonth.add(1, 'M');
        data.push(monthData);
    }
    return data;
}

function isMonthInDOM(sourceId, monthStr) {
    let block = document.querySelector('h2[data-id="'+sourceId+'"').parentNode;
    return block.querySelector('p[data-month="'+monthStr+'"] span.sum') !== null
}

module.exports = BalanceView;
