const OrderStatus = require('../data/entities.js').OrderStatus;
const $ = require('jquery');

let OrderView = {
    setupView : function () {
        for (let property in OrderStatus) {
            if (OrderStatus.hasOwnProperty(property)) {
                $('.js-add-status').append($('<option>', {
                    value: property,
                    text: OrderStatus[property]
                }));
            }
        }
    }
};

module.exports.OrderView = OrderView;