"use strict";

const http = require('http');

const host = 'cromberg.blweb.ru';

function ServerRequester() {
}

ServerRequester.prototype.notify = function (oldSettings, newSettings) {
    let requestData = null;
    let doRequest = false;
    if (newSettings.remind === true && oldSettings.remind === false) {
        requestData = {
            action: 'add',
            email: newSettings.email
        };
        doRequest = true;
    }

    if (newSettings.remind === false && oldSettings.remind === true) {
        requestData = {
            action: 'delete',
            email: oldSettings.email
        };
        doRequest = true;
    }

    if (oldSettings.remind === true && newSettings.remind === true && oldSettings.email !== newSettings.email) {
        requestData = {
            action: 'update',
            email: newSettings.email,
            oldEmail: oldSettings.email
        };
        doRequest = true;
    }

    if (!doRequest) {
        return;
    }

    requestData = 'data=' + encodeURIComponent(JSON.stringify(requestData));

    // todo: if error, try later
    request('POST', '/email', {'Content-Type': 'application/x-www-form-urlencoded'}, requestData);
};

ServerRequester.prototype.getServerVersion = function (callback) {
    request('GET', '/version', null, null, function (response) {
        if (response.statusCode !== 200) {
            return;
        }

        response.on('data', function (data) {
            const versionData = JSON.parse(data);
            if (versionData.data == undefined) {
                return;
            }
            callback(versionData.data);
        });
    });
};


function request(method, path, headers, requestData, callback) {
    let req = http.request({
        method: method,
        host: host,
        path: path,
        headers: headers
    }, function (response) {
        if (callback) {
            callback(response);
        }
    });

    req.on('error', function (error) {
    });

    if (requestData !== null) {
        req.write(requestData);
    }
    req.end();
}

module.exports.ServerNotify = ServerRequester;