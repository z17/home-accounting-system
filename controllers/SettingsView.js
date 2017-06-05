const functions = require('../backend/functions');

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
}


module.exports = SettingsView;
