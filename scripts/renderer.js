const ipcRenderer = require('electron').ipcRenderer;
const incomeView = require('../data/IncomeView.js').IncomeView;
const orderView = require('../data/OrderView').OrderView;
const Income = require('../data/entities.js').Income;
const Order = require('../data/entities.js').Order;
const OrderStatus = require('../data/entities.js').OrderStatus;

google.charts.load("current", {packages: ['corechart']});

orderView.setupView();

ipcRenderer.on('income-data', function (event, data) {
    incomeView.setData(data);
});

ipcRenderer.on('income-payment-types' ,function (event, data) {
    incomeView.setPaymentTypes(data);
});

ipcRenderer.on('income-contacts' ,function (event, data) {
    incomeView.setContacts(data);
});

ipcRenderer.on('orders-data', function (event, data) {
    orderView.setData(data);
});

ipcRenderer.on('order-types' ,function (event, data) {
    orderView.setTypes(data);
});

ipcRenderer.on('order-contacts' ,function (event, data) {
    orderView.setContacts(data);
});



$(document).ready(function () {
    $('a').click(orderView.onLinkClick);

    $('.js-tab').click(function () {
        let name = $(this).data('name');
        $('.js-page').removeClass('active');
        $('.js-tab').removeClass('active');
        $(this).addClass('active');
        $('.js-page[data-name="' + name + '"]').addClass('active');
    });

    $(".js-income-page .js-income-add").on('submit', function (e) {
        e.preventDefault();
        let date = $('.js-income-page input.js-add-date').val();
        let month = $('.js-income-page input.js-add-month').val();
        let sum = $('.js-income-page input.js-add-sum').val();
        let type = $('.js-income-page input.js-add-payment-type').val();
        let contact = $('.js-income-page input.js-add-contact').val();
        let description = $('.js-income-page input.js-add-description').val();
        if (date.length == 0 || month.length == 0 || sum.length == 0 || type.length == 0 || contact.length == 0 || description.length == 0) {
            alert("Error");
            return;
        }
        let data = new Income(moment(date), moment(month), parseInt(sum), type, contact, description);

        let result = ipcRenderer.sendSync('income-add', data);
        if (result) {
            incomeView.insertIncome(data);
        } else {
            alert("Unknown error");
        }
    });

    $(".js-orders-page .js-orders-add").on('submit', function (e) {
        e.preventDefault();
        let month = $('.js-orders-page input.js-add-month').val();
        let sum = $('.js-orders-page input.js-add-sum').val();
        let contact = $('.js-orders-page input.js-add-contact').val();
        let type = $('.js-orders-page input.js-add-type').val();
        let description = $('.js-orders-page input.js-add-description').val();
        let link = $('.js-orders-page input.js-add-link').val();
        let status = $('.js-orders-page select.js-add-status').val();
        if (month.length == 0 || sum.length == 0 || type.length == 0 || contact.length == 0 || description.length == 0 || status.length == 0 || OrderStatus[status] == undefined) {
            alert("Error");
            return;
        }

        let data = new Order(
            moment(month),
            parseInt(sum),
            0,
            0,
            0,
            contact,
            type,
            description,
            link,
            status);

        let result = ipcRenderer.sendSync('order-add', data);
        if (result) {
            orderView.insertOrder(data);
        } else {
            alert("Unknown error");
        }
    });
});


