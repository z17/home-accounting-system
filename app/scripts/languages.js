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
};

function getText(word) {
    if (legend.hasOwnProperty(word)) {
        return legend[word].ru;
    }
    return word;
}

module.exports.getText = getText;