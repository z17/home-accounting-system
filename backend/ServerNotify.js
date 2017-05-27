const {net} = require('electron');
const http = require('http');

const url = 'http://accounting-system.blweb.ru';

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

    if (oldSettings.remind === true && newSettings.remind === true && oldSettings.email != newSettings.email) {
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

    requestData = JSON.stringify(requestData);
    // let request = net.request(
    //     {
    //         method: 'POST',
    //         url: url,
    //     }
    // );
    //
    // request.on('response', (response) => {
    //     console.log(`STATUS: ${response.statusCode}`)
    // });
    // request.setHeader('Content-Type', 'application/json');
    // request.write(requestData, 'utf8', function () {
    //     request.end();
    // });

    console.log(requestData);

    let req = http.request({
        method: 'POST',
        host: 'accounting-system.blweb.ru',
        path: '/',
        headers: {
            'Content-Type': 'application/json'
        }
    }, function (response) {
        console.log(`STATUS: ${response.statusCode}`);
    });
    req.write(requestData);
    req.end();
};


module.exports.ServerNotify = ServerNotify;