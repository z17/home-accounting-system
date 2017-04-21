const Datastore = require('nedb');

let Tables = {
    INCOME : 'income',
    ORDER : 'order',
};

function Database() {
    this.db = new Datastore({filename: 'db/database'});
    this.db.loadDatabase();
}

Database.prototype.insertIncome = function (income) {
    this.db.insert({
        type: Tables.INCOME,
        data: income
    });
};

Database.prototype.getIncomes = function (callback) {
    this.db.find({type: Tables.INCOME}, function (err, docs) {
        let result = docs.map(function (e) {
            return e.data;
        });
        callback(result);
    });
};

Database.prototype.insertOrder = function (order) {
    this.db.insert({
        type: Tables.ORDER,
        data: order
    });
};

Database.prototype.getOrders = function (callback) {
    this.db.find({type: Tables.ORDER}, function (err, docs) {
        let result = docs.map(function (e) {
            return e.data;
        });
        callback(result);
    });
};

module.exports.Database = Database;