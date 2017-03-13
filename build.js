const packager = require('electron-packager');
const asar     = require('asar');
const fs       = require('fs-extra');

const options  = {
  platform: ['darwin'],
  arch: 'x64',
  icon: './src/assets/icon.icns',
  dir: '.',
  ignore: ['build', 'build.js'],
  out: './build',
  overwrite: true,
  prune: true
};

const src  = './build/Katana-darwin-x64/Katana.app/Contents/Resources/app';
const dest = './build/Katana-darwin-x64/Katana.app/Contents/Resources/app.asar';

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