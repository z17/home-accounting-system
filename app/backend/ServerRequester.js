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

ServerRequester.prototype.loadCurrenciesForData = function (incomes, balance, callback) {
    let dates = []
    for (let i in incomes) {
        let income = incomes[i]
        let date = moment.unix(income['date']).format("YYYY-MM-DD");
        dates.push(date)
    }

    for (let i in balance) {
        let source = balance[i]
        if (!source['value']) {
            continue;
        }
        for (let month in source['value']) {
            let date = moment(month, "MMYYYY").endOf('month').format("YYYY-MM-DD");
            dates.push(date);
        }
    }

    dates.push(moment().subtract(1, 'days').format("YYYY-MM-DD"));
    dates.push(moment().format("YYYY-MM-DD"));
    dates = [...new Set(dates)]
    this.loadCurrencies(dates, callback);
};

ServerRequester.prototype.loadCurrencies = function (dates, callback) {
    const chunkSize = 500; // limit dates on API
    const chunks = []
    for (let i = 0; i < dates.length; i += chunkSize) {
        chunks.push(dates.slice(i, i + chunkSize));
    }

    let requestedDone = 0;

    let commonRatesData = {};
    const processCallback = () => {
        if (requestedDone !== chunks.length) {
            return;
        }

        let result = {};
        let latestDate = moment(Object.keys(commonRatesData)[0]);
        for (let dateIterateStr in commonRatesData) {
            let dateIterate = moment(dateIterateStr);
            if (dateIterate.isAfter(latestDate)) {
                latestDate = dateIterate;
            }
            result[dateIterate.format('DD.MM.YYYY')] = commonRatesData[dateIterateStr];
        }
        result['latest'] = commonRatesData[latestDate.format('YYYY-MM-DD')];
        callback(result);
    }

    chunks.forEach((chunk) => {
        let requestData = JSON.stringify({
            dates: chunk
        });

        request('POST', '/get_currencies', {'Content-Type': 'application/json'}, requestData, (response) => {

            let data = [];
            response.on('data', chunk => {
                data.push(chunk);
            });

            response.on('end', () => {
                if (response.statusCode !== 200) {
                    console.log('Currencies request error: ' + response.statusCode);
                } else {
                    const ratesData = JSON.parse(Buffer.concat(data).toString());
                    if (ratesData) {
                        commonRatesData = Object.assign({}, commonRatesData, ratesData);
                    }
                }
                requestedDone += 1;
                processCallback();
            });
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
