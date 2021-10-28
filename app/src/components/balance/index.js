import React, {useEffect, useState} from 'react';
import './Balance.css'
import moment from "moment";
import Utils from "../../Utils";
import BalanceMonthsLine from "../BalanceMonthsLine";
import BalanceSourceLines from "../BalanceSourceLines";
import AddBalanceSource from "../AddBalanceSource";
const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const Balance = ({active}) => {

    const [months, setMonths] = useState([]);
    const [sources, setSources] = useState({});
    let balanceSum = 0;

    useEffect(() => {
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
            console.log('setSources');
            console.log(sourcesInit);
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
    }, []);

    // search last unempty months
    let lastUnemptyMonth = null
    for (let monthIndex in months.reverse()) {
        let month = months[monthIndex];
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
        balanceSum += sources[source].months[lastUnemptyMonth];
    }

    return <div className={`js-income-page page ${active ? 'active' : ''}`}>
        <h1>[[balance]]</h1>
        <div className="balance-statistic">

            <h2>[[balance-chart-title]]</h2>
            <div className="balance-chart" id="js-balance-chart"/>

            <h2>[[balance-chart-diff-title]]</h2>
            <div className="balance-chart" id="js-balance-diff-chart"/>

            <h2>[[costs-chart-title]]</h2>
            <div className="costs-chart" id="js-costs-chart"/>

            <div className="inline-blocks">
                <div className="balance-chart balance-pie-chart" id="js-balance-pie-chart"/>
                <div className="balance-data">
                    <h2>[[statistic]]</h2>
                    <p className="data-line"><span className="income-data-name">[[sum]]:</span> <span
                        className="data-value">{Utils.numberWithSpaces(balanceSum)}</span></p>
                </div>
            </div>
        </div>
        <AddBalanceSource/>
        <article className="balance-items">
            <table className="balance-items-table">
                <tbody>
                   <BalanceMonthsLine months={months}/>
                   <BalanceSourceLines sources={sources} months={months}/>
                </tbody>
            </table>
        </article>
    </div>
};


export default Balance;