let IncomeView = {
    data: {},
    dataByMonth: {},
    dataByYear: {},
    dataAverage: {},
    sum: 0,
    average: 0,
    topMonth: {
        name : '',
        value : 0
    },
    worstMonth: {
        name : '',
        value : 0
    },

    setData: function (data) {
        data.sort(function (a, b) {
            return a.date - b.date;
        });
        this.data = data;

        let firstMonth = moment.unix(data[0].date).startOf('month');
        let firstYear = moment.unix(data[0].date).startOf('year');
        let lastMonth = moment.unix(data[data.length - 1].date).startOf('month');
        let lastYear = moment.unix(data[data.length - 1].date).startOf('year');

        let countMonths = lastMonth.diff(firstMonth, 'months', false);
        let countYears = lastYear.diff(firstYear, 'years', false);

        let dataByMonth = {};
        let dataByYear = {};
        let dataAverage = {};
        for (let i = 0; i < countMonths; i++) {
            firstMonth.add(1, 'M');
            dataByMonth[firstMonth.format("MMM YYYY")] = 0;
        }

        for (let i = 0; i < countYears; i++) {
            firstYear.add(1, 'Y');
            dataByYear[firstYear.format("YYYY")] = 0;
            dataAverage[firstYear.format("YYYY")] = 0;
        }

        let _this = this;
        data.forEach(function (element) {
            _this.sum += element.sum;

            let month = moment.unix(element.month).format("MMM YYYY");
            dataByMonth[month] = element.sum;

            let year = moment.unix(element.month).format("YYYY");
            dataByYear[year] = element.sum;

            // если разница меньше нуля, значит анализируется месяц за прошлые годы, если 0, значит сейчас январь и нужно эти данные пропустить
            let monthDiff = moment.unix(element.month).startOf('month').diff(moment().startOf('year'), 'months', false);
            if (monthDiff < 0) {
                monthDiff = 12;
            }
            if (monthDiff == 0) {
                return;
            }

            dataAverage[year] = element.sum / monthDiff;
        });

        this.dataByMonth = [];
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
                this.dataByMonth.push({
                    name: property,
                    value: dataByMonth[property],
                    time: moment(property, "MMM YYYY").unix()
                });
            }
        }

        this.dataByYear = [];
        for (let property in dataByYear) {
            if (dataByYear.hasOwnProperty(property)) {
                this.dataByYear.push({
                    name: property,
                    value: dataByYear[property],
                    time: moment(property, "YYYY").unix()
                });
            }
        }

        this.dataAverage = [];
        for (let property in dataAverage) {
            if (dataAverage.hasOwnProperty(property)) {
                this.dataAverage.push({
                    name: property,
                    value: dataAverage[property],
                    time: moment(property, "YYYY").unix()
                });
            }
        }

        this.dataByMonth.sort(function (a,b) {
            return a.time - b.time;
        });
        this.dataByYear.sort(function (a,b) {
            return a.time - b.time;
        });
        this.dataAverage.sort(function (a,b) {
            return a.time - b.time;
        });

        this.average = Math.round(this.sum / Object.keys(this.dataByMonth).length);
    },
    getData: function () {
        return this.data;
    },
    drawByMonth: function () {
        this.draw(this.dataByMonth, "Income by month", '100%', 400, ["Month", "Sum"], "js-income-month-chart");
    },
    drawByYear: function () {
        this.draw(this.dataByYear, "Income by year", '100%', 300, ["Year", "Sum"], "js-income-year-chart");
    },
    drawAverage: function () {
        this.draw(this.dataAverage, "Income by middle ", '100%', 300, ["Year", "Middle Sum"], "js-income-average-chart");
    },

    draw: function (chartData, title, width, height, columnsName, chartId) {
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            let data = [columnsName];

            data = data.concat(chartData.map(function (element) {
               return [element.name, element.value];
            }));
            let dataTable = google.visualization.arrayToDataTable(data);
            let view = new google.visualization.DataView(dataTable);

            let options = {
                title: title,
                width: width,
                height: height,
                bar: {groupWidth: "95%"},
                legend: {position: "none"}
                // chartArea: {
                //     width: '80%',
                //     height: '80%'
                // }
            };
            let chart = new google.visualization.ColumnChart(document.getElementById(chartId));
            chart.draw(view, options);
        }
    }
};

module.exports.IncomeView = IncomeView;