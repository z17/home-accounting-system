'use strict';

function BalanceView() {
  this.data = {};
  return this;
}

BalanceView.prototype.addBalanceSource = function (source) {
    this.data[source.id] = {
        'name': source.name,
        'value': [],
    };
    this.addBalanceSourceToDOM(source);
};

BalanceView.prototype.addBalance = function(id, source) {
  if (typeof this.data[id] === 'undefined') {
    this.data[id] = {'value': []};
  }
  let key = Object.keys(source)[0];
  this.data[id]['value'][key] = source[key];
  this.updateDOM(id, source);
};

BalanceView.prototype.deleteBalance = function(id, month) {
  if (typeof this.data[id] === 'undefined') {
    throw new Error('this id does not exist');
  }
  delete this.data[id]['value'][month];
  this.reupdateDOM(id, month);
};

BalanceView.prototype.addBalanceSourceToDOM = function(source) {
  let section = document.createElement('SECTION');
  let h2 = document.createElement('H2');
  let remove = document.createElement('A');
  let form = document.createElement('FORM');
  let input = document.createElement('INPUT');
  let balanceVal = document.createElement('INPUT');
  let submit = document.createElement('INPUT');

  let id = source.id;
  this.data[id] = {};
  h2.dataset.id = source.id;

  form.className = 'addBalance';
  form.dataset.id = source.id;
  delete source.id;

  h2.textContent = source.name;
  this.data[id]['name'] = source.name;
  delete source.name;

  remove.className = 'delete-balance-item';

  h2.appendChild(remove);
  section.appendChild(h2);

  input.type = 'month';
  input.name = 'month';
  input.required = 'required';
  form.appendChild(input);


  balanceVal.type = 'number';
  balanceVal.name = 'balanceValue';
  balanceVal.placeholder = 'Enter balance for this month';
  balanceVal.required = 'required';
  form.appendChild(balanceVal);

  submit.type = 'submit';
  form.appendChild(submit);

  section.appendChild(form);
  document.querySelector('.balance-items').appendChild(section);

  this.data[id]['value'] = source;
  let months = Object.keys(source);
  if (months.length > 0) {
    for (let i = 0; i < months.length; i++) {
      let month = {};
      month[months[i]] = source[months[i]];
      this.updateDOM(id, month);
    }
  }
};

BalanceView.prototype.updateDOM = function(id, source) {
  let form = document.querySelector('form[data-id="'+id+'"');
  let section = form.parentNode;
  let month = Object.keys(source)[0].replace(/ /g, '');
  let value = source[month];
  let p = document.createElement('P');
  p.dataset.month = month;
  month = month.substr(0, 2) + '.' + month.substr(2);
  p.textContent = month + ' : ' + value;
  let deleteIcon = document.createElement('A');
  deleteIcon.className = 'delete-month-balance';
  deleteIcon.href = '#';
  p.appendChild(deleteIcon);
  section.insertBefore(p, form);
};

BalanceView.prototype.reupdateDOM = function(id, month) {
  let block = document.querySelector('h2[data-id="'+id+'"').parentNode;
  block.querySelector('p[data-month="'+month+'"]').remove();
};

BalanceView.prototype.setBalance = function (balanceSources) {
    let balanceview = this;
    balanceSources.forEach(balanceSource => {
      balanceview.addBalanceSourceToDOM(balanceSource);
    });
};

module.exports = BalanceView;
