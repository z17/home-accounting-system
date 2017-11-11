const Datastore = require('nedb');

function Database(path) {
    this.db = new Datastore({filename: path});
    this.db.loadDatabase(
        function (err) {
            if (err) {
                // todo: this. Can happens, when database in dropbox folder, for example.
                console.log("DATABASE ERROR");
                console.log(err);

                throw new Error("Database load error: " + err);
            }
        }
    );
    this.filename = this.db.filename;
}

Database.prototype.insert = function (data, type, callback) {
    this.db.insert({
        type: type,
        data: data
    }, function (err, doc) {
        if (err) {
          throw new Error(err);
        }

        if (callback === undefined) {
            return;
        }

        callback(mapDataFromDB(doc));
    });
};

Database.prototype.updateFullData = function (id, type, data, callback) {
    this.db.update({
            _id: id,
            type: type,
        },
        {
            type: type,
            data: data
        },
        {},
        callback
    );
};

Database.prototype.update = function (find, update, callback) {
  this.db.update(find, update, {}, callback);
};

Database.prototype.addProperty = function (query, key, value, callback) {
    let obj = {};
    obj[key] = value;
    this.db.update(query, { $set: obj }, {upsert: true}, function () {
        callback();
    });
};

Database.prototype.deleteProperty = function (query, key, callback) {
    let obj = {};
    obj[key] = true;
    this.db.update(query, {$unset: obj}, {}, () => {
        callback();
    });
};

Database.prototype.getByType = function (type, callback) {
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

        if (callback === undefined) {
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
