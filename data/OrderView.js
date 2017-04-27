const entities = require('../data/entities.js');
const OrderStatus = entities.OrderStatus;
const IncomeOrderPaymentType = entities.IncomeOrderPaymentType;

function OrderView() {
    this.data = [];
    this.dataByTypes = {
        title: "By Types",
        cols: ["Type", "Sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    };
    this.dataByContacts = {
        title: "By contacts",
        cols: ["Contact", "Sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    };
    this.onDeleteCallback = null;
    this.onLinkClickCallback = null;
    this.paymentData = {};
}

const orderView = new OrderView();

OrderView.prototype.setupView = function () {
    for (let property in OrderStatus) {
        if (OrderStatus.hasOwnProperty(property)) {
            $('.js-add-status').append($('<option>', {
                value: property,
                text: OrderStatus[property].name
            }));
        }
    }
};

OrderView.prototype.setData = function (data) {
    data.sort(function (a, b) {
        return a.month - b.month;
    });
    this.data = data;

    updateGraphData();

    insertOrdersData();
};

OrderView.prototype.setTypes = function (types) {
    $(".js-orders-page .js-add-type").autocomplete({
        source: types,
        minLength: 0,
    })
};

OrderView.prototype.setContacts = function (contacts) {
    $(".js-orders-page .js-add-contact").autocomplete({
        source: contacts,
        minLength: 0,
    });
};

OrderView.prototype.insertOrder = function (item) {
    this.data.push(item);
    updateGraphData();
    insertOrderToPage(item);
};

OrderView.prototype.setCallbacks = function (onDeleteCallback, onLinkClickCallback) {
    this.onDeleteCallback = onDeleteCallback;
    this.onLinkClickCallback = onLinkClickCallback;
};

OrderView.prototype.setPaymentData = function (data) {
    this.paymentData = data;
    updatePaymentData(data);
};

OrderView.prototype.updatePaymentData = function (type, item) {
    if (type != 'add' && type != 'delete') {
        alert('error type');
    }

    if (type == 'add') {
        if (this.paymentData[item.orderId] == undefined) {
            this.paymentData[item.orderId] = {
                payment: 0,
                prepayment: 0
            }
        }
        if (item.orderPaymentType == IncomeOrderPaymentType.PAYMENT.value) {
            this.paymentData[item.orderId].payment += item.sum;
        } else if (item.orderPaymentType == IncomeOrderPaymentType.PREPAYMENT.value) {
            this.paymentData[item.orderId].prepayment += item.sum;
        }

    }

    if (type == 'delete') {
        if (item.orderPaymentType == IncomeOrderPaymentType.PAYMENT.value) {
            this.paymentData[item.orderId].payment -= item.sum;
        } else if (item.orderPaymentType == IncomeOrderPaymentType.PREPAYMENT.value) {
            this.paymentData[item.orderId].prepayment -= item.sum;
        }
    }

    updatePaymentData(this.paymentData);
};

function insertOrdersData() {
    orderView.data.forEach(insertOrderToPage);
    updatePaymentData(orderView.paymentData)
}

function drawTypesDiagram() {
    draw(orderView.dataByTypes, '100%', '400', 'js-order-types-chart');
}


function drawContactsDiagram() {
    draw(orderView.dataByContacts, '100%', '400', 'js-order-contacts-chart');

}

function draw(chartData, width, height, chartId) {
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        let dataTable = prepareChartData(chartData);

        if (chartData.chart != null) {
            chartData.chart.draw(dataTable, chartData.chartOptions);
            chartData.chartData = dataTable;
            return
        }

        let options = {
            title: chartData.title,
            width: width,
            height: height,
            bar: {groupWidth: "95%"},
        };

        let chart = new google.visualization.PieChart(document.getElementById(chartId));
        chart.draw(dataTable, options);
    }
}


function insertOrderToPage(item) {
    let rowExample = $('.js-orders-page .js-row');
    let row = rowExample.clone();

    let link = item.link;
    if (item.link.length > 0) {
        link = '<a href="http://' + item.link + '">' + item.link + '</a>';
    }

    row.removeClass('js-row');
    row.addClass(OrderStatus[item.status].class);
    row.data('id', item.id);
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
    row.find('.js-status').text(OrderStatus[item.status].name);
    row.insertBefore(rowExample);

    row.find('.js-delete').click(onDeleteClick);
    row.find('a').click(orderView.onLinkClickCallback);
}

function updateGraphData() {
    orderView.dataByContacts.data = [];
    orderView.dataByTypes.data = [];

    orderView.data.forEach(function (item) {
        if (orderView.dataByContacts.data[item.contact] == undefined) {
            orderView.dataByContacts.data[item.contact] = item.sum;
        } else {
            orderView.dataByContacts.data[item.contact] += item.sum;
        }

        if (orderView.dataByTypes.data[item.type] == undefined) {
            orderView.dataByTypes.data[item.type] = item.sum;
        } else {
            orderView.dataByTypes.data[item.type] += item.sum;
        }
    });


    drawTypesDiagram();
    drawContactsDiagram();
}

function prepareChartData(chartData) {
    let data = [chartData.cols];
    for (let property in chartData.data) {
        if (chartData.data.hasOwnProperty(property)) {
            data.push([property, chartData.data[property]]);
        }
    }
    return google.visualization.arrayToDataTable(data);
}

function onDeleteClick() {
    // todo: are you sure?
    let row = $(this).closest('tr.row');
    let id = row.data('id');

    orderView.onDeleteCallback(id);

    row.remove();
    let deletedItemIndex = orderView.data.findIndex(function (e) {
        return e.id == id;
    });
    if (deletedItemIndex >= 0) {
        orderView.data.splice(deletedItemIndex, 1);
    }
    updateGraphData();
}

function updatePaymentData(data) {
    for (let property in data) {
        if (data.hasOwnProperty(property)) {
            let row = $('.js-orders-page tr.row').filter(function () {
                return $(this).data('id') == property;
            });
            row.find('.js-prepayment').text(data[property].prepayment);
            row.find('.js-payment').text(data[property].payment);
        }
    }
}

module.exports.OrderView = orderView;