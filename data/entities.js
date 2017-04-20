var Income = function (date, month, sum, paymentType, contact, description) {
    this.date = date.unix();
    this.month = month.unix();
    this.sum = sum;
    this.paymentType = paymentType;
    this.contact = contact;
    this.description = description;
};

var Order = function (month, sum, prepayment, payment, expenses, paymentType, contact, type, description, link,
                      status) {
    this.month = month;
    this.sum = sum;
    this.prepayment = prepayment;
    this.payment = payment;
    this.expenses = expenses;
    this.paymentType = paymentType;
    this.contact = contact;
    this.type = type;
    this.description = description;
    this.link = link;
    this.status = status;
};

module.exports.Order = Order;
module.exports.Income = Income;