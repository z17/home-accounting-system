const electron = require('electron');
const entities = require('./data/entities.js');
const moment = require('moment');
const database = require('./backend/Database');
const functions = require('./backend/functions');

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
    const Database = new database.Database();
    // Создаем окно браузера.
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.maximize();

    mainWindow.webContents.on('dom-ready', function () {
        Database.getIncomes(function (data) {
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
        Database.getOrders(function (data) {
            mainWindow.webContents.send('orders-data', data);

            let contacts = data.map(function (e) {
                return e.contact;
            });
            contacts = contacts.filter(functions.uniqueArrayFilter);
            mainWindow.webContents.send('order-contacts', contacts);


            let types = data.map(function (e) {
                return e.type;
            });
            types = types.filter(functions.uniqueArrayFilter);
            mainWindow.webContents.send('order-types', types);
        });
    });

    // и загружаем файл index.html нашего веб приложения.
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    // mainWindow.setMenu(null);

    // Открываем DevTools.
    mainWindow.webContents.openDevTools();

    // Этот метод будет выполнен когда генерируется событие закрытия окна.
    mainWindow.on('closed', function () {
        // Удаляем ссылку на окно, если ваше приложение будет поддерживать несколько
        // окон вы будете хранить их в массиве, это время
        // когда нужно удалить соответствующий элемент.
        mainWindow = null;
    });

    ipcMain.on('income-add', (event, income) => {
        Database.insertIncome(income,
            function (inserted) {
                mainWindow.webContents.send('income-data-insert', inserted);
            });
    });

    ipcMain.on('income-delete', (event, incomeId) => {
        Database.deleteIncome(incomeId);
    });

    ipcMain.on('income-edit', (event, income) => {
        console.log(income);
        event.returnValue = true;
    });

    ipcMain.on('order-add', (event, order) => {
        Database.insertOrder(order,
            function (err, newDoc) {
                console.log(err, newDoc);
            });
        event.returnValue = true;
    });

    ipcMain.on('order-delete', (event, orderId) => {
        Database.deleteOrder(orderId);
    });

});