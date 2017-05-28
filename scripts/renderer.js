const ipcRenderer = require('electron').ipcRenderer;
const IncomeView = require('../controllers/IncomeView');
const SettingsView = require('../controllers/SettingsView');
const BalanceView = require('../controllers/BalanceView')
const shell = require('electron').shell;
const Income = require('../models/income.js');
const Balance = require('../models/balance.js');

const balanceView = new BalanceView();
const incomeView = new IncomeView();
const settingsView = new SettingsView();

google.charts.load("current", {packages: ['corechart']});

ipcRenderer.on('error', function (event, data) {
    alert(data);
});

ipcRenderer.on('income-data', function (event, data) {
    console.log(incomeView);
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

ipcRenderer.on('balance-inserted', function(event, source) {
    console.log(source);
    balanceView.insertBalance(source);
});

ipcRenderer.on('balance-updated', function(event, query, source) {
    console.log(source);
    balanceView.updateBalance(query['id'], source);
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

    $(document).click(function (e) {
      if (e.target.classList.contains('js-delete')) {
        // let row = e.target.closest('tr');
        let id = e.target.dataset.id.toString();
        // row.remove();
        ipcRenderer.send('income-delete', id);
      }
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
        if (date.length == 0 || month.length == 0 || sum.length == 0 || type.length == 0 || contact.length == 0) {
            alert("Error");
            return;
        }

        const incomeItem = new Income(moment(date), moment(month), parseInt(sum), type, contact, description);
        ipcRenderer.send('income-add', incomeItem);
    });
    //Adding balance source
    const balanceIncrement = document.querySelector('button[name="incrementsources"]');
    balanceIncrement.addEventListener('click', function() {
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

        if (remindFlag === true && remindEmail.length == 0) {
            response.text("Empty email");
            response.addClass("error");
            return;
        }

        let settings = {
            remind: remindFlag,
            email: remindEmail
        };

        ipcRenderer.send('update-settings', settings);

        response.removeClass("error");
        response.text("");
    });

});

function onLinkClick(e) {
    if ($(this).attr('href') != undefined) {
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
