const Datastore = require('nedb');

let Tables = {
    INCOME: 'income'
};

function Database() {
    this.db = new Datastore({filename: 'db/database'});
    this.db.loadDatabase();
}

Database.prototype.insertIncome = function (income, callback) {
    this.db.insert({
        type: Tables.INCOME,
        data: income
    }, function (err, doc) {
        callback(mapDataFromDB(doc));
    });
};

Database.prototype.getIncomes = function (callback) {
    this.db.find({type: Tables.INCOME}, function (err, docs) {
        let result = docs.map(mapDataFromDB);
        callback(result);
    });
};

Database.prototype.deleteIncome = function (incomeId) {
    this.db.remove({
        type: Tables.INCOME,
        _id: incomeId
    });
};

function mapDataFromDB(item) {
    let data = item.data;
    data.id = item._id;
    return data;
}
module.exports.Database = Database;