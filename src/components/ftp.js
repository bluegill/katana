const _ftp = require('jsftp')

module.exports = class {
  constructor (connection, directory, url) {
    this.dir = directory
    this.url = url
    this.ftp = new _ftp({
      host: connection.host,
      port: connection.port,
      user: connection.user,
      pass: connection.pass
    })
  }

  upload (file, callback) {
    console.log('Uploading image to FTP server...')

    this.ftp.put(file, `${this.dir}/${file}`, (error) => {
      if (!error) {
        callback({
          link: `${this.url}/${file}`
        })
      }
    })
  }
}
