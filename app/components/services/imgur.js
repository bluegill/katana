const request  = require('request');
const fs       = require('fs');
const config   = require('../../config');

class imgur {
  static upload(file, callback){
    console.log('Uploading image to imgur...');

    const token = config.services.imgur.token;

    if(!token){
      return callback(null, 'No authorization token found in configuration');
    }

    const options  = {
      url: 'https://api.imgur.com/3/upload',
      headers: {
        'Authorization': `Client-ID ${token}`
      }
    };

    const post = request.post(options, (error, req, body) => {
      if(error){
        return callback(null, error);
      }

      try {
        const data = JSON.parse(body).data;
        const link = data.link;

        callback({
          link: link
        });
      } catch(error){
        return callback(null, error);
      }
    });

    let form = post.form();
    form.append('type', 'file');
    form.append('image', fs.createReadStream(file));
  }
}

module.exports = imgur;