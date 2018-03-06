/*
 *  Katana - a powerful, open-source screenshot utility
 *
 *  Copyright (C) 2018, Gage Alexander <gage@washedout.co>
 *
 *  Katana is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 *  Katana  is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Katana. If not, see <http://www.gnu.org/licenses/>.
 */

const os = require('os')

let config = {}

config.defaults = {
  services: {
    uploadService: 'imgur',
    shortenerService: 'is.gd'
  },

  shortcuts: {
    screenshotSelection: 'command+alt+s',
    screenshotFull: '',
    screenshotWindow: '',
    shortenUrl: 'command+alt+0'
  }
}

config.icons = {
  app: `${__dirname}/../app/static/images/icon.png`,
  tray: {
    default: `${__dirname}/../app/static/images/menubar/IconTemplate@2x.png`,
    active: `${__dirname}/../app/static/images/menubar/active/IconTemplate@2x.png`
  }
}

config.paths = {
  application: `${os.homedir()}/.katana`,
  uploads: `${os.homedir()}/.katana/uploads`
}

config.services = {
  imgur: {
    token: '8049ae3132218f0'
  },

  pomf: {
    'comfy.moe': {
      uploadPath: 'https://comfy.moe/upload.php',
      resultPath: 'https://comfy.moe'
    },

    'doko.moe': {
      uploadPath: 'https://doko.moe/upload.php',
      resultPath: 'https://a.doko.moe'
    },

    'safe.moe': {
      uploadPath: 'https://safe.moe/upload',
      resultPath: 'https://a.safe.moe'
    },

    'void.cat': {
      uploadPath: 'https://void.cat/upload.php',
      resultPath: 'https://void.cat'
    }
  },

  shorteners: ['is.gd', 'v.gd', 'goo.gl']
}

module.exports = config