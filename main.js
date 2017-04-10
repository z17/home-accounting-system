const electron = require('electron');
const entities = require('./data/entities.js');


const app = electron.app;  // Модуль контролирующей жизненный цикл нашего приложения.
const BrowserWindow = electron.BrowserWindow;  // Модуль создающий браузерное окно.


// Определение глобальной ссылки , если мы не определим, окно
// окно будет закрыто автоматически когда JavaScript объект будет очищен сборщиком мусора.
var mainWindow = null;

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
    // Создаем окно браузера.
    mainWindow = new BrowserWindow({width: 1200, height: 800});

    const incomeData = [
        new entities.Income('01.02.1014', '02.2014', 343, 'WMR', "asda@ascf.eu", "test"),
        new entities.Income('01.02.1014', '02.2014', 343, 'WMR', "asda@ascf.eu", "test"),
        new entities.Income('01.02.1014', '02.2014', 343, 'WMR', "asda@ascf.eu", "test")
    ];

    const ordersData = [
      new entities.Order('02.2014', 5000, 2000, 3000, 0, 'WMR', 'asags@sdgd.ru', 'my type', 'desc', 'http://yandex.ru', 'complete')
    ];

    mainWindow.webContents.on('dom-ready', function () {
        mainWindow.webContents.send('income-data', incomeData);
        mainWindow.webContents.send('orders-data', ordersData);
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
});