import React  from 'react';
import './Balance.css'

const Balance = ({active}) => {
    return <div className={`js-income-page js-page page ${active ? 'active' : ''}`} data-name="balance">
        <h1>[[balance]]</h1>
        <div className="balance-statistic">

            <h2>[[balance-chart-title]]</h2>
            <div className="balance-chart" id="js-balance-chart"></div>

            <h2>[[balance-chart-diff-title]]</h2>
            <div className="balance-chart" id="js-balance-diff-chart"></div>

            <h2>[[costs-chart-title]]</h2>
            <div className="costs-chart" id="js-costs-chart"></div>

            <div className="inline-blocks">
                <div className="balance-chart balance-pie-chart" id="js-balance-pie-chart"></div>
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
        </article>
    </div>
};


export default Balance;