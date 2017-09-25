const functions = require('../scripts/functions');

function SettingsView() {
    this.data = {};
}

SettingsView.prototype.setData = function (data) {
    this.data = data;
    updateData(this.data);
};

SettingsView.prototype.updateData = function (data) {
    this.data = data;
    updateData(this.data);
    $('.js-settings-response').text("ok");
};

function updateData(data) {
    $('.js-settings-remind').prop("checked", data.remind);
    $('.js-settings-email').val(data.email);
    $('.js-settings-backup-text').val(data.backupFolder);
}


module.exports = SettingsView;
