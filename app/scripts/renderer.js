const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;
const moment = require('moment');
const settingsView = require('../view/SettingsView');
const balanceView = require('../view/BalanceView');
const incomeView = require('../view/IncomeView');
const languages = require('../scripts/languages');
const renderFunctions = require('../scripts/renderFunctions');

let resizeTimeout;
window.onclick = clicksHandler;
window.onresize = resizeThrottler;

if (typeof google === 'undefined') {
    alert(languages.getText('no-internet'));
    throw new Error('no internet');
}

google.charts.load('45', {packages: ['corechart']});

ipcRenderer.on('error', function (event, data) {
  alert(data);
});

ipcRenderer.on('new-version', function (event, oldVersion, newVersion) {
  alert(languages.getTextWithPlaceholders('new-version', [oldVersion, newVersion]));
});

ipcRenderer.on('income-data', function (event, data) {
  incomeView.setData(data);
  balanceView.setIncomeData(data);
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

function init() {
  document.documentElement.innerHTML = languages.replacePlaceholders(document.documentElement.innerHTML);
  $('.js-tab').click(function () {
    renderFunctions.makeActive($(this).data('name'), incomeView, balanceView);
  });

  renderFunctions.makeActive('income', incomeView, balanceView);

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
    },
      (id, newName) => {
      ipcRenderer.send('rename-balance-source', id, newName);
    }
  );

  settingsView.preparePage((settings) => {
    ipcRenderer.send('update-settings', settings);
  });
}

function clicksHandler(e) {
    if (e.target.classList.contains('js-income-edit')) {
        incomeView.editClickHandler(e);
        return;
    }

    if (e.target.classList.contains('js-income-save')) {
        ipcRenderer.send('income-edit', incomeView.saveClickHandler(e));
        return;
    }

    if (e.target.classList.contains('js-income-delete')) {
        const row = event.target.closest('.js-income-row');
        const id = row.dataset.id.toString();
        ipcRenderer.send('income-delete', id);
    }

    if (e.target.tagName == 'A') {
        renderFunctions.onLinkClick(e, shell);
    }
}

function resizeThrottler() {
  if (!resizeTimeout) {
    resizeTimeout = setTimeout(function () {
      resizeTimeout = null;
      renderFunctions.actualResizeHandler(incomeView, balanceView);
    }, 250);
  }
}