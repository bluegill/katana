const request = require('request')
const fs = require('fs')

module.exports = class {
  static setPath (uploadPath, resultPath) {
    this.uploadPath = uploadPath
    this.resultPath = resultPath
  }

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

        if (result.success) {
          result = result.files[0]

          if (result.url.substr(0, 4) !== 'http') {
            result.url = `${this.resultPath}/${result.url}`
          }

          return callback({
            'link': result.url
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
}
