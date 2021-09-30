import React  from 'react';
import './Income.css'

const Index = ({active}) => {
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
                <tr className="js-row row js-income-row">
                    <td className="js-date"></td>
                    <td className="js-month"></td>
                    <td className="js-sum"></td>
                    <td className="js-payment-type"></td>
                    <td className="js-contact"></td>
                    <td>
                        <span className="js-description"></span>
                        <span data-id="" className="save income-button js-income-save"></span>
                        <span data-id="" className="edit income-button js-income-edit"></span>
                        <span data-id="" className="delete income-button js-income-delete"></span>
                    </td>
                </tr>
                <tr className="form">
                    <td><input className="js-add-date" form="income-form" type="date" placeholder="Date"
                               min="1900-01-01" max="2100-01-01" required/></td>
                    <td><input className="js-add-month" form="income-form" type="month" placeholder="Month"
                               min="1900-01" max="2100-01" required/></td>
                    <td><input className="js-add-sum" form="income-form" type="number" placeholder="[[sum]]"
                               required/></td>
                    <td>
                        <input className="js-add-payment-type" form="income-form" placeholder="[[type]]"
                               required/>
                    </td>
                    <td><input className="js-add-contact" form="income-form" type="text"
                               placeholder="[[contact]]"
                               required/>
                    </td>
                    <td>
                        <input className="js-add-description" form="income-form" type="text"
                               placeholder="[[description]]"/>
                        <input className="submit js-submit" form="income-form" type="submit"/>
                    </td>
                </tr>
            </table>
        </div>

        <form action="#" id="income-form" className="js-income-add">
        </form>
    </div>
};


export default Index;