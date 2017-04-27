let Income = function (date, month, sum, paymentType, contact, description, orderId, orderPaymentType) {
    this.id = null;
    this.date = date.unix();
    this.month = month.unix();
    this.sum = sum;
    this.paymentType = paymentType;
    this.contact = contact;
    this.description = description;
    this.orderId = orderId;
    this.orderPaymentType = orderPaymentType;
};

let Order = function (month, sum, prepayment, payment, expenses, contact, type, description, link, status) {
    this.id = null;
    this.month = month.unix();
    this.sum = sum;
    this.prepayment = prepayment;
    this.payment = payment;
    this.expenses = expenses;
    this.contact = contact;
    this.type = type;
    this.description = description;
    this.link = link;
    this.status = status;
};

let OrderStatus = {
    PREPAYMENT: {
        name: 'Waiting for prepayment',
        class: 'prepayment'
    },
    IN_PROGRESS: {
        name: 'In progress',
        class: 'in-progress',
    },
    PAYMENT: {
        name: 'Waiting for payment',
        class: 'payment'
    },
    COMPLETED: {
        name: 'Completed',
        class: 'completed'
    }
};

let IncomeOrderPaymentType = {
    PREPAYMENT: {
        value: 'prepayment'
    },
    PAYMENT: {
        value : 'payment'
    }
};

module.exports.Order = Order;
module.exports.Income = Income;
module.exports.OrderStatus = OrderStatus;
module.exports.IncomeOrderPaymentType = IncomeOrderPaymentType;