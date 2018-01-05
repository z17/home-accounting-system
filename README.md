# Cromberg - personal finance accounting system

## Features

### Accounting of income

* Inserting income data with next fields: date, month, sum, type, contact, description
    * *Different between date and month: date - exact date of receive money; month - month, for which money you received*
* Income chart by months
* Calculating sum and average income by months, the best, worst and average month

### Balance
* Inserting balance data with different sources (*example: cash, account in A bank, electronic money*)
* Balance chart by months
* Costs chart by months (based on balance and income data)

### Other

* App's database by default storing in `%APPDATA%/Roaming/Cromberg/db/database` for Windows and similarly for others OS. You can change it in settings.
* Creating backup of database on every launch app, but not more ofter once a day. Backup folder you can set in settings.
* Email reminder every last day of month to fill balance data. Subscription and unsubscribing of notification by setting in app.
* Multi-language support: English, Russian and French

## Requirements

* Its need internet connection for correct work
* Supports Windows, MacOS, Linux

## Technology stack
* [Electron.js](https://github.com/electron/electron) - app
* [NeDB](https://github.com/louischatriot/nedb) - database
* PHP, MySQL - notification service

## Screenshots
![Income chart](server/www/screenshots/income.png)
![Balance chart](server/www/screenshots/balance.png)

## Contributing

You are welcome for contributing.

### How to run app from sources
First of all, do `npm install` from app folder.

In folder `app/db` there is `database-dev-example` file with some prepared data for application. Copy it and rename to `app/database-dev`.

There are two commands to run app from sources:
* `npm run dev` - to launch app with using database in `app/database-dev` file
* `npm start` - standard way to launch app
    
### How to build app

`npm run dist`

### Hot to make pull request

Create pull request only to `dev` branch. Your commits will merge in `master` with next release.
    
## License

MIT
