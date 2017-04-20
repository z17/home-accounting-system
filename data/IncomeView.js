var IncomeView = {
    data: [],
    byMonth: [],

    setData: function (data) {
        this.data = data;
        var _this = this;
        data.forEach(function (element) {
            var month = moment.unix(element.month).format("MM.YYYY");
            if (_this.byMonth[month] != undefined) {
                _this.byMonth[month] += element.sum;
            } else {
                _this.byMonth[month] = element.sum;
            }

        });
    },
    getDataByMonth: function () {
        return this.byMonth;
    },
    getData: function () {
        return this.data;
    }
};

module.exports.IncomeView = IncomeView;