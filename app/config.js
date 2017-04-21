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
  app: `${__dirname}/resources/icon.icns`,
  tray: {
    default: `${__dirname}/resources/images/menubar/IconTemplate@2x.png`,
    active: `${__dirname}/resources/images/menubar/active/IconTemplate@2x.png`
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
    'cocaine.ninja': {
      uploadPath: 'https://cocaine.ninja/upload.php',
      resultPath: 'https://a.cocaine.ninja'
    },

    'comfy.moe': {
      uploadPath: 'https://comfy.moe/upload.php',
      resultPath: 'https://comfy.moe'
    },

    'desu.sh': {
      uploadPath: 'https://desu.sh/upload.php',
      resultPath: 'https://a.desu.sh'
    },

    'doko.moe': {
      uploadPath: 'https://doko.moe/upload.php',
      resultPath: 'https://a.doko.moe'
    },

    'jew.cat': {
      uploadPath: 'https://jew.cat/api/upload',
      resultPath: 'https://a.jew.cat',
      token: '6IjAWIFEgBBnarxKAjDVGktefCF1hTLO0dcn9PmQwOhlR9mdMU70chitgogJIubu'
    },

    'mixtape.moe': {
      uploadPath: 'https://mixtape.moe/upload.php',
      resultPath: 'https://my.mixtape.moe'
    },

    'null.vg': {
      uploadPath: 'https://null.vg/upload.php',
      resultPath: 'https://dev.null.vg'
    },

    'nya.is': {
      uploadPath: 'https://nya.is/upload',
      resultPath: 'https://u.nya.is'
    },

    'pomf.cat': {
      uploadPath: 'https://pomf.cat/upload.php',
      resultPath: 'https://a.pomf.cat'
    },

    'safe.moe': {
      uploadPath: 'https://safe.moe/api/upload',
      resultPath: 'https://a.safe.moe'
    }
  },

  shorteners: ['is.gd', 'v.gd', 'goo.gl']
}

module.exports = config
