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
