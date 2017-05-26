const Database = require('../backend/Database').Database;

let Tables = {
    INCOME: 'income',
    SETTINGS: 'settings'
};

function Dao() {
    this.database = new Database();
}

// Incomes
Dao.prototype.getIncomes = function (callback) {
    this.database.get(Tables.INCOME, callback);
};

Dao.prototype.insertIncome = function (income, callback) {
    this.database.insert(income, Tables.INCOME, callback);
};

Dao.prototype.deleteIncome = function (incomeId, callback) {
    this.database.delete(Tables.INCOME, incomeId, callback);
};

// Settings
Dao.prototype.getSettings = function (callback) {
    this.database.get(Tables.SETTINGS, callback);
};

Dao.prototype.updateSettings = function (settings, callback) {
    this.database.deleteAll(Tables.SETTINGS);
    this.database.insert(settings, Tables.SETTINGS, callback);
};

// Other
Dao.prototype.drop = function () {
    this.database.drop();
};


module.exports.Dao = Dao;