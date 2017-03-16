const {globalShortcut} = require('electron');
const config           = require('../config');

module.exports = class {
  constructor(app){
    this.app     = app;
    this.options = app.preferencesModule;

    const defaultShortcuts = config.defaults.shortcuts;

    this.shortcuts = {
      screenshotSelection: {
        combo: defaultShortcuts.screenshotSelection,
        action: () => {
          this.app.screenshotModule.captureSelection();
        }
      },

      screenshotFull: {
        combo: defaultShortcuts.screenshotFull,
        action: () => {
          this.app.screenshotModule.captureFull();
        }
      },

      screenshotWindow: {
        combo: defaultShortcuts.screenshotWindow,
        action: () => {
          this.app.screenshotModule.captureWindow();
        }
      },

      shortenUrl: {
        combo: defaultShortcuts.shortenUrl,
        action: () => {
          this.app.shortenerModule.shorten();
        }
      }
    };

    const shortcutOptions = this.options.getOption('shortcuts');

    if(shortcutOptions){
      for(const shortcut of Object.keys(shortcutOptions)){
        const combo = shortcutOptions[shortcut];
        if(this.shortcuts[shortcut]){
          this.shortcuts[shortcut].combo = combo;
        }
      }
    }

    this.registerShortcuts();
  }

  updateShortcut(shortcut, oldCombo, newCombo){
    if(!shortcut || !oldCombo || !newCombo) return;

    if(this.shortcuts[shortcut]){
      const action = this.shortcuts[shortcut].action;

      globalShortcut.unregister(oldCombo);
      globalShortcut.register(newCombo, action);

      this.shortcuts[shortcut].combo = newCombo;
    }
  }

  registerShortcuts(){
    for(const index of Object.keys(this.shortcuts)){
      const shortcut = this.shortcuts[index];
      if(shortcut.combo && shortcut.combo !== ''){
        globalShortcut.register(shortcut.combo, shortcut.action);
      }
    }
  }

  unregisterShortcuts(){
    globalShortcut.unregisterAll();
  }
}