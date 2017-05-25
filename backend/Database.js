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
        console.log(doc);
        callback(doc);
    });
};

Database.prototype.get = function (type, callback) {
    this.db.find({type: type}, function (err, docs) {
        callback(docs);
    });
};

Database.prototype.delete = function (type, id, callback) {
    this.db.remove({
        type: type,
        _id: id
    }, {}, function(err, del) {
      if (err) {
        throw new Error(err);
      }
      callback(id);
    });
};
Database.prototype.drop = function () {
    this.db.remove({}, { multi: true }, function (err, numRemoved) {
    });
};
module.exports.Database = Database;
