import React, {useState} from 'react';
import './Income.css'
import IncomeLine from "../IncomeLine";
import IncomeAddForm from "../IncomeAddForm";

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const Income = ({active}) => {

    const [incomeArray, setIncomeArray] = useState([])

    // todo: google for multiple catch ispRender events
    ipcRenderer.on('income-data', function (event, data) {
        data.sort((a, b) => {
            return a.date - b.date;
        });

        setIncomeArray(data);
    });

    ipcRenderer.on('income-data-deleted', function (event, incomeId) {
        setIncomeArray(incomeArray.filter(function(income) {
            return income.id !== incomeId
        }));
    })

    ipcRenderer.on('income-data-inserted', function (event, incomeItem) {
        const newArray = incomeArray.slice();
        newArray.push(incomeItem);
        setIncomeArray(newArray);
    });

    ipcRenderer.on('income-edited', function (event, income) {
        setIncomeArray(incomeArray.map(function(item) {
            if (income.id !== item.id) {
                return item;
            }

            item = income;
            return item
        }));
    });

    return  <div className={`js-income-page js-page page ${active ? 'active' : ''}`} data-name="income">
        <h1>[[income]]</h1>

        <div className="income-statistic">
            <h2>[[income-month]]</h2>
            <div className="income-chart income-month-chart" id="js-income-month-chart"></div>
            <div className="inline-blocks">
                <div className="income-chart">
                    <h2>[[income-year]]</h2>
                    <div id="js-income-year-chart" className="income-year-chart"></div>
                </div>
                <div className="income-chart">
                    <h2>[[income-average]]</h2>
                    <div id="js-income-average-chart" className="income-average-chart"></div>
                </div>
                <div className="income-data">
                    <h2>[[statistic]]</h2>
                    <p className="data-line"><span className="income-data-name">[[sum]]:</span> <span
                        className="js-income-sum data-value"></span></p>
                    <p className="data-line"><span className="income-data-name">[[average]]:</span> <span
                        className="js-income-average data-value"></span></p>
                    <p className="data-line"><span className="income-data-name">[[top-month]]:</span> <span
                        className="js-income-top data-value"></span></p>
                    <p className="data-line"><span className="income-data-name">[[worst-month]]:</span> <span
                        className="js-income-worst data-value"></span></p>
                </div>
                <div className="income-chart">
                    <h2>[[income-by-type]]</h2>
                    <div id="js-income-by-types-chart" className="income-by-types-chart"></div>
                </div>
                <div className="income-chart">
                    <h2>[[income-by-contact]]</h2>
                    <div id="js-income-by-contacts-chart" className="income-by-contacts-chart"></div>
                </div>
            </div>
        </div>
        <div className="income-table">
            <table className="data-table">
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
            </table>
        </div>
    </div>
};


export default Income;