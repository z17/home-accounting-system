module.exports = function(remind, email, backupFolder, language) {
    this.remind = remind;
    this.email = email;
    this.backupFolder = backupFolder;
    this.language = language;
    this.lastBackupDateTimestamp = 0;
};
