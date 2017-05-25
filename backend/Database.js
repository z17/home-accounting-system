const Datastore = require('nedb');

const databaseFile = 'db/database';

function Database() {
    this.db = new Datastore({filename: databaseFile});
    this.db.loadDatabase();
}

Database.prototype.insert = function (data, type, callback) {
    this.db.insert({
        type: type,
        data: data
    }, function (err, doc) {
        if (err) {
          throw new Error(err);
        }

        if (callback == undefined) {
            return;
        }

        callback(mapDataFromDB(doc));
    });
};

Database.prototype.get = function (type, callback) {
    this.db.find({type: type}, function (err, data) {
        let result = data.map(mapDataFromDB);
        callback(result);
    });
};

Database.prototype.delete = function (type, id, callback) {
    this.db.remove({
        type: type,
        _id: id
    }, {}, function (err) {
        if (err) {
            throw new Error(err);
        }

        if (callback == undefined) {
            return;
        }

        callback(id);
    });
};

Database.prototype.deleteAll = function (type) {
    this.db.remove({
        type: type,
    }, true);
};

Database.prototype.drop = function () {
    this.db.remove({}, { multi: true }, function (err, numRemoved) {
    });
};

function mapDataFromDB(item) {
    let data = item.data;
    data.id = item._id;
    return data;
}

module.exports.Database = Database;
