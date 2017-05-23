const Datastore = require('nedb');

function Database() {
    this.db = new Datastore({filename: 'db/database'});
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
        callback(mapDataFromDB(doc));
    });
};

Database.prototype.get = function (type, callback) {
    this.db.find({type: type}, function (err, docs) {
        let result = docs.map(mapDataFromDB);
        callback(result);
    });
};

Database.prototype.delete = function (type, id) {
    this.db.remove({
        type: type,
        _id: id
    });
};

function mapDataFromDB(item) {
    let data = item.data;
    data.id = item._id;
    return data;
}
module.exports.Database = Database;
