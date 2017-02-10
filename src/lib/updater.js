/**

todo- clean sloppy code
**/

const request  = require('request');
const fs       = require('fs');
const path     = require('path');
const sudo     = require('sudo-prompt');
const rimraf   = require('rimraf');
const electron = require('electron');
const unzip    = require('extract-zip');
const pkg      = require('../../package');

const os = require('os');

const child_process = require('child_process');

const ipc = electron.ipcMain;

const {dialog, BrowserWindow} = electron;

const config = require('../config');

class updater {
  constructor(parent){
    this.parent    = parent;
    this.options   = parent.optionsModule;

    this.updatePath   = 'https://raw.githubusercontent.com/bluegill/katana/master/package.json';
    this.downloadPath = 'https://getkatana.com/dl/latest.zip';

    // will be customizable at some point
    this.checkOnLaunch = true;
    this.checkInterval = 12; // 12 hours

    if(this.checkOnLaunch) this.checkForUpdate();

    // check for update every X hours
    const time = ((1000 * 60 * 60) * this.checkInterval);

    setInterval(() => {
      this.checkForUpdate();
    }, time);

    ipc.on('checkForUpdate', (event, arg) => {
      this.checkForUpdate(true);
    });

    ipc.on('downloadUpdate', (event, arg) => {
      console.log('Downloading update...');

      this.downloadUpdate(() => {
        console.log('Update complete, restarting app...');

        dialog.showMessageBox(this.window, {
          message: 'Update complete, Katana will now restart.'
        });

        const cmd = 'kill -9 ' + process.pid + ' && open -a ' + this.appPath;

        child_process.exec(cmd, (error, stdout, stderr) => {
          // handle error
        });

        electron.app.quit();
      });
    });
  }

  checkForUpdate(prompt){
    console.log('Checking for update...');

    const icon = path.join(__dirname, '../assets/images/', 'icon.png');

    request(this.updatePath, (error, response, body) => {
      if(!error && response.statusCode === 200){
        const json = JSON.parse(body);

        if(json.version !== pkg.version){
          console.log('Update available!');

          this.createWindow();
        } else {
          console.log('No update available');

          if(prompt){
            dialog.showMessageBox(this.options.win, {
              message: 'There are currently no updates available.',
              icon: icon
            });
          }
        }
      } else {
        console.log('checkForUpdate() request error: ', error);

        if(prompt){
          dialog.showMessageBox(this.options.win, {
            message: 'Unable to connect to update servers',
            icon: icon
          });
        }
      }
    });
  }

  downloadUpdate(callback){
    const target = config.paths.application + '/app.zip';
    const self   = this;
    const url    = this.downloadPath;
    const parent = this.parent;
    const window = this.window;

    if(fs.existsSync(target)){
      fs.unlinkSync(target);
    }

    request.head(url, function(err, res, body){
      request(url).pipe(fs.createWriteStream(target)).on('close', () => {

        var cmd  = 'unzip -o ~/.katana/app.zip -d ~/.katana';

        var icon = path.join(__dirname, '../assets/', 'icon.icns');

        var app = path.join(electron.app.getAppPath(), '../../../');
            app = app.slice(0, -1);

        self.appPath = app;

        if(parent.appPath.includes('electron')){
          dialog.showMessageBox({
            title: 'Debug',
            message: 'Updating disabled in development mode.'
          });

          return;
        }

        child_process.exec(cmd, () => {
          const opt = {name: 'Katana', icns: icon};

          sudo.exec('rm -rf ' + app + ' && mv ~/.katana/Katana.app ' + app, opt, (error, stdout, stderr) => {
            // handle error

            if(error) window.close();

            callback();
          });

        });
      });
    });
  }

  createWindow(){
    this.window = new BrowserWindow({
      width: 540,
      height: 280,
      resizable: false,
      minimizable: false,
      fullscreenable: false,
      alwaysOnTop: true
    });

    this.window.loadURL(`file://${__dirname}/../update.html`);
    this.window.on('closed', () => {
      this.window = null;
    });
  }
}

module.exports = updater;