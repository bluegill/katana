const packager = require('electron-packager');
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

packager(options, (error, paths) => {
  if(error){
    return console.log(`ERROR: ${error}`);
  }

  console.log(`Build successful, path: ${paths}`);
});