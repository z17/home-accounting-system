function onLinkClick(e, shell) {
    if (e.target.getAttribute('href') !== null) {
        e.preventDefault();
        shell.openExternal(e.target.getAttribute('href'));
    }
}

function reloadGraph(tabName, incomeView, balanceView) {
    switch (tabName) {
        case 'income':
            incomeView.reloadGraph();
            break;
        case 'balance':
            balanceView.reloadGraph();
            break;
        default:
            alert('Unknown tab name: ' + name);
    }
}

function makeActive(tabName, incomeView, balanceView) {
    $('.js-page').removeClass('active');
    $('.js-tab').removeClass('active');
    $('.js-tab[data-name=' + tabName + ']').addClass('active');
    $('.js-page[data-name="' + tabName + '"]').addClass('active');
    reloadGraph(tabName, incomeView, balanceView);
}

function actualResizeHandler(incomeView, balanceView) {
    let name = $('.js-tab.active').data('name');
    reloadGraph(name, incomeView, balanceView);
}

module.exports = {onLinkClick, makeActive, actualResizeHandler};