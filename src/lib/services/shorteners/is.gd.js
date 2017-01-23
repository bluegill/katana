const request  = require('request');

module.exports = class {
  static shorten(url, callback){
    console.log(`Shortening URL: ${url} with is.gd`);

    const options  = {
      url: 'https://is.gd/create.php',
      form: {
        format: 'json',
        url: url
      }
    };

    request.post(options, (error, response, body) => {
      if(!error){
        try {
          const data = JSON.parse(body);
          
          return callback({
            link: data.shorturl
          });
          
        } catch(error){
          return callback(null, error);
        }
      } else {
        return callback(null, error);
      }
    });
  }
}

