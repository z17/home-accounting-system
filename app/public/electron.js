const electron = require('electron');
const compareVersions = require('compare-versions');
const Dao = require('../backend/Dao');
const Backup = require('../backend/Backup');
const argv = require('minimist')(process.argv);
const ServerRequester = require('../backend/ServerRequester');
const path = require('path');
const Config = require('electron-config');
const fs = require('fs');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const serverRequester = new ServerRequester();

const DATABASE_FOLDER_KEY = 'database-folder';
const DATABASE_NAME = 'database';

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
            icon: path.join(__dirname, 'icons/icon.ico'),
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false,
            }
        }
    );

    const config = new Config();
    let dbPath = config.get(DATABASE_FOLDER_KEY);
    if (dbPath === undefined) {
        dbPath = app.getPath('userData') + path.sep + 'db' + path.sep;
        config.set(DATABASE_FOLDER_KEY, dbPath);
    }
    dbPath = dbPath + DATABASE_NAME;

    if (argv.dev) {
        mainWindow.webContents.openDevTools();
        dbPath = "database-dev";
    } else {
        mainWindow.setMenu(null);
    }
    const dao = new Dao(dbPath);

    let rootComponentsReadyStatus = initComponentsStatus();

    // mainWindow.maximize();

    let loadUrl = argv.dev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(loadUrl);

    ipcMain.on('app-ready', () => {
        dao.getSettings(function (settings) {
            mainWindow.webContents.send('current_language', settings.language);
        });
    });

    const loadData = function () {
        if (rootComponentsReadyStatus['data_sent']
            || !rootComponentsReadyStatus['balance']
            || !rootComponentsReadyStatus['income']
            || !rootComponentsReadyStatus['settings']) {
            return
        }
        rootComponentsReadyStatus['data_sent'] = true;

        if (!argv.dev) {
            serverRequester.getServerVersion((version) => {
                if (compareVersions(version, app.getVersion()) > 0) {
                    mainWindow.webContents.send('new-version', app.getVersion(), version);
                }
            });
        }

        dao.getSettings(function (settings) {
            settings.databaseFolder = config.get(DATABASE_FOLDER_KEY);
            mainWindow.webContents.send('settings', settings);

            let backup = new Backup(dao.getDatabasePath(), settings.backupFolder);
            let backupTimestamp = backup.makeBackup(settings.lastBackupDateTimestamp);

            if (backupTimestamp !== undefined) {
                settings.lastBackupDateTimestamp = backupTimestamp;
                dao.updateSettings(settings, () => {
                });
            }
        });

        dao.getIncomes(function (data) {
            mainWindow.webContents.send('income-data', data);
        });

        dao.getBalances(function (types) {
            mainWindow.webContents.send('balance-types', types);
        });
    };

    // Этот метод будет выполнен когда генерируется событие закрытия окна.
    mainWindow.on('closed', function () {
        // Удаляем ссылку на окно, если ваше приложение будет поддерживать несколько
        // окон вы будете хранить их в массиве, это время
        // когда нужно удалить соответствующий элемент.
        mainWindow = null;
    });

    ipcMain.on('reload', () => {
        rootComponentsReadyStatus = initComponentsStatus();
        mainWindow.reload();
    });

    ipcMain.on('component-balance-ready', () => {
        rootComponentsReadyStatus['balance'] = true;
        loadData();
    });

    ipcMain.on('component-income-ready', () => {
        rootComponentsReadyStatus['income'] = true;
        loadData();
    });

    ipcMain.on('component-settings-ready', () => {
        rootComponentsReadyStatus['settings'] = true;
        loadData();
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

    ipcMain.on('rename-balance-source', (event, id, newName) => {
       dao.renameBalance(id, newName);
    });

    ipcMain.on('update-settings', (event, newClientSettings) => {
        let currentFolder = config.get(DATABASE_FOLDER_KEY);
        let newFolder = newClientSettings.databaseFolder;

        if (newFolder !== currentFolder) {
            config.set(DATABASE_FOLDER_KEY, newFolder + path.sep);

            if (argv.dev) {
                mainWindow.webContents.send('error', 'You cant move database file in dev mod');
                return;
            }

            let is = fs.createReadStream(currentFolder + DATABASE_NAME);
            let os = fs.createWriteStream(newFolder + path.sep + DATABASE_NAME);

            is.pipe(os);
            is.on('end', function () {
                fs.unlinkSync(currentFolder + DATABASE_NAME);
                app.relaunch();
                app.exit(0);
            });
        }

        let newSettings = Object.assign({}, newClientSettings);
        delete newSettings.databaseFolder; // we wont to save this as a settings in database;
        dao.getSettings((oldSettings) => {
            serverRequester.notify(oldSettings, newSettings);
            let isLanguageUpdated = oldSettings.language !== newSettings.language;
            dao.updateSettings(newSettings, () => {
                mainWindow.webContents.send('settings-saved', isLanguageUpdated);
            });
        });
    });
});


function initComponentsStatus() {
    return {
        'balance': false,
        'income': false,
        'settings': false,
        'data_sent': false
    };
}