import React, {useEffect, useState} from 'react';
import './Balance.css'
import Utils from "../../Utils";
import BalanceMonthsLine from "../BalanceMonthsLine";
import AddBalanceSource from "../AddBalanceSource";
import Chart from "react-google-charts";
import SourceLine from "../SourceLine";
import strings from "../../models/lang";
import {
    convertSourceData,
    getBalanceChartData,
    getBalanceDiffChartData,
    getBalancePieChartData,
    getBalanceSum,
    getBestMonth, getCostsChartData,
    getMonthsArray
} from "../../models/Balance";
import BalanceSumLine from "../BalanceSumLine";
const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const Balance = ({active}) => {

    const [months, setMonths] = useState([]);
    const [sources, setSources] = useState({});
    const [incomes, setIncomes] = useState([]);

    useEffect(() => {
        ipcRenderer.send('component-balance-ready');

        ipcRenderer.on('balance-types', function (event, sourceData) {

            const monthsMapIndexToValue = getMonthsArray(sourceData);
            const sourcesInit = convertSourceData(sourceData);

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

        ipcRenderer.on('income-data', function (event, data) {
            setIncomes(data);
        });

        return () => {
          ipcRenderer.removeAllListeners('balance-types');
          ipcRenderer.removeAllListeners('balance-reupdated');
          ipcRenderer.removeAllListeners('balance-updated');
          ipcRenderer.removeAllListeners('balance-inserted');
          ipcRenderer.removeAllListeners('income-data');
        };
    }, [sources, months]);


    let balanceSum;
    let lastUnEmptyMonth;
    let balanceMaxSum;
    let balanceMaxMonth;
    let isCurrentMonthEmpty;

    [balanceSum, lastUnEmptyMonth, isCurrentMonthEmpty] = getBalanceSum(sources, months);

    let balanceChartArray = getBalanceChartData(sources, months, isCurrentMonthEmpty);

    [balanceMaxSum, balanceMaxMonth] = getBestMonth(sources, months);

    let balancePieChartArray = getBalancePieChartData(sources, lastUnEmptyMonth);

    let balanceDiffChartArray = getBalanceDiffChartData(sources, months, isCurrentMonthEmpty);

    let costsChartArray = getCostsChartData(sources, months, incomes, isCurrentMonthEmpty);

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
            <div className="balance-chart" id="js-balance-diff-chart">
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
                    data={balanceDiffChartArray}
                />
            </div>

            <h2>{strings.costs_chart_title}</h2>
            <div className="costs-chart" id="js-costs-chart">
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
                    data={costsChartArray}
                />
            </div>

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
                   <BalanceSumLine sources={sources} months={months}/>
                </tbody>
            </table>
        </article>
    </div>
};


export default Balance;