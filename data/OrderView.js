const OrderStatus = require('../data/entities.js').OrderStatus;
const shell = require('electron').shell;

let OrderView = {
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
        this.insertOrdersData();
    },
    insertOrdersData: function () {
        this.data.forEach(this.insertOrder);
    },
    insertOrder : function (item) {
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
    }
};


function onLinkClick(e) {
    if ($(this).attr('href') != undefined) {
        e.preventDefault();
        shell.openExternal($(this).attr('href'));
    }
}

module.exports.OrderView = OrderView;
module.exports.onLinkClick = onLinkClick;