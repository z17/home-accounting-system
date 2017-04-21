const Datastore = require('nedb');

function Database() {
    this.db = new Datastore({filename: 'db/database'});
    this.db.loadDatabase();
}

Database.prototype.insertIncome = function (income) {
    this.db.insert({
        type: 'income',
        data: income
    });
};

Database.prototype.getIncomes = function (callback) {
    this.db.find({type: 'income'}, function (err, docs) {
        let result = docs.map(function (e) {
            return e.data;
        });
        callback(result);
    });
};

module.exports.Database = Database;