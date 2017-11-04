const electron = require('electron');
const Dao = require('./backend/Dao');
const Backup = require('./backend/Backup');
const functions = require('./scripts/functions');
const argv = require('minimist')(process.argv);
const ServerNotify = require('./backend/ServerNotify').ServerNotify;
const path = require('path');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const serverNotify = new ServerNotify();

// require('./tmp/converter').exportBalanceData();
// require('./tmp/converter').exportIncomeData();

// Определение глобальной ссылки , если мы не определим, окно
// окно будет закрыто автоматически когда JavaScript объект будет очищен сборщиком мусора.
let mainWindow = null;

// Проверяем что все окна закрыты и закрываем приложение.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    // Создаем окно браузера.
    mainWindow = new BrowserWindow(
        {
            minWidth: 800,
            minHeight: 600,
            width: 1024,
            height: 600,
            icon: path.join(__dirname, 'build/icon.ico')
        }
    );

    let dbPath = app.getPath('userData') + '\\db\\database';
    if (argv.dev) {
        mainWindow.webContents.openDevTools();
        dbPath = "database-dev";

    } else {
        mainWindow.setMenu(null);
    }
    const dao = new Dao(dbPath);

    // mainWindow.maximize();
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

            let backup = new Backup(dao.getDatabasePath(), settings.backupFolder);
            let backupTimestamp = backup.makeBackup(settings.lastBackupDateTimestamp);

            if (backupTimestamp != undefined) {
                settings.lastBackupDateTimestamp = backupTimestamp;
                dao.updateSettings(settings, () => {});
            }
        });

        dao.getBalances(function(types) {
            mainWindow.webContents.send('balance-types', types);
        });

    });

    // Этот метод будет выполнен когда генерируется событие закрытия окна.
    mainWindow.on('closed', function () {
        // Удаляем ссылку на окно, если ваше приложение будет поддерживать несколько
        // окон вы будете хранить их в массиве, это время
        // когда нужно удалить соответствующий элемент.
        mainWindow = null;
    });

    ipcMain.on('income-add', (event, income) => {
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
        dao.updateIncome(income, (err) => {
            if (err !== null) {
                throw new Error("Update error");
            }
            mainWindow.webContents.send('income-edited', income);
        });
    });

    ipcMain.on('balance-add', (event, source) => {
        dao.addBalanceSource(source, insertedSource => {
          mainWindow.webContents.send('balance-inserted', insertedSource);
        });
    });

    ipcMain.on('balance-update', (event, id, month, sum) => {
        dao.addBalance(id, month, sum, () => {
          mainWindow.webContents.send('balance-updated', id, month, sum);
        });
    });
    ipcMain.on('balance-month-remove', (event, id, month) => {
        dao.deleteBalance(id, month, () => {
          mainWindow.webContents.send('balance-reupdated', id, month);
        });
    });

    ipcMain.on('update-settings', (event, settings) => {
        dao.getSettings((oldSettings) => {
            serverNotify.notify(oldSettings, settings);
            dao.updateSettings(settings, () => {
                mainWindow.webContents.send('settings-saved', settings);
            });
        });

        event.returnValue = true;
    });
});
