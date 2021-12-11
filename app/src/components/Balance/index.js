import React, {useEffect, useState} from 'react';
import './Balance.css'
import moment from "moment";
import Utils from "../../Utils";
import BalanceMonthsLine from "../BalanceMonthsLine";
import AddBalanceSource from "../AddBalanceSource";
import Chart from "react-google-charts";
import SourceLine from "../SourceLine";
import strings from "../../models/lang";
const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const Balance = ({active}) => {

    const [months, setMonths] = useState([]);
    const [sources, setSources] = useState({});
    let balanceSum = 0;

    useEffect(() => {
        ipcRenderer.send('component-balance-ready');

        ipcRenderer.on('balance-types', function (event, sourceData) {

            let firstMonth = moment().startOf('month');
            let lastMonth = moment().startOf('month');

            // search first and last months
            for (let i in sourceData) {
                if (!sourceData.hasOwnProperty(i)) {
                    continue;
                }

                let months = Object.keys(sourceData[i].value);
                let monthData = months.map((month) => moment(month, "MMYYYY"));

                [firstMonth, lastMonth] = Utils.calcStartEndDates(firstMonth, lastMonth, monthData);
            }
            const countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;

            // prepare array of all months
            let month = firstMonth.clone();
            const monthsMapValueToIndex = [];
            const monthsMapIndexToValue = [];
            for (let i = 0; i < countMonths; i++) {
                const monthValue = month.format("MMYYYY");
                monthsMapValueToIndex[monthValue] = i;
                monthsMapIndexToValue[i] = monthValue;
                month.add(1, 'M');
            }

            // prepare sources object
            const sourcesMapIndexToId = [];
            const sourcesInit = {};
            let index = 0;
            for (let i in sourceData) {
                if (!sourceData.hasOwnProperty(i)) {
                    continue;
                }
                const source = sourceData[i];
                sourcesInit[source.id] = {
                    id: source.id,
                    name: source.name,
                    months: source.value,
                    index: index
                };
                sourcesMapIndexToId[index] = source.id;

                index++;
            }


            // fill balance table
            const balanceTable = [];
            for (let j = 0; j < sourcesMapIndexToId.length; j++) {
                balanceTable[j] = [];
                const sourceValues = sourcesInit[sourcesMapIndexToId[j]].months;
                let month = firstMonth.clone();
                for (let i = 0; i < countMonths; i++) {
                    let monthValue = 0;

                    if (sourceValues[month.format("MMYYYY")] !== undefined) {
                        monthValue = sourceValues[month.format("MMYYYY")];
                    }

                    balanceTable[j][i] = monthValue;

                    month.add(1, 'M');
                }
            }

            setMonths(monthsMapIndexToValue);
            setSources(sourcesInit);
        });

        ipcRenderer.on('balance-reupdated', function (event, sourceId, month) {
            const s = Object.assign({}, sources);
            s[sourceId].months[month] = 0;
            setSources(s);
        });

        ipcRenderer.on('balance-updated', function (event, sourceId, month, sum) {
            let s = Object.assign({}, sources);
            s[sourceId].months[month] = sum;
            setSources(s);
        });

        ipcRenderer.on('balance-inserted', function (event, source) {
            let s = Object.assign({}, sources);
            s[source.id] = {
                id: source.id,
                name: source.name,
                months: source.value,
            };
            setSources(s);
        });
        return () => {
          ipcRenderer.removeAllListeners('balance-types');
          ipcRenderer.removeAllListeners('balance-reupdated');
          ipcRenderer.removeAllListeners('balance-updated');
          ipcRenderer.removeAllListeners('balance-inserted');
        };
    }, [sources, months]);

    // search last unempty months
    let lastUnemptyMonth = null;
    for (let month of months.slice().reverse()) {
        for (let source in sources) {
            if (sources[source].months.hasOwnProperty(month)) {
                lastUnemptyMonth = month;
                break;
            }
        }
        if (lastUnemptyMonth !== null) {
            break
        }
    }

    for (let source in sources) {
        let value = sources[source].months[lastUnemptyMonth];
        if (value) {
            balanceSum += value;
        }
    }

    let balanceChartArray = [["month"]];
    for (let source in sources) {
        balanceChartArray[0].push(sources[source].name);
    }

    balanceChartArray.push(...months.map((month) => {
        let chartMonthData = [moment(month, "MMYYYY").format("MMM YYYY")];

        for (let source in sources) {
            let val = sources[source].months.hasOwnProperty(month) ? sources[source].months[month] : 0;
            chartMonthData.push(val);
        }
        return chartMonthData;
    }));

    let bestMonth = months.map((month) => {
        let sum = 0;
        for (let source in sources) {
            sum += sources[source].months.hasOwnProperty(month) ? sources[source].months[month] : 0;
        }
        return [month, sum];
    }).reduce((month1, month2) => {
        if (month1[1] < month2[1]) {
            month1 = month2;
        }
        return month1;
    }, ['', 0]);

    let balanceMaxSum = bestMonth[1];
    let balanceMaxMonth = moment(bestMonth[0], "MMYYYY").format("MMM YYYY");


    let balancePieChartArray = [["Source", "Sum"]];
    for (let source in sources) {
        let value = sources[source].months[lastUnemptyMonth];
        if (value) {
            balancePieChartArray.push([sources[source].name, value])
        }
    }

    return <div className={`js-income-page page ${active ? 'active' : ''}`}>
        <h1>{strings.balance}</h1>
        <div className="balance-statistic">

            <h2>{strings.balance_chart_title}</h2>
            <div className="balance-chart" id="js-balance-chart">
                <Chart
                    chartType="ColumnChart"
                    loader={<div>Loading Chart</div>}
                    options={{
                        width: "100%",
                        height: 400,
                        bar: {groupWidth: "95%"},
                        legend: {position: "top"},
                        animation: {
                            duration: 500,
                            easing: 'out',
                        },
                        isStacked: true,
                        vAxis: {
                            minValue: 0
                        }
                    }}
                    data={balanceChartArray}
                />
            </div>

            <h2>{strings.balance_chart_diff_title}</h2>
            <div className="balance-chart" id="js-balance-diff-chart"/>

            <h2>{strings.costs_chart_title}</h2>
            <div className="costs-chart" id="js-costs-chart"/>

            <div className="inline-blocks">
                <div className="balance-chart balance-pie-chart">
                    <Chart
                        chartType="PieChart"
                        loader={<div>Loading Chart</div>}
                        data={balancePieChartArray}
                        options={{
                            width: '100%',
                            height: 350,
                            pieSliceText: 'label',
                        }}
                    />
                </div>
                <div className="balance-data">
                    <h2>{strings.statistic}</h2>
                    <p className="data-line"><span className="income-data-name">{strings.sum}:</span> <span
                        className="data-value">{Utils.numberWithSpaces(balanceSum)}</span></p>
                    <p className="data-line"><span className="income-data-name">{strings.max_sum}:</span> <span
                        className="data-value">{Utils.numberWithSpaces(balanceMaxSum)}, {balanceMaxMonth}</span></p>
                </div>
            </div>
        </div>
        <AddBalanceSource/>
        <article className="balance-items">
            <table className="balance-items-table">
                <tbody>
                   <BalanceMonthsLine months={months}/>
                   {Object.keys(sources).map((sourceKey) => {
                       const source = sources[sourceKey];
                       return <SourceLine key={sourceKey} source={source} months={months}/>
                   })}
                </tbody>
            </table>
        </article>
    </div>
};


export default Balance;