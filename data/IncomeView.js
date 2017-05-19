function IncomeView() {
    this.data = {};
    this.dataByMonth = {
        title: "Income by month",
        cols: ["Month", "Sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    };
    this.dataByYear = {
        title: "Income by year",
        cols: ["Year", "Sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    };
    this.dataAverage = {
        title: "Average income by year",
        cols: ["Year", "Middle sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    };
    this.sum = 0;
    this.average = 0;
    this.topMonth = {
        name: '',
        value: 0
    };
    this.worstMonth = {
        name: '',
        value: 0
    };
    this.onDeleteCallback = null;
}

const incomeView = new IncomeView();

IncomeView.prototype.setData = function (data) {
    data.sort(function (a, b) {
        return a.date - b.date;
    });
    this.data = data;

    insertIncomeData(data);
    updateGraphData(data);
};

IncomeView.prototype.setPaymentTypes = function (types) {
    $(".js-income-page .js-add-payment-type").autocomplete({
        source: types,
        minLength: 0,
    });
};

IncomeView.prototype.setContacts = function (contacts) {
    $(".js-income-page .js-add-contact").autocomplete({
        source: contacts,
        minLength: 0,
    });
};

IncomeView.prototype.insertIncome = function (item) {
    this.data.push(item);
    updateGraphData(this.data);
    this.reloadGraph();
    insertIncomeToPage(item);
};

IncomeView.prototype.setCallbacks = function (onDeleteCallback) {
    this.onDeleteCallback = onDeleteCallback;
};

IncomeView.prototype.reloadGraph = function() {
    drawByMonth();
    drawByYear();
    drawAverage();
};

function drawByMonth() {
    draw(incomeView.dataByMonth, '100%', 400, "js-income-month-chart");
}

function drawByYear() {
    draw(incomeView.dataByYear, '100%', 300, "js-income-year-chart");
}

function drawAverage() {
    draw(incomeView.dataAverage, '100%', 300, "js-income-average-chart");
}

function draw(chartData, width, height, chartId) {
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
        let dataTable = prepareChartData(chartData);
        if (chartData.chart != null) {
            chartData.chart.draw(dataTable, chartData.chartOptions);
            chartData.chartData = dataTable;
            return
        }

        let view = new google.visualization.DataView(dataTable);

        let options = {
            title: chartData.title,
            width: width,
            height: height,
            bar: {groupWidth: "95%"},
            legend: {position: "none"},
            animation: {
                duration: 500,
                easing: 'out',
            },
            // chartArea: {
            //     width: '80%',
            //     height: '80%'
            // }
        };
        let chart = new google.visualization.ColumnChart(document.getElementById(chartId));
        chart.draw(view, options);

        chartData.chart = chart;
        chartData.chartData = dataTable;
        chartData.chartOptions = options;
    }
}

function insertIncomeData(data) {
    data.forEach(insertIncomeToPage);
}

function updateGraphData(data) {
    let firstMonth = moment().startOf('month');
    let firstYear = moment().startOf('year');
    let lastMonth = moment().startOf('month');
    let lastYear = moment().startOf('year');
    if (data.length != 0) {
        firstMonth = moment.unix(data[0].month).startOf('month');
        firstYear = moment.unix(data[0].month).startOf('year');
        lastMonth = moment.unix(data[data.length - 1].month).startOf('month');
        lastYear = moment.unix(data[data.length - 1].month).startOf('year');
    }

    let countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;
    let countYears = lastYear.diff(firstYear, 'years', false) + 1;

    let dataByMonth = {};
    let dataByYear = {};
    let dataAverage = {};
    for (let i = 0; i < countMonths; i++) {
        dataByMonth[firstMonth.format("MMM YYYY")] = 0;
        firstMonth.add(1, 'M');
    }

    for (let i = 0; i < countYears; i++) {
        dataByYear[firstYear.format("YYYY")] = 0;
        dataAverage[firstYear.format("YYYY")] = 0;
        firstYear.add(1, 'Y');
    }

    data.forEach(function (element) {
        incomeView.sum += element.sum;

        let month = moment.unix(element.month).format("MMM YYYY");
        dataByMonth[month] += element.sum;

        let year = moment.unix(element.month).format("YYYY");
        dataByYear[year] += element.sum;

        // если разница меньше нуля, значит анализируется месяц за прошлые годы, если 0, значит сейчас январь и нужно эти данные пропустить
        let monthDiff = moment.unix(element.month).startOf('month').diff(moment().startOf('year'), 'months', false);
        if (monthDiff < 0) {
            monthDiff = 12;
        }
        if (monthDiff == 0) {
            return;
        }

        dataAverage[year] += element.sum / monthDiff;
    });

    incomeView.dataByMonth.data = [];
    for (let property in dataByMonth) {
        if (dataByMonth.hasOwnProperty(property)) {
            if (incomeView.topMonth.value < dataByMonth[property] || incomeView.topMonth.name === '') {
                incomeView.topMonth.value = dataByMonth[property];
                incomeView.topMonth.name = property;
            }
            if (incomeView.worstMonth.value > dataByMonth[property] || incomeView.worstMonth.name === '') {
                incomeView.worstMonth.value = dataByMonth[property];
                incomeView.worstMonth.name = property;
            }
            incomeView.dataByMonth.data.push({
                name: property,
                value: dataByMonth[property],
                time: moment(property, "MMM YYYY").unix()
            });
        }
    }

    incomeView.dataByYear.data = [];
    for (let property in dataByYear) {
        if (dataByYear.hasOwnProperty(property)) {
            incomeView.dataByYear.data.push({
                name: property,
                value: dataByYear[property],
                time: moment(property, "YYYY").unix()
            });
        }
    }

    incomeView.dataAverage.data = [];
    for (let property in dataAverage) {
        if (dataAverage.hasOwnProperty(property)) {
            incomeView.dataAverage.data.push({
                name: property,
                value: dataAverage[property],
                time: moment(property, "YYYY").unix()
            });
        }
    }

    incomeView.dataByMonth.data.sort(function (a, b) {
        return a.time - b.time;
    });
    incomeView.dataByYear.data.sort(function (a, b) {
        return a.time - b.time;
    });
    incomeView.dataAverage.data.sort(function (a, b) {
        return a.time - b.time;
    });

    incomeView.average = Math.round(incomeView.sum / Object.keys(incomeView.dataByMonth.data).length);

    $('.js-income-sum').text(incomeView.sum);
    $('.js-income-average').text(incomeView.average);
    $('.js-income-top').text(incomeView.topMonth.value);
    $('.js-income-worst').text(incomeView.worstMonth.value);
}

function prepareChartData(chartData) {
    let data = [chartData.cols];
    data = data.concat(chartData.data.map(function (element) {
        return [element.name, element.value];
    }));
    return google.visualization.arrayToDataTable(data);
}

function insertIncomeToPage(item) {
    let rowExample = $('.js-income-page .js-row');
    let row = rowExample.clone();
    row.removeClass('js-row');
    row.data('id', item.id);
    row.find('.js-delete').click(onDeleteClick);
    row.find('.js-date').text(moment.unix(item.date).format("DD.MM.YYYY"));
    row.find('.js-month').text(moment.unix(item.month).format("MMM YYYY"));
    row.find('.js-sum').text(item.sum);
    row.find('.js-payment-type').text(item.paymentType);
    row.find('.js-contact').text(item.contact);
    row.find('.js-description').text(item.description);
    row.insertBefore(rowExample);
}

function onDeleteClick() {
    // todo: are you sure?
    let row = $(this).closest('tr.row');
    let id = row.data('id');

    row.remove();
    let deletedItemIndex = incomeView.data.findIndex(function (e) {
        return e.id == id;
    });

    if (deletedItemIndex >= 0) {
        incomeView.data.splice(deletedItemIndex, 1);
    }
    updateGraphData(incomeView.data);
    incomeView.reloadGraph();
    incomeView.onDeleteCallback(incomeView.data[deletedItemIndex]);
}


module.exports.IncomeView = incomeView;