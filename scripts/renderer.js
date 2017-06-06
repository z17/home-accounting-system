const ipcRenderer = require('electron').ipcRenderer;
const IncomeView = require('../controllers/IncomeView');
const SettingsView = require('../controllers/SettingsView');
const BalanceView = require('../controllers/BalanceView')
const shell = require('electron').shell;
const Income = require('../models/income');
const Settings = require('../models/settings');
const Balance = require('../models/balance.js');

const balanceView = new BalanceView();
const incomeView = new IncomeView();
const settingsView = new SettingsView();

google.charts.load("current", {packages: ['corechart']});

ipcRenderer.on('error', function (event, data) {
    alert(data);
});

ipcRenderer.on('income-data', function (event, data) {
    incomeView.setData(data);
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

ipcRenderer.on('balance-inserted', function (event, source) {
    balanceView.insertBalance(source);
});

ipcRenderer.on('balance-updated', function (event, query, source) {
    balanceView.updateBalance(query['id'], source);
});

ipcRenderer.on('balance-types', function (event, types) {
    balanceView.setBalance(types);
});

ipcRenderer.on('settings', function (event, data) {
    settingsView.setData(data);
});

ipcRenderer.on('settings-saved', function (event, data) {
    settingsView.updateData(data);
});

$(document).ready(function () {
    makeActive($('.js-tab.active'));

    $('a').click(onLinkClick);

    let activeIncomeEditing = false;
    let incomeEditingRow;

    $(document).click(function (e) {
        if (e.target.classList.contains('js-delete')) {
            let id = e.target.dataset.id.toString();
            ipcRenderer.send('income-delete', id);
            return;
        }

        function updateIncome() {
            if (!activeIncomeEditing) {
                return;
            }

            // todo: save result
            incomeEditingRow.find('.js-date').html(moment(incomeEditingRow.find('.js-add-date').val()).format('DD.MM.YYYY'));
            incomeEditingRow.find('.js-month').html(moment(incomeEditingRow.find('.js-add-month').val()).format('MMM YYYY'));
            incomeEditingRow.find('.js-sum').html(incomeEditingRow.find('.js-add-sum').val());
            incomeEditingRow.find('.js-payment-type').html(incomeEditingRow.find('.js-add-payment-type').val());
            incomeEditingRow.find('.js-contact').html(incomeEditingRow.find('.js-add-contact').val());
            incomeEditingRow.find('.js-description').html(incomeEditingRow.find('.js-add-description').val());

            activeIncomeEditing = false;
        }

        if ($(e.target).closest('.js-income-row').length != 0) {
            let row = $(e.target).closest('.js-income-row');

            if (activeIncomeEditing === true && row !== incomeEditingRow ) {
                updateIncome();
            }

            if (activeIncomeEditing === true) {
                return;
            }


            function copyField(elementClass, fieldClass) {
                let element = row.find(elementClass);
                let field = $(fieldClass).clone().val(element.text());
                element.html('').append(field);
            }

            function copyDateField(elementClass, fieldClass, format) {
                let element = row.find(elementClass);
                let time = element.data('time');
                let field = $(fieldClass).clone().val(moment.unix(time).format(format));
                element.html('').append(field);
            }

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

        if ((e.target.parentNode.className === 'updateBalance') && (e.target.type === 'submit')) {
            e.preventDefault();
            let month = e.target.parentNode.querySelector('select[name="month"]').value;
            let year = e.target.parentNode.querySelector('input[name="year"]').value;
            let value = e.target.parentNode.querySelector('input[name="balanceValue"]').value;
            month += '';
            month += year;
            let obj = {};
            obj[month] = value;
            ipcRenderer.send('balance-update', e.target.parentNode.id, obj);
        }
    });

    $('.js-tab').click(function () {
        makeActive($(this));
    });

    //Adding income
    $(".js-income-page .js-income-add").on('submit', function (e) {
        e.preventDefault();
        let date = $('.js-income-page input.js-add-date').val();
        let month = $('.js-income-page input.js-add-month').val();
        let sum = $('.js-income-page input.js-add-sum').val();
        let type = $('.js-income-page input.js-add-payment-type').val();
        let contact = $('.js-income-page input.js-add-contact').val();
        let description = $('.js-income-page input.js-add-description').val();
        if (date.length === 0 || month.length === 0 || sum.length === 0 || type.length === 0 || contact.length === 0) {
            alert("Error");
            return;
        }

        const incomeItem = new Income(moment(date), moment(month), parseInt(sum), type, contact, description);
        ipcRenderer.send('income-add', incomeItem);
    });

    //Adding balance source
    const balanceIncrement = document.querySelector('button[name="incrementsources"]');
    balanceIncrement.addEventListener('click', function () {
        const source = new Balance(document.getElementById('balancesource').value);
        ipcRenderer.send('balance-add', source);
    });

    $(".js-settings-button").click(function () {
        $(".js-settings-button").toggleClass("active");
        $(".js-settings-page").toggleClass("active");
    });

    $(".js-settings-form").on('submit', function (e) {
        e.preventDefault();

        let response = $('.js-settings-response');

        let remindFlag = $('.js-settings-remind').is(":checked");
        let remindEmail = $('.js-settings-email').val();

        if (remindFlag === true && remindEmail.length === 0) {
            response.text("Empty email");
            response.addClass("error");
            return;
        }

        let settings = new Settings(remindFlag, remindEmail);

        ipcRenderer.send('update-settings', settings);

        response.removeClass("error");
        response.text("");
    });

});

function onLinkClick(e) {
    if ($(this).attr('href') !== undefined) {
        e.preventDefault();
        shell.openExternal($(this).attr('href'));
    }
}

function makeActive(tab) {
    let name = tab.data('name');
    $('.js-page').removeClass('active');
    $('.js-tab').removeClass('active');
    tab.addClass('active');
    $('.js-page[data-name="' + name + '"]').addClass('active');

    switch (name) {
        case 'income':
            incomeView.reloadGraph();
            break;
        case 'balance':
            break;
        default:
            alert('Unknown tab name');
    }
}
