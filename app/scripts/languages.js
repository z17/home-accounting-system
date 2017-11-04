const legend = {
    title: {
        ru: 'Cromberg - система личного учёта',
        en: 'Cromberg - personal finance accounting system'
    },
    income: {
        ru: 'Доход',
        en: 'Income'
    },
    balance: {
        ru: 'Баланс',
        en: 'Balance',
    },
    settings: {
        ru: 'Настройки',
        en: 'Settings',
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
        ru: 'Сумма',
        en: 'Sum'
    },
    average: {
        ru: 'Средний',
        en: 'Average',
    },
    'top-month': {
        ru: 'Лучший месяц',
        en: 'Best month',
    },
    'worst-month': {
        ru: 'Худший месяц',
        en: 'Worst month'
    },
    date: {
        ru: 'Дата поступления средств',
        en: 'Date of receive money'
    },
    month: {
        ru: 'Месяц',
        en: 'Month'
    },
    type: {
        ru: 'Тип',
        en: 'Type'
    },
    contact: {
        ru: 'Контакт',
        en: 'Contact'
    },
    description: {
        ru: 'Описание',
        en: 'Description'
    },
    'balance-source-input': {
        ru: 'Введите место для хранения средств',
        en: 'Enter a place to storage money'
    },
    save: {
        ru: 'Сохранить',
        en: 'Save'
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
        ru: 'Папка для бекапов',
        en: 'Backup folder'
    },
    'choose-folder': {
        ru: 'Выберите папку',
        en: 'Choose folder'
    },
    'balance-chart-title': {
        ru: 'Баланс по месяцам',
        en: 'Balance by months'
    },
    'costs-chart-title': {
        ru: 'Расход по месяцам',
        en: 'Costs by months'
    },
    'no-internet': {
        ru: 'Без подключения к интернету работа программы невозможна',
        en: 'Its need internet connection for correct work'
    },
    'language': {
        ru: 'Язык',
        en: 'Language'
    },
    'statistic': {
        ru: 'Статистика',
        en: 'Statistic',
    }
};

function Languages() {
    if (navigator.language == 'ru') {
        this.lang =  'ru';
    } else {
        this.lang = 'en';
    }
}

Languages.prototype.getText = function (word) {
    const lang = this.lang;

    if (!legend.hasOwnProperty(word)) {
        return word;
    }

    if (legend[word].hasOwnProperty(lang)) {
        return legend[word][lang];
    }

    if (legend[word].hasOwnProperty('en')) {
        return legend[word].en;
    }

    return word;
};

Languages.prototype.setLanguage = function (lang) {
    this.lang = lang;
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