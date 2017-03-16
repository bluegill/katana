const electron           = require('electron');
const {Tray, Menu}       = electron;

const notificationCenter = require('node-notifier').NotificationCenter;

let notifier;

const autoLaunch = require('auto-launch');
const fs         = require('fs');

const shortcutManager = require('./components/shortcutManager');

const ipc = electron.ipcMain;

const config = require('./config');

new class main {
  constructor(){
    this.appPath = electron.app.getPath('exe').split('.app/Content')[0] + '.app';

    if(!this.appPath.includes('electron')){
      this.appLauncher = new autoLaunch({
        name: 'Katana',
        path: this.appPath
      });
    }

    // not working when running in development; will fix at later point
    notifier = new notificationCenter({
      withFallback: true,
      customPath: this.appPath + '/Contents/Resources/app.asar.unpacked/app/resources/notifier.app/Contents/MacOS/terminal-notifier'
    });

    this.preferencesModule    = new (require('./components/preferences'))(this);
    this.updaterModule        = new (require('./components/updater'))(this);
    this.screenshotModule     = new (require('./components/screenshot'))(this);
    this.shortenerModule      = new (require('./components/urlShortener'))(this);

    const startAtLogin = this.preferencesModule.getOption('startAtLogin');

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
    this.app.dock.hide();

    if(this.preferencesModule.getOption('showIcon')){
      this.app.dock.show();
    }

    // supposedly helps with performance?
    // who knows, if it causes issues i can yank it
    this.app.commandLine.appendSwitch('disable-renderer-backgrounding');

    this.app.on('ready', () => {
      this.shortcutManager = new shortcutManager(this);
      this.tray            = new Tray(config.icons.tray.default);

      const contextMenu = Menu.buildFromTemplate([
        {label: 'Take Screenshot', type: 'normal', click: () => {
            this.screenshotModule.captureSelection();
        }},

        {label: 'Recent', type: 'normal', enabled: false},

        {label: '', type: 'separator'},

        {label: 'Preferences...', accelerator: 'Cmd+,', type: 'normal', click: () => {
          this.preferencesModule.showWindow();
        }},


        {label: 'Quit', accelerator: 'Cmd+Q', type: 'normal', click: () => {
          this.app.quit();
        }}
      ]);

      this.tray.setToolTip('Katana');
      this.tray.setContextMenu(contextMenu);
    });
  }

  showNotification(message, url){
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