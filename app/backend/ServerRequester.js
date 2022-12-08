"use strict";

const http = require('http');
const moment = require('moment');

const host = 'cromberg.blweb.ru';

function ServerRequester(isDev) {
    this.isDev = isDev;
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
            if (versionData.data === undefined) {
                return;
            }
            callback(versionData.data);
        });
    });
};

ServerRequester.prototype.loadCurrenciesForIncome = function (data, callback) {
    let dates = []
    for (let i in data) {
        let income = data[i]
        let date = moment(income['date']).format("YYYY-MM-DD");
        dates.push(date)
    }
    dates.push(moment().format("YYYY-MM-DD"));
    dates = [...new Set(dates)]
    this.loadCurrencies(dates, callback);

};

ServerRequester.prototype.loadCurrenciesForBalance = function (data, callback) {
    let dates = [];
    for (let i in data) {
        let source = data[i]
        if (!source['value']) {
            continue;
        }
        for (let month in source['value']) {
            let date = moment(month, "MMYYYY").endOf('month').format("YYYY-MM-DD");
            dates.push(date);
        }
    }
    dates.push(moment().format("YYYY-MM-DD"));
    dates = [...new Set(dates)]
    this.loadCurrencies(dates, callback);

};

ServerRequester.prototype.loadCurrencies = function (dates, callback) {
    let requestData = JSON.stringify({
        dates: dates
    });
    request('POST', '/get_currencies', {'Content-Type': 'application/json'}, requestData,
    (response) => {
        response.on('data', function (data) {
            const ratesData = JSON.parse(data.toString());
            if (!ratesData || ratesData.length === 0) {
                callback(ratesData);
                return;
            }

            const result = {};
            let latestDate = moment(Object.keys(ratesData)[0]);
            for (let dateIterateStr in ratesData) {
                let dateIterate = moment(dateIterateStr);
                if (dateIterate.isAfter(latestDate)) {
                    latestDate = dateIterate;
                }
                result[dateIterate.format('DD.MM.YYYY')] = ratesData[dateIterateStr];
            }
            result['latest'] = ratesData[latestDate.format('YYYY-MM-DD')];
            callback(result);
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
        console.log(error);
    });

    if (requestData !== null) {
        req.write(requestData);
    }
    req.end();
}

module.exports = ServerRequester;
