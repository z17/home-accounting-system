function uniqueArrayFilter(value, index, self) {
    return self.indexOf(value) === index;
}

function numberWithSpaces(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
}

module.exports.uniqueArrayFilter = uniqueArrayFilter;
module.exports.numberWithSpaces = numberWithSpaces;