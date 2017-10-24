const legend = {
    title: {
        ru: 'Cromberg - система личного учёта'
    },
    income: {
        ru: 'Доход'
    },
    balance: {
        ru: 'Баланс'
    },
    settings: {
        ru: 'Настройки'
    },
    remind: {
        ru: 'Присылать мне уведомления каждый месяц',
        en: 'Remind me every month about balance'
    },
    'remind-email': {
        ru: 'E-mail для уведомлений',
        en: 'E-mail for reminds',
    },
    sum: {
        ru: 'Сумма'
    },
    average: {
        ru: 'Средний'
    },
    'top-month': {
        ru: 'Лучший месяц'
    },
    'worst-month': {
        ru: 'Худший месяц'
    },
    date: {
        ru: 'Дата поступления средств'
    },
    month: {
        ru: 'Месяц'
    },
    type: {
        ru: 'Тип'
    },
    contact: {
        ru: 'Контакт'
    },
    description: {
        ru: 'Описание'
    },
    'balance-source-input': {
        ru: 'Введите место для хранения средств'
    },
    save: {
        ru: 'Сохранить'
    },
    'income-month': {
        ru: 'Доход по месяцам',
        en: 'Income by month'
    },
    'income-year': {
        ru: 'Доход по годам',
        en: 'Income by year'
    },
    'income-average': {
        ru: 'Средний доход по годам',
        en: 'Average income by year'
    },
    'backup-folder': {
        ru: 'Папка для бекапов'
    },
    'choose-folder': {
        ru: 'Выберите папку'
    },
    'balance-chart-title': {
        ru: 'Баланс по месяцам'
    },
    'costs-chart-title': {
        ru: 'Расход по месяцам'
    },
    'no-internet': {
        ru: 'Без подключения к интернету работа программы невозможна'
    }
};

function Languages() {
}

Languages.prototype.getText = function (word) {
    if (legend.hasOwnProperty(word)) {
        return legend[word].ru;
    }
    return word;
};

Languages.prototype.replacePlaceholders = function (pageText) {
    let regex = /\[\[([\w-]*?)\]\]/g;
    let words = pageText.match(regex);
    words.forEach((value) => {
        let word = value.substr(2, value.length - 4);
        let text = this.getText(word);
        pageText = pageText.replace(value, text);
    });
    return pageText;
};


module.exports = Languages;