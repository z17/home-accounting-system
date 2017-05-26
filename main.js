const electron = require('electron');
const Dao = require('./backend/Dao').Dao;
const functions = require('./backend/functions');

let locals = {'name': 'Hey'};
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;


// Определение глобальной ссылки , если мы не определим, окно
// окно будет закрыто автоматически когда JavaScript объект будет очищен сборщиком мусора.
let mainWindow = null;

// Проверяем что все окна закрыты и закрываем приложение.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

// Этот метод будет вызван когда Electron закончит инициализацию
// и будет готов к созданию браузерных окон.
app.on('ready', function () {
    const dao = new Dao();
    dao.drop();
    // Создаем окно браузера.
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.maximize();
    // и загружаем файл index.html нашего веб приложения.
    // mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.webContents.on('dom-ready', function () {
        dao.getIncomes(function (data) {
            mainWindow.webContents.send('income-data', data);

            let paymentTypes = data.map(function (e) {
                return e.paymentType;
            });
            paymentTypes = paymentTypes.filter(functions.uniqueArrayFilter);
            mainWindow.webContents.send('income-payment-types', paymentTypes);

            let contacts = data.map(function (e) {
                return e.contact;
            });
            contacts = contacts.filter(functions.uniqueArrayFilter);
            mainWindow.webContents.send('income-contacts', contacts);

        });

        dao.getSettings(function (settings) {
            mainWindow.webContents.send('settings', settings);
        });

    });

    // mainWindow.setMenu(null);

    // TODO hide it in prod mode
    mainWindow.webContents.openDevTools();

    // Этот метод будет выполнен когда генерируется событие закрытия окна.
    mainWindow.on('closed', function () {
        // Удаляем ссылку на окно, если ваше приложение будет поддерживать несколько
        // окон вы будете хранить их в массиве, это время
        // когда нужно удалить соответствующий элемент.
        mainWindow = null;
    });

    ipcMain.on('income-add', (event, income) => {
        console.log(income, 'main');
        dao.insertIncome(income,
            function (inserted) {
                mainWindow.webContents.send('income-data-inserted', inserted);
            });
    });

    ipcMain.on('income-delete', (event, incomeId) => {
        dao.deleteIncome(incomeId, () => {
          mainWindow.webContents.send('income-data-deleted', incomeId);
        });
    });

    ipcMain.on('income-edit', (event, income) => {
        event.returnValue = true;
    });

    ipcMain.on('update-settings', (event, settings) => {
        dao.updateSettings(settings);
        event.returnValue = true;
    });

});
