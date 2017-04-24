const ipcRenderer = require('electron').ipcRenderer;

const OrderStatus = require('../data/entities.js').OrderStatus;
const shell = require('electron').shell;

let OrderView = {
    data: [],
    dataByTypes: {
        title: "By Types",
        cols: ["Type", "Sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    },
    dataByContacts: {
        title: "By contacts",
        cols: ["Contact", "Sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    },

    setupView: function () {
        for (let property in OrderStatus) {
            if (OrderStatus.hasOwnProperty(property)) {
                $('.js-add-status').append($('<option>', {
                    value: property,
                    text: OrderStatus[property].name
                }));
            }
        }
    },
    setData: function (data) {
        data.sort(function (a, b) {
            return a.month - b.month;
        });
        this.data = data;

        updateGraphData();

        this.insertOrdersData();
    },
    setTypes: function (types) {
        $(".js-orders-page .js-add-type").autocomplete({
            source: types,
            minLength: 0,
        });
    },
    setContacts: function (contacts) {
        $(".js-orders-page .js-add-contact").autocomplete({
            source: contacts,
            minLength: 0,
        });
    },
    insertOrdersData: function () {
        this.data.forEach(insertOrderToPage);
    },
    insertOrder: function (item) {
        this.data.push(item);
        updateGraphData();
        insertOrderToPage(item);
    },
    drawTypesDiagram: function () {
        this.draw(this.dataByTypes, '100%', '400', 'js-order-types-chart');
    },

    drawContactsDiagram: function () {
        this.draw(this.dataByContacts, '100%', '400', 'js-order-contacts-chart');

    },
    draw: function (chartData, width, height, chartId) {
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
    },

};

function onLinkClick(e) {
    if ($(this).attr('href') != undefined) {
        e.preventDefault();
        shell.openExternal($(this).attr('href'));
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
    row.find('.js-delete').click(onDeleteClick);
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

    row.find('.js-link a').click(onLinkClick);
}

function updateGraphData() {
    OrderView.dataByContacts.data = [];
    OrderView.dataByTypes.data = [];

    OrderView.data.forEach(function (item) {
        if (OrderView.dataByContacts.data[item.contact] == undefined) {
            OrderView.dataByContacts.data[item.contact] = item.sum;
        } else {
            OrderView.dataByContacts.data[item.contact] += item.sum;
        }

        if (OrderView.dataByTypes.data[item.type] == undefined) {
            OrderView.dataByTypes.data[item.type] = item.sum;
        } else {
            OrderView.dataByTypes.data[item.type] += item.sum;
        }
    });


    OrderView.drawTypesDiagram();
    OrderView.drawContactsDiagram();
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

    ipcRenderer.send('order-delete', id);
    row.remove();
    let deletedItemIndex = OrderView.data.findIndex(function (e) {
        return e.id == id;
    });
    if (deletedItemIndex >= 0) {
        OrderView.data.splice(deletedItemIndex, 1);
    }
    updateGraphData();
}


module.exports.OrderView = OrderView;
module.exports.onLinkClick = onLinkClick;