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
    this.data[id] = {'value': []};
  }
  let key = Object.keys(source)[0];
  this.data[id]['value'][key] = source[key];
  this.updateDOM(id, source);
};
BalanceView.prototype.reupdateBalance = function(id, month) {
  if (typeof this.data[id] === 'undefined') {
    throw new Error('this id does not exist');
    return;
  }
  let key = month.replace(/\./g, '').replace(/ /g, '');
  delete this.data[id]['value'][key];
  this.reupdateDOM(id, key);
}
BalanceView.prototype.addBalanceSourceToDOM = function(source) {
  console.log(this);
  let section = document.createElement('SECTION');
  let h2 = document.createElement('H2');
  let remove = document.createElement('A');
  let form = document.createElement('FORM');
  let select = document.createElement('SELECT');
  let input = document.createElement('INPUT');
  let balanceVal = document.createElement('INPUT');
  let submit = document.createElement('INPUT');

  let id = source.id;
  this.data[id] = {};
  h2.id = source.id;
  form.className = "updateBalance";
  form.id = source.id;
  delete source.id;

  h2.textContent = source.name;
  this.data[id]['name'] = source.name;
  delete source.name;

  remove.className = 'delete-balance-item';

  h2.appendChild(remove);
  section.appendChild(h2);

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


  input.type = 'number';
  input.name = 'year';
  input.placeholder = 'Enter year(e.g. 2017)';
  input.required = 'required';
  form.appendChild(input);


  balanceVal.type = 'number';
  balanceVal.name = 'balanceValue'
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
  let form = document.querySelector('form[id="'+id+'"');
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
  let block = document.querySelector('h2#'+id).parentNode;
  block.querySelector('p[data-month="'+month+'"]').remove();
};

BalanceView.prototype.setBalance = function (balanceSources) {
    let balanceview = this;
    balanceSources.forEach(balanceSource => {
      balanceview.addBalanceSourceToDOM(balanceSource);
    });
};

module.exports = BalanceView;
