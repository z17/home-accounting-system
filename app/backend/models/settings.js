module.exports = function(remind, email, databaseFolder, backupFolder, language) {
    this.remind = remind;
    this.email = email;
    this.databaseFolder = databaseFolder;
    this.backupFolder = backupFolder;
    this.language = language;
    this.lastBackupDateTimestamp = 0;
};
