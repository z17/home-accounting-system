function uniqueArrayFilter(value, index, self) {
    return self.indexOf(value) === index;
}

function numberWithSpaces(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
}

function calcStartEndDates(startDate, endDate, dateArray) {
    dateArray.sort((a, b) => {
        return a.unix() - b.unix();
    });

    if (endDate.isBefore(dateArray[dateArray.length - 1])) {
        endDate = dateArray[dateArray.length - 1];
    }
    if (startDate.isAfter(dateArray[0])) {
        startDate = dateArray[0];
    }
    return [startDate, endDate];
}

module.exports.uniqueArrayFilter = uniqueArrayFilter;
module.exports.numberWithSpaces = numberWithSpaces;
module.exports.calcStartEndDates = calcStartEndDates;