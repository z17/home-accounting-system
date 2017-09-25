const fs = require('fs');
const moment = require('moment');

function Backup(databasePath, folder) {
    this.folder = folder;
    this.databasePath = databasePath;
}

Backup.prototype.makeBackup = function () {
    if (this.folder === undefined) {
        console.log('cant find a folder for backup');
        return;
    }

    fs.createReadStream(this.databasePath).pipe(fs.createWriteStream(this.folder + generateBackupName()));
};

function generateBackupName() {
    return '\\database_' + moment().format('YYYY-MM-DD hh-mm') + '.db';
}

module.exports = Backup;