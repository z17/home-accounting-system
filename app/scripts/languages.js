const legend = {
    title: {
        ru: 'Cromberg - система личного учёта',
        en: 'Cromberg - personal finance accounting system',
        fr: 'Cromberg - système de comptabilité financière personnelle'
    },
    income: {
        ru: 'Доход',
        en: 'Income',
        fr: 'Revenu'
    },
    balance: {
        ru: 'Баланс',
        en: 'Balance',
        fr: 'Balance'
    },
    settings: {
        ru: 'Настройки',
        en: 'Settings',
        fr: 'Paramètres'
    },
    remind: {
        ru: 'Присылать мне уведомления каждый месяц',
        en: 'Remind me every month about balance',
        fr: 'Rappelez-moi chaque mois la balance'
    },
    'remind-email': {
        ru: 'E-mail для уведомлений',
        en: 'E-mail for reminds',
        fr: 'E-mail de rappel'
    },
    sum: {
        ru: 'Сумма',
        en: 'Sum',
        fr: 'Somme'
    },
    average: {
        ru: 'Средний',
        en: 'Average',
        fr: 'Moyenne'
    },
    'top-month': {
        ru: 'Лучший месяц',
        en: 'Best month',
        fr: 'Meilleur mois'
    },
    'worst-month': {
        ru: 'Худший месяц',
        en: 'Worst month',
        fr: 'Pire mois'
    },
    date: {
        ru: 'Дата поступления средств',
        en: 'Date of receive money',
        fr: 'Date de réception de l\'argent'
    },
    month: {
        ru: 'Месяц',
        en: 'Month',
        fr: 'Mois'
    },
    type: {
        ru: 'Тип',
        en: 'Type',
        fr: 'Type'
    },
    contact: {
        ru: 'Контакт',
        en: 'Contact',
        fr: 'Contact'
    },
    description: {
        ru: 'Описание',
        en: 'Description',
        fr: 'Description'
    },
    'balance-source-input': {
        ru: 'Введите место для хранения средств',
        en: 'Enter a place to storage money',
        fr: 'Entrer un endroit pour ranger de l\'argent'
    },
    save: {
        ru: 'Сохранить',
        en: 'Save',
        fr: 'Enregister'
    },
    'income-month': {
        ru: 'Доход по месяцам',
        en: 'Income by month',
        fr: 'Revenu mensuel'
    },
    'income-year': {
        ru: 'Доход по годам',
        en: 'Income by year',
        fr: 'Revenu annuel'
    },
    'income-average': {
        ru: 'Средний доход по годам',
        en: 'Average income by year',
        fr: 'Revenu moyen annuel'
    },
    'income-by-type': {
        ru: 'По типам',
        en: 'By types',
        fr: 'Par types'
    },
    'income-by-contact': {
        ru: 'По контактам',
        en: 'By contacts',
        fr: 'Par des contacts'
    },
    'backup-folder': {
        ru: 'Папка для бекапов',
        en: 'Backup folder',
        fr: 'Dossier de sauvegarde'
    },
    'database-folder': {
        ru: 'Папка для базы данных',
        en: 'Database folder',
        fr: 'Dossier de la base de données '
    },
    'choose-folder': {
        ru: 'Выберите папку',
        en: 'Choose folder',
        fr: 'Choisissez dossier'
    },
    'balance-chart-title': {
        ru: 'Баланс по месяцам',
        en: 'Balance by months',
        fr: 'Balance par mois'
    },
    'balance-chart-diff-title': {
        ru: 'Разница с предыдущим месяцем',
        en: 'Diff with previous month',
        fr: 'Balance par mois'
    },
    'balance-pie-chart-title': {
        ru: 'За последний месяц: ?',
        en: 'Last month: ?',
        fr: 'Le mois dernier: ?'
    },
    'costs-chart-title': {
        ru: 'Расход по месяцам',
        en: 'Costs by months',
        fr: 'Coûts par mois'
    },
    'cost': {
        ru: 'Расход',
        en: 'Spending',
        fr: 'Déchets'
    },
    'no-internet': {
        ru: 'Без подключения к интернету работа программы невозможна',
        en: 'Its need internet connection for correct work',
        fr: 'Connexion internet nécessaire pour fonctionné correctement'
    },
    'language': {
        ru: 'Язык',
        en: 'Language',
        fr: 'Langue'
    },
    'statistic': {
        ru: 'Статистика',
        en: 'Statistic',
        fr: 'Statistique'
    },
    'new-version': {
        ru: 'Вышла новая версия приложения. Текущая версия: ?, новая версия: ?.',
        en: 'A new version of the application has been released. Current: ?, new: ?.',
        fr: 'Une nouvelle version de l\'application a été publiée. Actuel:?, nouveau:?.'
    },
};

function Languages() {
    this.setLanguage(navigator.language);
}

Languages.prototype.getText = function (word) {
    const lang = this.lang;

    if (!legend.hasOwnProperty(word)) {
        return word;
    }

    if (legend[word].hasOwnProperty(lang)) {
        return legend[word][lang];
    }

    return word;
};

Languages.prototype.getTextWithPlaceholders = function (word, array) {
    let text = this.getText(word);
    array.forEach(function (element) {
        text = text.replace('?', element);
    });
    return text;
};

Languages.prototype.setLanguage = function (lang) {
    if (!lang) {
        lang = navigator.language;
    }

    switch (lang) {
        case 'ru':
            this.lang = 'ru';
            break;
        case 'fr':
            this.lang = 'fr';
            break;
        default:
            this.lang = 'en';
    }
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

module.exports = new Languages();
