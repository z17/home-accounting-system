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
}

IncomeView.prototype.setData = function (data) {
    data.sort(function (a, b) {
        return a.date - b.date;
    });
    this.data = data;
    insertIncomeData(data);
    updateGraphData(this);
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
    updateGraphData(this);
    this.reloadGraph();
    insertIncomeToPage(item);
};

IncomeView.prototype.deleteIncome = function(id) {
  for (let i = 0; i < this.data.length; i++) {
    if (this.data[i]['_id'] === id) {
      this.data.splice(i, 1);
    }
  }
}
IncomeView.prototype.reloadGraph = function() {
    drawByMonth(this);
    drawByYear(this);
    drawAverage(this);
};

function drawByMonth(incomeItem) {
    if (!incomeItem.dataByMonth) {
      throw new Error('There is no month data in this item');
    } else {
      draw(incomeItem.dataByMonth, '100%', 400, "js-income-month-chart");
    }
}

function drawByYear(incomeItem) {
    draw(incomeItem.dataByYear, '100%', 300, "js-income-year-chart");
}

function drawAverage(incomeItem) {
    draw(incomeItem.dataAverage, '100%', 300, "js-income-average-chart");
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

//ok to stay
function updateGraphData(incomeItem) {
    let data = incomeItem.data;
    let firstMonth = moment().startOf('month');
    let firstYear = moment().startOf('year');
    let lastMonth = moment().startOf('month');
    let lastYear = moment().startOf('year');
    if (data.length != 0) {
        firstMonth = moment.unix(data[0]['data']['month']).startOf('month');
        firstYear = moment.unix(data[0]['data']['month']).startOf('year');
        lastMonth = moment.unix(data[data.length - 1]['data']['month']).startOf('month');
        lastYear = moment.unix(data[data.length - 1]['data']['month']).startOf('year');
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
        incomeItem.sum += element.data.sum;

        let month = moment.unix(element.data.month).format("MMM YYYY");
        dataByMonth[month] += element.data.sum;

        let year = moment.unix(element.data.month).format("YYYY");
        dataByYear[year] += element.data.sum;

        // если разница меньше нуля, значит анализируется месяц за прошлые годы, если 0, значит сейчас январь и нужно эти данные пропустить
        let monthDiff = moment.unix(element.data.month).startOf('month').diff(moment().startOf('year'), 'months', false);
        if (monthDiff < 0) {
            monthDiff = 12;
        }
        if (monthDiff == 0) {
            return;
        }

        dataAverage[year] += element.data.sum / monthDiff;
    });

    incomeItem.dataByMonth.data = [];
    for (let property in dataByMonth) {
        if (dataByMonth.hasOwnProperty(property)) {
            if (incomeItem.topMonth.value < dataByMonth[property] || incomeItem.topMonth.name === '') {
                incomeItem.topMonth.value = dataByMonth[property];
                incomeItem.topMonth.name = property;
            }
            if (incomeItem.worstMonth.value > dataByMonth[property] || incomeItem.worstMonth.name === '') {
                incomeItem.worstMonth.value = dataByMonth[property];
                incomeItem.worstMonth.name = property;
            }
            incomeItem.dataByMonth.data.push({
                name: property,
                value: dataByMonth[property],
                time: moment(property, "MMM YYYY").unix()
            });
        }
    }

    incomeItem.dataByYear.data = [];
    for (let property in dataByYear) {
        if (dataByYear.hasOwnProperty(property)) {
            incomeItem.dataByYear.data.push({
                name: property,
                value: dataByYear[property],
                time: moment(property, "YYYY").unix()
            });
        }
    }

    incomeItem.dataAverage.data = [];
    for (let property in dataAverage) {
        if (dataAverage.hasOwnProperty(property)) {
            incomeItem.dataAverage.data.push({
                name: property,
                value: dataAverage[property],
                time: moment(property, "YYYY").unix()
            });
        }
    }

    incomeItem.dataByMonth.data.sort(function (a, b) {
        return a.time - b.time;
    });
    incomeItem.dataByYear.data.sort(function (a, b) {
        return a.time - b.time;
    });
    incomeItem.dataAverage.data.sort(function (a, b) {
        return a.time - b.time;
    });

    incomeItem.average = Math.round(incomeItem.sum / Object.keys(incomeItem.dataByMonth.data).length);
    $('.js-income-sum').text(incomeItem.sum);
    $('.js-income-average').text(incomeItem.average);
    $('.js-income-top').text(incomeItem.topMonth.value);
    $('.js-income-worst').text(incomeItem.worstMonth.value);
}

//ok to stay
function prepareChartData(chartData) {
    let data = [chartData.cols];
    data = data.concat(chartData.data.map(function (element) {
        return [element.name, element.value];
    }));
    return google.visualization.arrayToDataTable(data);
}

//ok to stay
function insertIncomeToPage(item) {
    if (item.data) {
        let id = item._id.toString();
        let rowExample = document.querySelector('.js-income-page .js-row');
        let row = rowExample.cloneNode(true);
        console.log(row);
        row.classList.remove('js-row');
        row.dataset.id = id;
        row.querySelector('.js-delete').dataset.id = id;
        row.querySelector('.js-date').textContent = moment.unix(item.data.date).format("DD.MM.YYYY");
        row.querySelector('.js-month').textContent = moment.unix(item.data.month).format("MMM YYYY");
        row.querySelector('.js-sum').textContent = item.data.sum;
        row.querySelector('.js-payment-type').textContent = item.data.paymentType;
        row.querySelector('.js-contact').textContent = item.data.contact;
        row.querySelector('.js-description').textContent = item.data.description;
        let rowParent = rowExample.parentNode;
        rowParent.insertBefore(row, rowExample);
    } else {
      throw new Error('error in schema');
    }
}

function onDeleteClick() {
    // todo: are you sure?
    let row = $(this).closest('tr.row');
    let id = row.data('id');

    row.remove();

    if (deletedItemIndex >= 0) {
        incomeView.data.splice(deletedItemIndex, 1);
    }
    updateGraphData(incomeView.data);
    incomeView.reloadGraph();
    incomeView.onDeleteCallback(incomeView.data[deletedItemIndex]);
}


module.exports = IncomeView;
