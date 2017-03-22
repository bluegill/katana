const request = require('request')
const fs = require('fs')

module.exports = class {
  static upload (file, callback) {
    console.log('Uploading image to cubeupload...')

    const options = {
      url: 'https://cubeupload.com/upload_json.php'
    }

    const post = request.post(options, (error, req, body) => {
      if (error) {
        return callback(null, error)
      }

      try {
        const result = JSON.parse(body)
        const link = 'https://i.cubeupload.com/' + result['file_name']

        callback({
          link: link
        })
      } catch (error) {
        return callback(null, error)
      }
    })

    let form = post.form()
    form.append('type', 'file')
    form.append('fileinput[]', fs.createReadStream(file))
  }
}
