import React  from 'react';
import './Balance.css'
import moment from "moment";
import Utils from "../../Utils";
const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const Balance = ({active}) => {

    ipcRenderer.on('balance-types', function (event, sourceData) {
        const sources = [];

        let firstMonth = moment().startOf('month');
        let lastMonth = moment().startOf('month');

        const sourcesMapIndexToId = []
        let index = 0
        for (let i in sourceData) {
            const source = sourceData[i]
            sources[source.id] = {
                id : source.id,
                name: source.name,
                months: source.value,
                index: index
            };
            sourcesMapIndexToId[index] = source.id

            let months = Object.keys(source.value);
            let monthData = [];
            for (let i = 0; i < months.length; i++) {
                monthData.push(moment(months[i], "MMYYYY"));
            }

            [firstMonth, lastMonth] = Utils.calcStartEndDates(firstMonth, lastMonth, monthData);
            index++;
        }
        const countMonths = lastMonth.diff(firstMonth, 'months', false) + 1;

        let month = firstMonth.clone();
        const monthsMapValueToIndex = []
        const monthsMapIndexToValue = []
        for (let i = 0; i < countMonths; i++) {
            const monthValue = month.format("MMYYYY");
            monthsMapValueToIndex[monthValue] = i;
            monthsMapIndexToValue[i] = monthValue;
            month.add(1, 'M');
        }

        const balanceTable = [];

        for (let j = 0; j < sourcesMapIndexToId.length; j++) {
            balanceTable[j] = []
            const sourceValues = sources[sourcesMapIndexToId[j]].months;
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

        console.log(balanceTable);

        console.log(sources);
        console.log(sourcesMapIndexToId);

        console.log(monthsMapValueToIndex);
        console.log(monthsMapIndexToValue);
    });

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
                        className="js-balance-sum data-value"></span></p>
                </div>
            </div>
        </div>
        <form className="js-balance-source-form" action="" method="post">
            <label htmlFor="balancesource">[[balance-source-input]]:</label>
            <input type="text" id="balancesource" name="balancesource" value="" />
            <button type="submit" name="incrementsources">+</button>
        </form>
        <article className="balance-items">
            <table className="balance-items-table">
                <tr>
                    <th></th>
                    <th>Январь 2015</th>
                    <th>Февраль 2015</th>
                    <th>Март 2015</th>
                    <th>Апрель 2015</th>
                    <th>Март 2015</th>
                    <th>Июнь 2015</th>
                    <th>Июль 2015</th>
                    <th>Август 2015</th>
                    <th>Сентябрь 2015</th>
                    <th>Октябрь 2015</th>
                    <th>Ноябрь 2015</th>
                    <th>Декабрь 2015</th>
                </tr>
                <tr>
                    <th>Открытие брокер</th>
                    <td>1 000</td>
                    <td>50 000</td>
                    <td>14 000</td>
                    <td>12 000</td>
                    <td>150 000</td>
                    <td>1 000</td>
                    <td>50 000</td>
                    <td>14 000</td>
                    <td>12 000</td>
                    <td>150 000</td>
                    <td>1 000</td>
                    <td>50 000</td>
                </tr>
                <tr>
                    <th>Райфайзен</th>
                    <td>1 000</td>
                    <td>570 000</td>
                    <td>12 000</td>
                    <td>14 000</td>
                    <td>12 000</td>
                    <td>10 000</td>
                    <td>1 000</td>
                    <td>14 000</td>
                    <td>90 000</td>
                    <td>150 000</td>
                    <td>1 000</td>
                    <td>50 000</td>
                </tr>
                <tr>
                    <th>Наличка</th>
                    <td>1 000</td>
                    <td>50 00</td>
                    <td>12 000</td>
                    <td>14 000</td>
                    <td>10 000</td>
                    <td>1 000</td>
                    <td>50 000</td>
                    <td>12 000</td>
                    <td>150 000</td>
                    <td>14 000</td>
                    <td>1 000</td>
                    <td>50 000</td>
                </tr>
            </table>
        </article>
    </div>
};


export default Balance;