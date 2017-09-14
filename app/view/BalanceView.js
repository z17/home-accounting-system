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

    if (this.data[id].value.hasOwnProperty(month)) {
        this.updateSumDOM(id, month, sum);
    } else {
        this.addMonthDOM(id, month, sum);
    }
    this.data[id]['value'][month] = sum;
};

BalanceView.prototype.deleteBalance = function(id, month) {
  if (typeof this.data[id] === 'undefined') {
    throw new Error('this id does not exist');
  }
  this.data[id]['value'][month] = 0;
  this.updateSumDOM(id, month, 0);
};

BalanceView.prototype.addBalanceSourceToDOM = function (sourceId, sourceName, dataByMonth) {
    let section = document.createElement('SECTION');
    section.className = 'balance-source';
    let h2 = document.createElement('H2');
    let remove = document.createElement('A');
    let form = document.createElement('FORM');
    let monthInput = document.createElement('INPUT');
    let sumInput = document.createElement('INPUT');
    let submit = document.createElement('INPUT');

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
  block.querySelector('p[data-month="'+month+'"] span.sum').textContent = sum;
};

BalanceView.prototype.setBalance = function (balanceSources) {
    let firstMonth = moment().startOf('month');
    let lastMonth = moment().startOf('month');

    balanceSources.forEach(balanceSource => {
        let months = Object.keys(balanceSource.value);
        let monthData = [];
        for (let i = 0; i < months.length; i++) {
            monthData.push(moment(months[i], "MMYYYY"));
        }

        [firstMonth, lastMonth] = functions.calcStartEndDates(firstMonth, lastMonth, monthData);
    });

    let data = [];

    let countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;
    let currentMonth = firstMonth;
    for (let i = 0; i < countMonths; i++) {

        let monthData = {
            month : currentMonth.clone(),
            value : []
        };

        let str = '';
        balanceSources.forEach(balanceSource => {
            str += ', ' + balanceSource.name;
            if (balanceSource.value[currentMonth.format("MMYYYY")] !== undefined) {
                monthData.value.push(balanceSource.value[currentMonth.format("MMYYYY")]);
            } else {
                monthData.value.push(0);
            }
        });

        currentMonth.add(1, 'M');
        data.push(monthData);
    }

    this.dataByMonth = data;

    let sourceIndex = 0;
    balanceSources.forEach(balanceSource => {
        let dataByMonth = [];

        data.forEach(month => {
           dataByMonth.push(
               {
                   month : month.month,
                   sum : month.value[sourceIndex]
               }
           );
        });

        this.data[balanceSource.id] = {
            name : balanceSource.name,
            value : balanceSource.value
        };
        this.addBalanceSourceToDOM(balanceSource.id, balanceSource.name, dataByMonth);

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

module.exports = BalanceView;
