const electron           = require('electron');
const {Tray, Menu}       = electron;

const notificationCenter = require('node-notifier').NotificationCenter;
const notifier           = new notificationCenter({
  withFallback: true,
  customPath: `${__dirname}/../vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier`
});

const autoLaunch = require('auto-launch');
const fs         = require('fs');

const shortcutManager = require('./lib/shortcutManager');

const ipc = electron.ipcMain;

const config = require('./config');

class app {
  constructor(){
    this.appPath          = electron.app.getPath('exe').split('.app/Content')[0] + '.app';

    if(!this.appPath.includes('electron')){
      this.appLauncher = new autoLaunch({
        name: 'Katana',
        path: this.appPath
      });
    }

    this.optionsModule    = new (require('./lib/options'))(this);
    this.updaterModule    = new (require('./lib/updater'))(this);
    this.screenshotModule = new (require('./lib/screenshot'))(this);
    this.shortenerModule  = new (require('./lib/urlShortener'))(this);

    const startAtLogin = this.optionsModule.getOption('startAtLogin');

    if(startAtLogin === true && this.appLauncher){
      this.appLauncher.enable();
    }

    ipc.on('getVersion', (event, arg) => {
      const version = require('../package').version;
      event.sender.send('getVersion', version);
    });

    // create application home dir if it doesn't exist
    this.validateHome();

    // initialize menu bar
    this.createTray();
  }

  validateHome(){
    try {
      fs.statSync(config.paths.application);
    } catch(e){
      if(e.errno === -2){
        fs.mkdirSync(config.paths.application);
        fs.mkdirSync(config.paths.uploads);
      }
    }
  }

  createTray(){
    this.app = electron.app;

    if(this.optionsModule.getOption('hideIcon')){
      this.app.dock.hide();
    }

    this.app.on('ready', () => {
      this.shortcutManager = new shortcutManager(this);
      this.tray            = new Tray(config.icons.tray.default);

      const contextMenu = Menu.buildFromTemplate([
        {label: 'Take Screenshot', type: 'normal', click: () => {
            this.screenshotModule.captureSelection();
        }},

        {label: 'Recent', type: 'normal', enabled: false},

        {label: '', type: 'separator'},

        {label: 'Options', type: 'normal', click: () => {
          this.optionsModule.showWindow();
        }},

        {label: 'Quit', type: 'normal', click: () => {
          this.app.quit();
        }}
      ]);

      this.tray.setToolTip('Katana');
      this.tray.setContextMenu(contextMenu);
    });
  }

  showNotification(message, title, url){
    // todo: cross platform notification support
    notifier.notify({
      title: 'Katana',
      message: message,
      sound: 'default',
      open: url
    });
  }

  setIcon(type){
    this.tray.setImage(config.icons.tray[type]);
  }
}

new app();