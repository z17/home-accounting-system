import React, {useEffect, useState} from 'react';
import './Income.css'
import IncomeLine from "../IncomeLine";
import IncomeAddForm from "../IncomeAddForm";
import moment from "moment";
import * as Utils from "../../Utils";
import Chart from "react-google-charts";

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const Income = ({active}) => {

    const [incomeArray, setIncomeArray] = useState([]);

    let incomeSum = 0;
    let incomeAverage;
    let incomeTopMonthValue = 0;
    let incomeTopMonthName = null;
    let incomeWorstMonthValue = 0;
    let incomeWorstMonthName = null;

    useEffect(() => {
        ipcRenderer.on('income-data', function (event, data) {
            data.sort((a, b) => {
                return a.date - b.date;
            });

            setIncomeArray(data);
        });

        ipcRenderer.on('income-data-deleted', function (event, incomeId) {
            setIncomeArray(incomeArray.filter(function (income) {
                return income.id !== incomeId
            }));
        });

        ipcRenderer.on('income-data-inserted', function (event, incomeItem) {
            const newArray = incomeArray.slice();
            newArray.push(incomeItem);
            setIncomeArray(newArray);
        });

        ipcRenderer.on('income-edited', function (event, income) {
            setIncomeArray(incomeArray.map(function (item) {
                if (income.id !== item.id) {
                    return item;
                }

                item = income;
                return item
            }));
        });

        return () => {
            ipcRenderer.removeAllListeners('income-data');
            ipcRenderer.removeAllListeners('income-data-deleted');
            ipcRenderer.removeAllListeners('income-data-inserted');
            ipcRenderer.removeAllListeners('income-edited');
        };
    }, [incomeArray]);


    let firstMonth = moment().startOf('month');
    let firstYear = moment().startOf('year');
    let lastMonth = moment().startOf('month');
    let lastYear = moment().startOf('year');
    if (incomeArray.length !== 0) {
        firstMonth = moment.unix(incomeArray[0]['month']).startOf('month');
        firstYear = moment.unix(incomeArray[0]['month']).startOf('year');
        lastMonth = moment.unix(incomeArray[incomeArray.length - 1]['month']).startOf('month');
        lastYear = moment.unix(incomeArray[incomeArray.length - 1]['month']).startOf('year');
    }

    let firstYearStr = firstYear.format('YYYY');
    let firstYearMonthCount = 12 - firstMonth.month();

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

    incomeArray.forEach(function (element) {
        incomeSum += element.sum;

        let month = moment.unix(element.month).format("MMM YYYY");
        dataByMonth[month] += element.sum;

        let year = moment.unix(element.month).format("YYYY");
        dataByYear[year] += element.sum;

        // если разница меньше нуля, значит анализируется месяц за прошлые годы
        let monthDiff = 12;

        let isPreviousYear = moment().format("YYYY") !== year;
        if (!isPreviousYear) {
            monthDiff = moment().month() + 1;
        } else if (year === firstYearStr) {
            monthDiff = firstYearMonthCount;
        }

        dataAverage[year] += element.sum / monthDiff;
    });

    let incomeByMonthsChartArray = [["Month", "Sum"]];
    for (let property in dataByMonth) {
        if (dataByMonth.hasOwnProperty(property)) {
            if (incomeTopMonthValue < dataByMonth[property] || incomeTopMonthName === null) {
                incomeTopMonthValue = dataByMonth[property];
                incomeTopMonthName = property;
            }
            if (incomeWorstMonthValue > dataByMonth[property] || incomeWorstMonthName === null) {
                incomeWorstMonthValue = dataByMonth[property];
                incomeWorstMonthName = property;
            }
            incomeByMonthsChartArray.push([property, dataByMonth[property]]);
        }
    }

    let incomeByYearChartArray = [["Year", "Sum"]];
    for (let property in dataByYear) {
        if (dataByYear.hasOwnProperty(property)) {
            incomeByYearChartArray.push([property, dataByYear[property]])
        }
    }

    let averageChartArray = [["Year", "Middle sum"]];
    for (let property in dataAverage) {
        if (dataAverage.hasOwnProperty(property)) {
            averageChartArray.push( [property, dataAverage[property]]);
        }
    }

    let byContactsChartArray = preparePieChartDataByField(incomeArray, 'contact', ['Contact', 'Sum']);
    let byTypeChartArray = preparePieChartDataByField(incomeArray, 'paymentType', ['Payment Type', 'Sum']);

    incomeAverage = Math.round(incomeSum / Object.keys(dataByMonth).length);

    return  <div className={`js-income-page js-page page ${active ? 'active' : ''}`} data-name="income">
        <h1>[[income]]</h1>

        <div className="income-statistic">
            <h2>[[income-month]]</h2>
            <div className="income-chart income-month-chart">
                <Chart
                    chartType="ColumnChart"
                    loader={<div>Loading Chart</div>}
                    options={{
                        width: "100%",
                        height: 400,
                        bar: {groupWidth: "95%"},
                        legend: {position: "none"},
                        animation: {
                            duration: 500,
                            easing: 'out',
                        },
                        vAxis: {
                            minValue: 0
                        }
                    }}
                    data={incomeByMonthsChartArray}
                />
            </div>
            <div className="inline-blocks">
                <div className="income-chart">
                    <h2>[[income-year]]</h2>
                    <div className="income-year-chart">
                        <Chart
                            chartType="ColumnChart"
                            loader={<div>Loading Chart</div>}
                            options={{
                                width: "100%",
                                height: 300,
                                bar: {groupWidth: "95%"},
                                legend: {position: "none"},
                                animation: {
                                    duration: 500,
                                    easing: 'out',
                                },
                                vAxis: {
                                    minValue: 0
                                }
                            }}
                            data={incomeByYearChartArray}
                        />
                    </div>
                </div>
                <div className="income-chart">
                    <h2>[[income-average]]</h2>
                    <div id="js-income-average-chart" className="income-average-chart">
                        <Chart
                            chartType="ColumnChart"
                            loader={<div>Loading Chart</div>}
                            options={{
                                width: "100%",
                                height: 300,
                                bar: {groupWidth: "95%"},
                                legend: {position: "none"},
                                animation: {
                                    duration: 500,
                                    easing: 'out',
                                },
                                vAxis: {
                                    minValue: 0
                                }
                            }}
                            data={averageChartArray }
                        />
                    </div>
                </div>
                <div className="income-data">
                    <h2>[[statistic]]</h2>
                    <p className="data-line"><span className="income-data-name">[[sum]]:</span> <span className="data-value">{Utils.numberWithSpaces(incomeSum)}</span></p>
                    <p className="data-line"><span className="income-data-name">[[average]]:</span> <span className="data-value">{Utils.numberWithSpaces(incomeAverage)}</span></p>
                    <p className="data-line"><span className="income-data-name">[[top-month]]:</span> <span className="data-value">{Utils.numberWithSpaces(incomeTopMonthValue)}, {incomeTopMonthName}</span></p>
                    <p className="data-line"><span className="income-data-name">[[worst-month]]:</span> <span className="data-value">{Utils.numberWithSpaces(incomeWorstMonthValue)}, {incomeWorstMonthName}</span></p>
                </div>
                <div className="income-chart">
                    <h2>[[income-by-type]]</h2>
                    <div id="js-income-by-types-chart" className="income-by-types-chart">
                        <Chart
                            chartType="PieChart"
                            loader={<div>Loading Chart</div>}
                            data={byTypeChartArray}
                            options={{
                                width: '100%',
                                height: 350,
                                pieSliceText: 'label',
                                // sliceVisibilityThreshold: 0.05,
                            }}
                        />
                    </div>
                </div>
                <div className="income-chart">
                    <h2>[[income-by-contact]]</h2>
                    <div id="js-income-by-contacts-chart" className="income-by-contacts-chart">
                        <Chart
                            chartType="PieChart"
                            loader={<div>Loading Chart</div>}
                            data={byContactsChartArray}
                            options={{
                                width: '100%',
                                height: 350,
                                pieSliceText: 'label',
                                // sliceVisibilityThreshold: 0.05,
                            }}
                        />

                    </div>
                </div>
            </div>
        </div>
        <div className="income-table">
            <table className="data-table">
                <tbody>
                    <tr>
                        <th>[[date]]</th>
                        <th>[[month]]</th>
                        <th>[[sum]]</th>
                        <th>[[type]]</th>
                        <th>[[contact]]</th>
                        <th>[[description]]</th>
                    </tr>
                    {incomeArray.map((income) =>
                      <IncomeLine key={income.id} item={income}/>
                    )}
                    <IncomeAddForm />
                </tbody>
            </table>
        </div>
    </div>
};

function preparePieChartDataByField(data, field, titleFields) {
    let map = data.reduce(
        (accumulator, item) => {
            if (accumulator.hasOwnProperty(item[field])) {
                accumulator[item[field]] += item.sum;
            } else {
                accumulator[item[field]] = item.sum;
            }
            return accumulator;
        }, {}
    );

    let result = [titleFields];
    for (let type in map) {
        if (map.hasOwnProperty(type)) {
            result.push([type, map[type]]);
        }
    }
    return result;
}

export default Income;