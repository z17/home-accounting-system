let Income = function (date, month, sum, paymentType, contact, description) {
    this.date = date.unix();
    this.month = month.unix();
    this.sum = sum;
    this.paymentType = paymentType;
    this.contact = contact;
    this.description = description;
};

let Order = function (month, sum, prepayment, payment, expenses, contact, type, description, link, status) {
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
    PREPAYMENT: 'Waiting for prepayment',
    IN_PROGRESS: 'In progress',
    PAYMENT: 'Waiting for payment',
    COMPLETED: 'Completed'
};

module.exports.Order = Order;
module.exports.Income = Income;
module.exports.OrderStatus = OrderStatus;