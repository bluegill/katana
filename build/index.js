const packager = require('electron-packager');
const asar     = require('asar');
const fs       = require('fs-extra');

const options  = {
  platform: ['darwin'],
  arch: 'x64',
  icon: './app/resources/icon.icns',
  dir: '.',
  ignore: ['build'],
  out: './build/Release',
  overwrite: true,
  prune: true
};

const src  = './build/Release/Katana-darwin-x64/Katana.app/Contents/Resources/app';
const dest = './build/Release/Katana-darwin-x64/Katana.app/Contents/Resources/app.asar';

packager(options, (error, path) => {
  if(error){
    return console.log(`ERROR: ${error}`);
  }

  console.log(`Package created, path: ${path}`);
  console.log(`Creating asar archive...`);

  asar.createPackage(src, dest, function() {
    fs.remove(src, err => {
      if (err) return console.error(err)

      console.log(`Build complete!`);
    });
  });
});