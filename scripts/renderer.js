const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');
const incomeView = require('../data/IncomeView.js').IncomeView;
const orderView = require('../data/OrderView').OrderView;
const Income = require('../data/entities.js').Income;
const Order = require('../data/entities.js').Order;
const OrderStatus = require('../data/entities.js').OrderStatus;
const shell = require('electron').shell;

google.charts.load("current", {packages: ['corechart']});

orderView.setupView();

ipcRenderer.on('income-data', function (event, data) {
    incomeView.setData(data);
    insertIncomeData();
});

ipcRenderer.on('orders-data', function (event, data) {
    insertOrdersData(data);
});

function insertIncomeData() {
    incomeView.getData().forEach(function (item) {
        let rowExample = $('.js-income-page .js-row');
        let row = rowExample.clone();
        row.removeClass('js-row');
        row.find('.js-date').text(moment.unix(item.date).format("DD.MM.YYYY"));
        row.find('.js-month').text(moment.unix(item.month).format("MMM YYYY"));
        row.find('.js-sum').text(item.sum);
        row.find('.js-payment-type').text(item.paymentType);
        row.find('.js-contact').text(item.contact);
        row.find('.js-description').text(item.description);
        row.insertBefore(rowExample);
    });

    incomeView.drawByMonth();
    incomeView.drawByYear();
    incomeView.drawAverage();

    $('.js-income-sum').text(incomeView.sum);
    $('.js-income-average').text(incomeView.average);
    $('.js-income-top').text(incomeView.topMonth.value);
    $('.js-income-worst').text(incomeView.worstMonth.value);
}

function insertOrdersData(data) {
    data.forEach(function (item) {
        let rowExample = $('.js-orders-page .js-row');
        let row = rowExample.clone();

        let link = item.link;
        if (item.link.length > 0) {
            link = '<a href="' + item.link + '">' + item.link + '</a>';
        }

        row.removeClass('js-row');
        row.find('.js-month').text(moment.unix(item.month).format("MMM YYYY"));
        row.find('.js-sum').text(item.sum);
        row.find('.js-prepayment').text(item.prepayment);
        row.find('.js-payment').text(item.payment);
        row.find('.js-expenses').text(item.expenses);
        row.find('.js-payment-type').text(item.paymentType);
        row.find('.js-contact').text(item.contact);
        row.find('.js-type').text(item.type);
        row.find('.js-description').text(item.description);
        row.find('.js-link').html(link);
        row.find('.js-status').text(item.status);
        row.insertBefore(rowExample);
    });
}

$(document).ready(function () {

    $('a').click(function (e) {
        if ($(this).attr('href') != undefined) {
            shell.openExternal($(this).attr('href'));
        }
        e.preventDefault();
    });

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
            alert("Saved");
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
        if (month.length == 0 || sum.length == 0 || type.length == 0 || contact.length == 0 || description.length == 0 || link.length == 0 || status.length == 0 || OrderStatus[status] == undefined) {
            alert("Error");
            return;
        }

        let data = new Order(
            moment(month),
            parseInt(sum),
            0,
            0,
            0,
            type,
            contact,
            description,
            link,
            status);

        let result = ipcRenderer.sendSync('order-add', data);
        if (result) {
            alert("Saved");
        } else {
            alert("Unknown error");
        }
    });
});


