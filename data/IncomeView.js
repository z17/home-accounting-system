const ipcRenderer = require('electron').ipcRenderer;

let IncomeView = {
    data: {},
    dataByMonth: {
        title: "Income by month",
        cols: ["Month", "Sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    },
    dataByYear: {
        title: "Income by year",
        cols: ["Year", "Sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    },
    dataAverage: {
        title: "Average income by year",
        cols: ["Year", "Middle sum"],
        data: [],
        chart: null,
        chartData: null,
        chartOptions: null,
    },
    sum: 0,
    average: 0,
    topMonth: {
        name: '',
        value: 0
    },
    worstMonth: {
        name: '',
        value: 0
    },

    setData: function (data) {
        data.sort(function (a, b) {
            return a.date - b.date;
        });
        this.data = data;

        this.insertIncomeData();
        this.updateGraphData(data);
    },
    setPaymentTypes: function (types) {
        $(".js-income-page .js-add-payment-type").autocomplete({
            source: types,
            minLength: 0,
        });
    },
    setContacts: function (contacts) {
        $(".js-income-page .js-add-contact").autocomplete({
            source: contacts,
            minLength: 0,
        });
    },
    drawByMonth: function () {
        this.draw(this.dataByMonth, '100%', 400, "js-income-month-chart");
    },
    drawByYear: function () {
        this.draw(this.dataByYear, '100%', 300, "js-income-year-chart");
    },
    drawAverage: function () {
        this.draw(this.dataAverage, '100%', 300, "js-income-average-chart");
    },

    draw: function (chartData, width, height, chartId) {
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
    },
    insertIncomeData: function () {
        this.data.forEach(insertIncomeToPage);
    },
    insertIncome: function (item) {
        this.data.push(item);
        this.updateGraphData(this.data);
        insertIncomeToPage(item);
    },
    updateGraphData: function (data) {
        let firstMonth = moment().startOf('month');
        let firstYear = moment().startOf('year');
        let lastMonth = moment().startOf('month');
        let lastYear = moment().startOf('year');
        if (data.length != 0) {
            firstMonth = moment.unix(data[0].date).startOf('month');
            firstYear = moment.unix(data[0].date).startOf('year');
            lastMonth = moment.unix(data[data.length - 1].date).startOf('month');
            lastYear = moment.unix(data[data.length - 1].date).startOf('year');
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

        let _this = this;
        data.forEach(function (element) {
            _this.sum += element.sum;

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

        this.dataByMonth.data = [];
        for (let property in dataByMonth) {
            if (dataByMonth.hasOwnProperty(property)) {
                if (this.topMonth.value < dataByMonth[property] || this.topMonth.name === '') {
                    this.topMonth.value = dataByMonth[property];
                    this.topMonth.name = property;
                }
                if (this.worstMonth.value > dataByMonth[property] || this.worstMonth.name === '') {
                    this.worstMonth.value = dataByMonth[property];
                    this.worstMonth.name = property;
                }
                this.dataByMonth.data.push({
                    name: property,
                    value: dataByMonth[property],
                    time: moment(property, "MMM YYYY").unix()
                });
            }
        }

        this.dataByYear.data = [];
        for (let property in dataByYear) {
            if (dataByYear.hasOwnProperty(property)) {
                this.dataByYear.data.push({
                    name: property,
                    value: dataByYear[property],
                    time: moment(property, "YYYY").unix()
                });
            }
        }

        this.dataAverage.data = [];
        for (let property in dataAverage) {
            if (dataAverage.hasOwnProperty(property)) {
                this.dataAverage.data.push({
                    name: property,
                    value: dataAverage[property],
                    time: moment(property, "YYYY").unix()
                });
            }
        }

        this.dataByMonth.data.sort(function (a, b) {
            return a.time - b.time;
        });
        this.dataByYear.data.sort(function (a, b) {
            return a.time - b.time;
        });
        this.dataAverage.data.sort(function (a, b) {
            return a.time - b.time;
        });

        this.average = Math.round(this.sum / Object.keys(this.dataByMonth.data).length);

        this.drawByMonth();
        this.drawByYear();
        this.drawAverage();

        $('.js-income-sum').text(this.sum);
        $('.js-income-average').text(this.average);
        $('.js-income-top').text(this.topMonth.value);
        $('.js-income-worst').text(this.worstMonth.value);
    }
};

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

    ipcRenderer.send('income-delete', id);
    row.remove();
    let deletedItemIndex = IncomeView.data.findIndex(function (e) {
        return e.id == id;
    });
    if (deletedItemIndex >= 0) {
        IncomeView.data.splice(deletedItemIndex, 1);
    }
    IncomeView.updateGraphData(IncomeView.data);
}

module.exports.IncomeView = IncomeView;