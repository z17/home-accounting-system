'use strict';

const functions = require('../scripts/functions');
const moment = require('moment');

function BalanceView() {
  this.data = {};
  return this;
}

BalanceView.prototype.addBalanceSource = function (source) {
    this.data[source.id] = {
        'name': source.name,
        'value': source.value,
    };
    this.addBalanceSourceToDOM(source);
};

BalanceView.prototype.addBalance = function (id, month, sum) {
    if (typeof this.data[id] === 'undefined') {
        this.data[id] = {'value': []};
    }

    if (this.data[id]['value'].hasOwnProperty(month)) {
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

BalanceView.prototype.addBalanceSourceToDOM = function(source) {
  let section = document.createElement('SECTION');
  section.className = 'balance-source';
  let h2 = document.createElement('H2');
  let remove = document.createElement('A');
  let form = document.createElement('FORM');
  let monthInput = document.createElement('INPUT');
  let sumInput = document.createElement('INPUT');
  let submit = document.createElement('INPUT');

  let id = source.id;
  this.data[id] = {};
  h2.dataset.id = source.id;

  form.className = 'addBalance';
  form.dataset.id = source.id;

  h2.textContent = source.name;
  this.data[id]['name'] = source.name;

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

    this.data[id]['value'] = source.value;
    let months = Object.keys(source.value);
    let data = [];
    for (let i = 0; i < months.length; i++) {
        data.push({
            time: moment(months[i], "MMYYYY"),
        });
    }

    data.sort((a, b) => {
        return a.time.unix() - b.time.unix();
    });

    // todo: check this moment at IncomeView and create common function for this
    let firstMonth = moment().startOf('month');
    let lastMonth = moment().startOf('month');

    if (lastMonth.isBefore(data[data.length - 1].time)) {
        lastMonth = data[data.length - 1].time;
    }
    if (firstMonth.isAfter(data[0].time)) {
        firstMonth = data[0].time;
    }

    let countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;
    let currentMonth = firstMonth;
    for (let i = 0; i < countMonths; i++) {
        let strMonth = currentMonth.format("MMYYYY");

        if (!source.value.hasOwnProperty(strMonth)) {
            source.value[strMonth] = 0;
        }
        this.addMonthDOM(id, strMonth, source.value[strMonth]);
        currentMonth.add(1, 'M');
    }
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
    let balanceview = this;
    balanceSources.forEach(balanceSource => {
      balanceview.addBalanceSourceToDOM(balanceSource);
    });
};

module.exports = BalanceView;
