const fs = require('fs');
const moment = require('moment');
const path = require('path');

function Backup(databasePath, folder) {
    this.folder = folder;
    this.databasePath = databasePath;
}

Backup.prototype.makeBackup = function (lastBackupTimestamp) {
    if (!this.folder) {
        console.log('cant find a folder for backup');
        return undefined;
    }

    let currentDayTimestamp = moment().startOf('day').unix();
    if (currentDayTimestamp === lastBackupTimestamp) {
        console.log('backup already was made today');
        return undefined;
    }

    fs.createReadStream(this.databasePath).pipe(fs.createWriteStream(this.folder + generateBackupName()));

    return currentDayTimestamp;
};

function generateBackupName() {
    return path.sep + 'database_' + moment().format('YYYY-MM-DD hh-mm') + '.db';
}

module.exports = Backup;