const functions = require('../backend/functions');

function SettingsView() {
    this.data = {};
}

SettingsView.prototype.setData = function (data) {
    if (data.length == 0) {
        return
    }

    if (data.length > 1) {
        throw new Error("Settings error");
    }

    this.data = data[0];
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
}


module.exports = SettingsView;
