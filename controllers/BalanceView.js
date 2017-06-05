'use strict';

function BalanceView() {
  this.data = {};
  return this;
}

BalanceView.prototype.insertBalance = function (source) {
    this.data[source.id] = {
        'name': source.name,
        'value': [],
    };
    this.addBalanceSourceToDOM(source);
};

BalanceView.prototype.updateBalance = function(id, source) {
  if (typeof this.data[id] === 'undefined') {
    throw new Error('Ops');
  }
  if (typeof this.data[id]['value'] === 'undefined') {
    this.data[id]['value'] = [];
  }
  this.data[id]['value'].push(source);
  this.updateDOM(id, source);
  // this.addBalanceSourceToDOM(source);
};

BalanceView.prototype.addBalanceSourceToDOM = function(source) {
  let section = document.createElement('SECTION');
  let h2 = document.createElement('H2');
  h2.textContent = source.name;
  section.appendChild(h2);
  if (typeof this.cachedForm === 'undefined'){
    let form = document.createElement('FORM');
    form.className = "updateBalance";
    let select = document.createElement('SELECT');
    select.name = 'month';
    select.required = 'required';
    for (let i = 0; i < 12; i++) {
      let month = i+1;
      let option = document.createElement('OPTION');
      option.textContent = i < 10?'0'+month:month;
      option.value = option.textContent;
      select.appendChild(option);
    }
    form.appendChild(select);
    let input = document.createElement('INPUT');
    input.type = 'number';
    input.name = 'year';
    input.placeholder = 'Enter year(e.g. 2017)';
    input.required = 'required';
    form.appendChild(input);
    let balanceVal = document.createElement('INPUT');
    balanceVal.type = 'number';
    balanceVal.name = 'balanceValue'
    balanceVal.placeholder = 'Enter balance for this month';
    balanceVal.required = 'required';
    form.appendChild(balanceVal);
    let submit = document.createElement('INPUT');
    submit.type = 'submit';
    form.appendChild(submit);
    this.cachedForm = form;
  }
  this.cachedForm.id = source.id;
  section.appendChild(this.cachedForm);
  document.querySelector('.balance-items').appendChild(section);
};

BalanceView.prototype.updateDOM = function(id, source) {
  let form = document.querySelector('form[id="'+id+'"');
  let section = form.parentNode;
  let month = Object.keys(source)[0];
  let value = source[month];
  month = month.substr(0, 2) + '.' + month.substr(2);
  let p = document.createElement('P');
  p.textContent = month + ' : ' + value;
  section.insertBefore(p, form);
};

BalanceView.prototype.setBalance = function (types) {
    let _this = this;
    types.forEach(function (type) {
        _this[type.id] = type;
        _this.addBalanceSourceToDOM(type);
    });
};

module.exports = BalanceView;
