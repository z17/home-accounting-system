module.exports = function(remind, email, backupFolder) {
    this.remind = remind;
    this.email = email;
    this.backupFolder = backupFolder;
    this.lastBackupDateTimestamp = 0;
};
