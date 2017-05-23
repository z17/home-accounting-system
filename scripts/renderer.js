const ipcRenderer = require('electron').ipcRenderer;
const incomeView = require('../data/IncomeView.js');
incomeView.onDeleteCallback = onDeleteIncome; //TODO fix this shit
const shell = require('electron').shell;

google.charts.load("current", {packages: ['corechart']});

ipcRenderer.on('error', function (event, data) {
    alert(data);
});

ipcRenderer.on('income-data', function (event, data) {
    incomeView.setData(data);
});

ipcRenderer.on('income-payment-types' ,function (event, data) {
    incomeView.setPaymentTypes(data);
});

ipcRenderer.on('income-contacts' ,function (event, data) {
    incomeView.setContacts(data);
});

ipcRenderer.on('income-data-inserted', function (event, data) {
    incomeView.insertIncome(data);
});


$(document).ready(function () {
    makeActive($('.js-tab.active'));

    $('a').click(onLinkClick);

    $('.js-tab').click(function () {
        makeActive($(this));
    });

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

        const incomeItem = require('../models/income.js')(moment(date), moment(month), parseInt(sum), type, contact, description);

        ipcRenderer.send('income-add', incomeItem);
    });
});

function onLinkClick(e) {
    if ($(this).attr('href') != undefined) {
        e.preventDefault();
        shell.openExternal($(this).attr('href'));
    }
}

function onDeleteIncome(income) {
    ipcRenderer.send('income-delete', income.id);
    orderView.updatePaymentData('delete', income);
}

function makeActive(tab) {
    let name = tab.data('name');
    $('.js-page').removeClass('active');
    $('.js-tab').removeClass('active');
    tab.addClass('active');
    $('.js-page[data-name="' + name + '"]').addClass('active');

    switch(name) {
        case 'income':
            incomeView.reloadGraph();
            break;
        case 'balance':
            break;
        default:
            alert('Unknown tab name');
    }
}
