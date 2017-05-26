const ipcRenderer = require('electron').ipcRenderer;
const IncomeView = require('../data/IncomeView.js');
const incomeView = new IncomeView();
const shell = require('electron').shell;
const Income = require('../models/income.js');

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

ipcRenderer.on('settings', function (event, data) {
    if (data.length == 0) {
        return
    }

    if (data.length > 1) {
        throw new Error("Settings error");
    }

    let settings = data[0];

    $('.js-settings-remind').prop("checked", settings.remind);
    $('.js-settings-email').val(settings.email);

});

ipcRenderer.on('income-data-inserted', function (event, incomeItem) {
    incomeView.insertIncome(incomeItem);
});

ipcRenderer.on('income-data-deleted', function (event, incomeId) {
    incomeView.deleteIncome(incomeId);
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
    });

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

        const incomeItem = new Income(moment(date), moment(month), parseInt(sum), type, contact, description);
        ipcRenderer.send('income-add', incomeItem);
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
        response.text("ok");
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
