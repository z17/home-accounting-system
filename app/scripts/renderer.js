const ipcRenderer = require('electron').ipcRenderer;
const IncomeView = require('../view/IncomeView');
const SettingsView = require('../view/SettingsView');
const BalanceView = require('../view/BalanceView');
const shell = require('electron').shell;
const moment = require('moment');
const Languages = require('../scripts/languages');

const balanceView = new BalanceView();
const incomeView = new IncomeView();
const settingsView = new SettingsView();
const languages = new Languages();

let incomeEditingRow;
let resizeTimeout;

if (typeof google === 'undefined') {
    alert(languages.getText('no-internet'));
    throw new Error('no internet');
}

google.charts.load("current", {packages: ['corechart']});

ipcRenderer.on('error', function (event, data) {
  alert(data);
});

ipcRenderer.on('income-data', function (event, data) {
  incomeView.setData(data);
  balanceView.setIncomeData(data);
});

ipcRenderer.on('income-payment-types', function (event, data) {
  incomeView.setPaymentTypes(data);
});

ipcRenderer.on('income-contacts', function (event, data) {
  incomeView.setContacts(data);
});

ipcRenderer.on('income-data-inserted', function (event, incomeItem) {
  incomeView.insertIncome(incomeItem);
});

ipcRenderer.on('income-data-deleted', function (event, incomeId) {
  incomeView.deleteIncome(incomeId);
});

ipcRenderer.on('income-edited', function (event, income) {
  incomeView.updateIncome(income);
});

ipcRenderer.on('balance-inserted', function (event, source) {
  balanceView.addBalanceSource(source);
});

ipcRenderer.on('balance-updated', function (event, id, month, sum) {
  balanceView.addBalance(id, month, sum);
});

ipcRenderer.on('balance-reupdated', function (event, id, month) {
  balanceView.deleteBalance(id, month);
});

ipcRenderer.on('balance-types', function (event, types) {
  balanceView.setBalance(types);
});

ipcRenderer.on('settings-saved', function (event, data) {
  settingsView.updateData(data);
});

ipcRenderer.on('settings', function (event, data) {
  languages.setLanguage(data.language);
  settingsView.setData(data);
  init();
});

window.onclick = clicksHandler;

window.onresize = resizeThrottler;

$('a').click(onLinkClick);


function init() {
  document.documentElement.innerHTML = languages.replacePlaceholders(document.documentElement.innerHTML);
  $('.js-tab').click(function () {
    makeActive($(this).data('name'));
  });
  makeActive('income');

  incomeView.preparePage((incomeItem) => {
    ipcRenderer.send('income-add', incomeItem);
  });

  balanceView.preparePage(
    (source) => {
      ipcRenderer.send('balance-add', source);
    },
    (id, month, value) => {
      ipcRenderer.send('balance-update', id, month, value);
    },
    (id, month) => {
      ipcRenderer.send('balance-month-remove', id, month);
    }
  );

  settingsView.preparePage((settings) => {
    ipcRenderer.send('update-settings', settings);
  });
}

function clicksHandler(e) {
  if (e.target.classList.contains('js-delete')) {
    const id = e.target.dataset.id.toString();
    return ipcRenderer.send('income-delete', id);
  }

  const row = e.target.closest('.js-income-row');
  if ((row === null) || (row === incomeEditingRow)) {
    return;
  }

  if (incomeEditingRow !== undefined) {
    const incomeItem = incomeView.getItemFromForm(incomeEditingRow);
    ipcRenderer.send('income-edit', incomeItem);
    incomeEditingRow = undefined;
  }

  const copyField = ({ elementClass, fieldClass, options = {} }) => {
    const { format } = options;
    const element = row.querySelector(elementClass);
    const field = document.querySelector(fieldClass).cloneNode(true);
    let val  = element.innerHTML;
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
  };

  const fields = [{
      elementClass: ".js-date",
      fieldClass: ".js-add-date",
      options: { format: "YYYY-MM-DD" }
    },
    {
      elementClass: ".js-month",
      fieldClass: ".js-add-month",
      options: { format: "YYYY-MM" }
    },
    { elementClass: ".js-sum", fieldClass: ".js-add-sum" },
    { elementClass: ".js-payment-type", fieldClass: ".js-add-payment-type" },
    { elementClass: ".js-contact", fieldClass: ".js-add-contact" },
    { elementClass: ".js-description", fieldClass: ".js-add-description" }];

  fields.forEach(copyField);
  incomeEditingRow = row;
}

function onLinkClick(e) {
  if ($(this).attr('href') !== undefined) {
    e.preventDefault();
    shell.openExternal($(this).attr('href'));
  }
}

function makeActive(tabName) {
  $('.js-page').removeClass('active');
  $('.js-tab').removeClass('active');
  $('.js-tab[data-name=' + tabName + ']').addClass('active');
  $('.js-page[data-name="' + tabName + '"]').addClass('active');
  reloadGraph(tabName);
}

function reloadGraph(tabName) {
  switch (tabName) {
    case 'income':
      incomeView.reloadGraph();
      break;
    case 'balance':
      balanceView.reloadGraph();
      break;
    default:
      alert('Unknown tab name: ' + name);
  }
}

function resizeThrottler() {
  if (!resizeTimeout) {
    resizeTimeout = setTimeout(function () {
      resizeTimeout = null;
      actualResizeHandler();
    }, 250);
  }
}

function actualResizeHandler() {
  let name = $('.js-tab.active').data('name');
  reloadGraph(name);
}
