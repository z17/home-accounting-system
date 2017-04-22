const OrderStatus = require('../data/entities.js').OrderStatus;
const shell = require('electron').shell;

let OrderView = {
    data: [],
    dataByTypes: [],
    dataByContacts: [],

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

        let _this = this;
        data.forEach(function (data) {
            if (_this.dataByContacts[data.contact] == undefined) {
                _this.dataByContacts[data.contact] = data.sum;
            } else {
                _this.dataByContacts[data.contact] += data.sum;
            }

            if (_this.dataByTypes[data.type] == undefined) {
                _this.dataByTypes[data.type] = data.sum;
            } else {
                _this.dataByContacts[data.type] += data.sum;
            }
        });

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
        this.data.forEach(this.insertOrder);

        this.drawTypesDiagram();
        this.drawContactsDiagram();
    },
    insertOrder: function (item) {
        let rowExample = $('.js-orders-page .js-row');
        let row = rowExample.clone();

        let link = item.link;
        if (item.link.length > 0) {
            link = '<a href="http://' + item.link + '">' + item.link + '</a>';
        }

        row.removeClass('js-row');
        row.addClass(OrderStatus[item.status].class);
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
    },
    drawTypesDiagram: function () {
        this.draw(this.dataByTypes, 'By Types', '100%', '400', ["Type", "Sum"],  'js-order-types-chart');
    },

    drawContactsDiagram: function () {
        this.draw(this.dataByContacts, 'By Contacts', '100%', '400', ["Contact", "Sum"],  'js-order-contacts-chart');

    },
    draw: function (chartData, title, width, height, columnsName, chartId) {

        let data = [columnsName];
        for (let property in chartData) {
            if (chartData.hasOwnProperty(property)) {
                data.push([property, chartData[property]]);
            }
        }
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {

            data = google.visualization.arrayToDataTable(data);
            let options = {
                title: title,
                width: width,
                height: height,
                bar: {groupWidth: "95%"},
            };

            let chart = new google.visualization.PieChart(document.getElementById(chartId));
            chart.draw(data, options);
        }
    },

};


function onLinkClick(e) {
    if ($(this).attr('href') != undefined) {
        e.preventDefault();
        shell.openExternal($(this).attr('href'));
    }
}

module.exports.OrderView = OrderView;
module.exports.onLinkClick = onLinkClick;