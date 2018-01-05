"use strict";

const functions = require('../scripts/functions');
const Settings = require('../models/settings');

function SettingsView() {
    this.data = {};
}

SettingsView.prototype.setData = function (data) {
    this.data = data;
};

SettingsView.prototype.updateData = function (data) {
    this.data = data;
    updateData(this.data);
    $('.js-settings-response').text("ok");
};

SettingsView.prototype.preparePage = function(sendSettingsFunction) {
    updateData(this.data);

    $('.settings-close-button').click(() => {
        toggleSettingsWindow();
    });

    $(".js-settings-button").click(() => {
        toggleSettingsWindow();
    });

    $('.js-settings-backup').change(function (e) {
        let path = e.target.files[0].path;
        $('.js-settings-backup-text').val(path);
    });

    $('.js-settings-database').change(function (e) {
        let path = e.target.files[0].path;
        $('.js-settings-database-text').val(path);
    });

    $(".js-settings-form").on('submit', function (e) {
        e.preventDefault();

        let response = $('.js-settings-response');

        let remindFlag = $('.js-settings-remind').is(":checked");
        let remindEmail = $('.js-settings-email').val();
        let databaseFolder = $('.js-settings-database-text').val();
        let backupFolder = $('.js-settings-backup-text').val();
        let language = $('.js-settings-language').val();
        if (remindFlag === true && remindEmail.length === 0) {
            response.text("Empty email");
            response.addClass("error");
            return;
        }

        let settings = new Settings(remindFlag, remindEmail, databaseFolder, backupFolder, language);

        sendSettingsFunction(settings);

        response.removeClass("error");
        response.text("");
    });
};

function updateData(data) {
    $('.js-settings-remind').prop("checked", data.remind);
    $('.js-settings-email').val(data.email);
    $('.js-settings-backup-text').val(data.backupFolder);
    $('.js-settings-database-text').val(data.databaseFolder);
    $('.js-settings-language').val(data.language);
}

function toggleSettingsWindow() {
    $(".js-settings-button").toggleClass("active");
    $(".js-settings-window").toggleClass("active");
}


module.exports = new SettingsView();
