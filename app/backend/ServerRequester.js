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
            email: newSettings.email,
            language: newSettings.language,
        };
        doRequest = true;
    } else if (newSettings.remind === false && oldSettings.remind === true) {
        // todo: if we disable notifications and change email, we send only delete request
        requestData = {
            action: 'delete',
            email: oldSettings.email,
            language: newSettings.language,
        };
        doRequest = true;
    } else if (oldSettings.email && (oldSettings.email !== newSettings.email || oldSettings.language !== newSettings.language)) {
        requestData = {
            action: 'update',
            email: newSettings.email,
            oldEmail: oldSettings.email,
            language: newSettings.language,
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

module.exports = ServerRequester;