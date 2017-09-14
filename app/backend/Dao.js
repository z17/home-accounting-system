const Database = require('../backend/Database').Database;
const Settings = require('../models/settings');

let Tables = {
    INCOME: 'income',
    SETTINGS: 'settings',
    BALANCE: 'balance'
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

Dao.prototype.updateIncome = function (income, callback) {
    this.database.update(income.id, Tables.INCOME, income, callback);
};

Dao.prototype.deleteIncome = function (incomeId, callback) {
    this.database.delete(Tables.INCOME, incomeId, callback);
};

//Balance
Dao.prototype.getBalances = function (callback) {
    this.database.get(Tables.BALANCE, callback);
};

Dao.prototype.addBalanceSource = function (source, callback) {
    this.database.insert(source, Tables.BALANCE, callback);
};

Dao.prototype.addBalance = function (id, month, sum, callback) {
    let key = 'data.value.' + month;
    this.database.addProperty({'_id': id, 'type': Tables.BALANCE}, key, sum, callback);
};

Dao.prototype.deleteBalance = function (id, month, callback) {
    let key = 'data.value.'+ month;
    this.database.deleteProperty({'_id': id, 'type': Tables.BALANCE}, key, callback);
};

// Settings
Dao.prototype.getSettings = function (callback) {
    this.database.get(Tables.SETTINGS, (data) => {
        if (data.length > 1) {
            throw new Error("Settings error");
        }

        if (data.length === 0) {
            callback(new Settings(false, ''));  // default settings
            return;
        }

        callback(data[0]);
    });
};

Dao.prototype.updateSettings = function (settings, callback) {
    this.database.deleteAll(Tables.SETTINGS);
    this.database.insert(settings, Tables.SETTINGS, callback);
};

// Other
Dao.prototype.drop = function () {
    this.database.drop();
};


module.exports = Dao;
