module.exports = function(date, month, sum, paymentType, contact, description) {
    this.id = null;
    this.date = date.unix();
    this.month = month.unix();
    this.sum = sum;
    this.paymentType = paymentType;
    this.contact = contact;
    this.description = description;
};
