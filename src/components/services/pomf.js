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

const request = require('request')
const fs = require('fs')

module.exports = class {
  static upload (file, callback) {
    console.log('Uploading image to pomf...')

    const options = {
      url: this.uploadPath
    }

    const post = request.post(options, (error, req, body) => {
      if (error) {
        return callback(null, error)
      }

      try {
        let result = JSON.parse(body)

        if (result.success || result.status === 200) {
          if (result.files) result = result.files[0]

          if (result.url && result.url.substr(0, 4) !== 'http') {
            result.url = `${this.resultPath}/${result.url}`
          }

          return callback({
            'link': (result.url || result.link)
          })
        } else {
          return callback(null, error)
        }
      } catch (error) {
        return callback(null, error)
      }
    })

    let form = post.form()

    form.append('type', 'file')
    form.append('files[]', fs.createReadStream(file))
  }

  static setPath (uploadPath, resultPath) {
    this.uploadPath = uploadPath
    this.resultPath = resultPath
  }

  static setToken (token) {
    this.token = token
  }
}
