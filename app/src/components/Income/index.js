import React, {useEffect, useState} from 'react';
import './Income.css'
import IncomeLine from "../IncomeLine";
import IncomeAddForm from "../IncomeAddForm";
import * as Utils from "../../Utils";
import Chart from "react-google-charts";
import strings from "../../models/lang";
import {
    getIncomeSum,
    getChartsData,
    getTopAndWorstValues,
    generateDataForMonthChart,
    generateDataForYearChart,
    generateDataForAverageYearChart,
    generateDataForPieChart
} from "../../models/income";

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const Income = ({active}) => {

    const [incomeArray, setIncomeArray] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [paymentTypes, setPaymentTypes] = useState([]);

    let incomeAverage;
    let incomeTopMonthValue;
    let incomeTopMonthName;
    let incomeWorstMonthValue;
    let incomeWorstMonthName;

    useEffect(() => {
        ipcRenderer.send('component-income-ready');

        ipcRenderer.on('income-data', function (event, data) {
            data.sort((a, b) => {
                return a.date - b.date;
            });

            setIncomeArray(data);

            let paymentTypes = data.map(function (e) {
                return e.paymentType;
            });
            setPaymentTypes(paymentTypes.filter(Utils.uniqueArrayFilter));

            let contacts = data.map(function (e) {
                return e.contact;
            });
            setContacts(contacts.filter(Utils.uniqueArrayFilter));

        });

        ipcRenderer.on('income-data-deleted', function (event, incomeId) {
            setIncomeArray(incomeArray.filter(function (income) {
                return income.id !== incomeId
            }));
        });

        ipcRenderer.on('income-data-inserted', function (event, incomeItem) {
            const newArray = incomeArray.slice();
            newArray.push(incomeItem);
            newArray.sort((a, b) => {
                return a.date - b.date;
            });
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

    let dataSumByMonth;
    let dataSumByYear;
    let dataAverageByYear;

    let incomeSum = getIncomeSum(incomeArray);
    [dataSumByMonth, dataSumByYear, dataAverageByYear] = getChartsData(incomeArray);

    [incomeTopMonthValue, incomeTopMonthName, incomeWorstMonthValue, incomeWorstMonthName] = getTopAndWorstValues(dataSumByMonth);

    let incomeByMonthsChartArray = generateDataForMonthChart(dataSumByMonth);

    let incomeByYearChartArray = generateDataForYearChart(dataSumByYear);

    let averageChartArray = generateDataForAverageYearChart(dataAverageByYear);

    let byContactsChartArray = generateDataForPieChart(incomeArray, 'contact', ['Contact', 'Sum']);
    let byTypeChartArray = generateDataForPieChart(incomeArray, 'paymentType', ['Payment Type', 'Sum']);

    incomeAverage = Math.round(incomeSum / Object.keys(dataSumByMonth).length);

    return  <div className={`page ${active ? 'active' : ''}`} data-name="income">
        <h1>{strings.income}</h1>

        <div className="income-statistic">
            <h2>{strings.income_month}</h2>
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
                    <h2>{strings.income_year}</h2>
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
                    <h2>{strings.income_average}</h2>
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
                    <h2>{strings.statistic}</h2>
                    <p className="data-line"><span className="income-data-name">{strings.sum}:</span> <span className="data-value">{Utils.numberWithSpaces(incomeSum)}</span></p>
                    <p className="data-line"><span className="income-data-name">{strings.average}:</span> <span className="data-value">{Utils.numberWithSpaces(incomeAverage)}</span></p>
                    <p className="data-line"><span className="income-data-name">{strings.top_month}:</span> <span className="data-value">{Utils.numberWithSpaces(incomeTopMonthValue)}, {incomeTopMonthName}</span></p>
                    <p className="data-line"><span className="income-data-name">{strings.worst_month}:</span> <span className="data-value">{Utils.numberWithSpaces(incomeWorstMonthValue)}, {incomeWorstMonthName}</span></p>
                </div>
                <div className="income-chart">
                    <h2>{strings.income_by_type}</h2>
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
                    <h2>{strings.income_by_contact}</h2>
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
                        <th>{strings.date}</th>
                        <th>{strings.month}</th>
                        <th>{strings.sum}</th>
                        <th>{strings.type}</th>
                        <th>{strings.contact}</th>
                        <th>{strings.description}</th>
                    </tr>
                    {incomeArray.map((income) =>
                      <IncomeLine key={income.id} item={income} contacts={contacts} paymentTypes={paymentTypes}/>
                    )}
                    <IncomeAddForm contacts={contacts} paymentTypes={paymentTypes}/>
                </tbody>
            </table>
        </div>
    </div>
};

export default Income;