const settings = {};

export const SettingsModel = (data) => {
    settings.backupFolder = data['backupFolder'];
    settings.databaseFolder = data['databaseFolder'];
    settings.email = data['email'];
    settings.id = data['id'];
    settings.language = data['language'];
    settings.lastBackupDateTimestamp = data['lastBackupDateTimestamp'];
    settings.remind = data['remind'];
    return settings
};