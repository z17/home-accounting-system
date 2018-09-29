google.charts.load('current', {packages: ['annotatedtimeline']});

document.addEventListener("DOMContentLoaded", function () {
    let data_day = document.getElementsByClassName("js-data-day")[0].textContent;
    data_day = JSON.parse(data_day);
    let chart_element_day = document.getElementsByClassName("js-stats-launch-by-day")[0];
    draw(data_day, chart_element_day);

    let data_month = document.getElementsByClassName("js-data-month")[0].textContent;
    data_month = JSON.parse(data_month);
    let chart_element_month = document.getElementsByClassName("js-stats-launch-by-month")[0];
    draw(data_month, chart_element_month);

});

function draw(data, chart_element) {

    google.charts.setOnLoadCallback(drawLaunchStats);

    function drawLaunchStats() {
        let dataForTable = data.map(function (element) {
            return [new Date(element[0]), parseInt(element[1]), parseInt(element[2])];
        });
        let labels = [['Count', 'Launches', 'Uniques launches by ip']];
        let test = labels.concat(dataForTable);
        let dataTable = google.visualization.arrayToDataTable(test);

        let options = {
            displayAnnotations: true
        };

        let chart = new google.visualization.AnnotatedTimeLine(chart_element);
        chart.draw(dataTable, options);
    }
}
