const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');

ipcRenderer.on('income-data', function (event, data) {
    insertIncomeData(data);
});

ipcRenderer.on('orders-data', function (event, data) {
    insertOrdersData(data);
});

function insertIncomeData(data) {
    data.forEach(function (item) {
        var rowExample = $('.js-income-page .js-row');
        var row = rowExample.clone();
        row.removeClass('js-row');
        row.find('.js-date').text(item.date);
        row.find('.js-month').text(item.month);
        row.find('.js-sum').text(item.sum);
        row.find('.js-payment-type').text(item.paymentType);
        row.find('.js-contact').text(item.contact);
        row.find('.js-description').text(item.description);
        row.insertBefore(rowExample);
    });
}

function insertOrdersData(data) {
    data.forEach(function (item) {
        var rowExample = $('.js-orders-page .js-row');
        var row = rowExample.clone();
        row.removeClass('js-row');
        row.find('.js-month').text(item.month);
        row.find('.js-sum').text(item.sum);
        row.find('.js-prepayment').text(item.prepayment);
        row.find('.js-payment').text(item.payment);
        row.find('.js-expenses').text(item.expenses);
        row.find('.js-payment-type').text(item.paymentType);
        row.find('.js-contact').text(item.contact);
        row.find('.js-type').text(item.type);
        row.find('.js-description').text(item.description);
        row.find('.js-link').text(item.link);
        row.find('.js-status').text(item.status);
        row.insertBefore(rowExample);
    });
}

$(document).ready(function () {
    $('.js-tab').click(function () {
        var name = $(this).data('name');
        $('.js-page').removeClass('active');
        $('.js-tab').removeClass('active');
        $(this).addClass('active');
        $('.js-page[data-name="'+ name + '"]').addClass('active');
    });
});