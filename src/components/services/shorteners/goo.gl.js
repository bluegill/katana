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

module.exports = class {
  static shorten (url, callback) {
    console.log(`Shortening URL: ${url} with goo.gl`)

    const options = {
      url: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBRzs2iKCR84UIwWTh3bK2hHHdCVcUZFlI',
      json: true,
      headers: {
        'content-type': 'application/json'
      },
      body: {
        'longUrl': url
      }
    }

    request.post(options, (error, response, body) => {
      if (!error) {
        try {
          const data = body

          console.log(data)

          return callback({
            link: data.id
          })
        } catch (error) {
          return callback(null, error)
        }
      } else {
        return callback(null, error)
      }
    })
  }
}
