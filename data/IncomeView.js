let IncomeView = {
    data: {},
    dataByMonth: {},
    dataByYear: {},
    dataAverage: {},
    sum: 0,
    average: 0,

    setData: function (data) {
        this.data = data;
        let _this = this;
        data.forEach(function (element) {
            _this.sum += element.sum;

            let month = moment.unix(element.month).format("MMM YYYY");
            if (_this.dataByMonth[month] != undefined) {
                _this.dataByMonth[month] += element.sum;
            } else {
                _this.dataByMonth[month] = element.sum;
            }

            let year = moment.unix(element.month).format("YYYY");
            if (_this.dataByYear[year] != undefined) {
                _this.dataByYear[year] += element.sum;
            } else {
                _this.dataByYear[year] = element.sum;
            }

            // если разница меньше нуля, значит анализируется месяц за прошлые годы, если 0, значит сейчас январь и нужно эти данные пропустить
            let monthDiff = moment.unix(element.month).startOf('month').diff(moment().startOf('year'), 'months', false);
            if (monthDiff < 0) {
                monthDiff = 12;
            }
            if (monthDiff == 0) {
                return;
            }

            if (_this.dataAverage[year] != undefined) {
                _this.dataAverage[year] += element.sum / monthDiff;
            } else {
                _this.dataAverage[year] = element.sum / monthDiff;
            }
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
        google.charts.load("current", {packages: ['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            let data = [columnsName];
            for (let property in chartData) {
                if (chartData.hasOwnProperty(property)) {
                    data.push([property, chartData[property]])
                }
            }
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