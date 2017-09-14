const http = require('http');

const host = 'cromberg.blweb.ru';

function ServerNotify() {
}

ServerNotify.prototype.notify = function (oldSettings, newSettings) {
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

    let req = http.request({
        method: 'POST',
        host: host,
        path: '/email',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, function (response) {
        // todo: if error, try later
        console.log(`STATUS: ${response.statusCode}`);
    });
    req.write(requestData);
    req.end();
};


module.exports.ServerNotify = ServerNotify;