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

module.exports = class {
  static getTimestamp (unix) {
    if (unix === true) {
      return (Math.floor(Date.now() / 1000))
    }

    const dateObj = new Date()

    let hours = dateObj.getHours()

    if (hours > 12) hours -= 12
    if (hours === 0) hours = 12

    let minutes = dateObj.getMinutes()

    if (minutes < 10) minutes = ('0' + minutes)

    const date = `${dateObj.getMonth() + 1}.${dateObj.getDate()}.${dateObj.getFullYear()}`
    const time = `${hours}:${minutes}:${dateObj.getSeconds()}`

    return (`${date}_${time}`)
  }

  static validateUrl (url) {
    const expression = /(ftp|http|https):\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/

    return expression.test(url)
  }
}
