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
