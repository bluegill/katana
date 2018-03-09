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
        const result = {link: `${this.url}/${file}`}
        callback(result)
      }
    })
  }
}
