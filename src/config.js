const os = require('os');

module.exports = {
  defaults: {
    services: {
      screenshotHost: 'imgur',
      shortenUrl: 'bit.ly'
    },
    shortcuts: {
      screenshotSelection: 'command+alt+s',
      screenshotFull: '',
      screenshotWindow: '',
      shortenUrl: 'command+alt+0'
    }
  },

  icons: {
    app: `${__dirname}/assets/icon.icns`,
    tray: {
      default: `${__dirname}/assets/images/IconTemplate.png`,
      active: `${__dirname}/assets/images/icon_alt/IconTemplate.png`
    }
  },

  paths: {
    application: `${os.homedir()}/.katana`,
    uploads: `${os.homedir()}/.katana/uploads`
  },

  services: {
    imgur: {},
    pomf: {
      'aww.moe': {
        uploadPath: 'https://aww.moe/upload.php',
        resultPath: 'https://aww.moe'
      },
      'mixtape.moe': {
        uploadPath: 'https://mixtape.moe/upload.php',
        resultPath: 'https://my.mixtape.moe'
      },
      'pomf.cat': {
        uploadPath: 'https://pomf.cat/upload.php',
        resultPath: 'https://a.pomf.cat'
      },
      'nya.is': {
        uploadPath: 'https://nya.is/upload.php',
        resultPath: 'https://u.nya.is'
      },
      'reich.io': {
        uploadPath: 'https://reich.io/upload.php',
        resultPath: 'https://b.reich.io'
      },
      'cocaine.ninja': {
        uploadPath: 'https://cocaine.ninja/upload.php',
        resultPath: 'https://a.cocaine.ninja'
      },
      'desu.sh': {
        uploadPath: 'https://desu.sh/upload.php',
        resultPath: 'https://a.desu.sh'
      }
    },
    shorteners: ['is.gd', 'v.gd']
  },

  tokens: {
    'imgur': '8049ae3132218f0'
  }
}