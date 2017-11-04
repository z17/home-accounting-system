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
    ready('settings');
});

$(document).ready(function () {
    ready('document');
});

function ready(type) {
    if (type == 'settings') {
        this.settings = true;
    }

    if (type == 'document') {
        this.document = true;
    }

    if (this.settings && this.document) {
        start();
    }
}

function start() {
    document.documentElement.innerHTML = languages.replacePlaceholders(document.documentElement.innerHTML);

    makeActive('income');

    $('a').click(
        function (e) {
            if ($(this).attr('href') !== undefined) {
                e.preventDefault();
                shell.openExternal($(this).attr('href'));
            }
        }
    );

    let activeIncomeEditing = false;
    let incomeEditingRow;

    $(document).click(function (e) {
        if (e.target.classList.contains('js-delete')) {
            let id = e.target.dataset.id.toString();
            ipcRenderer.send('income-delete', id);
            return;
        }

        let updateIncome = () => {
            if (!activeIncomeEditing) {
                return;
            }

            const incomeItem = incomeView.getItemFromForm(incomeEditingRow);
            ipcRenderer.send('income-edit', incomeItem);

            activeIncomeEditing = false;
        };

        if ($(e.target).closest('.js-income-row').length !== 0) {
            let row = e.target.closest('.js-income-row');

            if (activeIncomeEditing === true && row !== incomeEditingRow) {
                updateIncome();
            }

            if (activeIncomeEditing === true) {
                return;
            }


            let copyField = (elementClass, fieldClass) => {
                let element = row.querySelector(elementClass);
                let field = document.querySelector(fieldClass).cloneNode(true);
                let val = element.innerHTML;
                if (field.type == 'number') {
                    val = parseFloat(val.replace(' ', ''));
                }
                field.value = val;
                element.innerHTML = '';
                element.appendChild(field);
            };

            let copyDateField = (elementClass, fieldClass, format) => {
                let element = row.querySelector(elementClass);
                let field = document.querySelector(fieldClass).cloneNode(true);
                let time = element.dataset.time;
                field.value = moment.unix(time).format(format);
                element.innerHTML = '';
                element.appendChild(field);
            };

            copyDateField('.js-date', '.js-add-date', "YYYY-MM-DD");
            copyDateField('.js-month', '.js-add-month', "YYYY-MM");
            copyField('.js-sum', '.js-add-sum');
            copyField('.js-payment-type', '.js-add-payment-type');
            copyField('.js-contact', '.js-add-contact');
            copyField('.js-description', '.js-add-description');

            activeIncomeEditing = true;
            incomeEditingRow = row;
            return;
        }

        updateIncome();

    });

    $('.js-tab').click(function () {
        makeActive($(this).data('name'));
    });

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

(function () {
    window.addEventListener("resize", resizeThrottler, false);

    let resizeTimeout;

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
}());