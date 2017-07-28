const packager = require('electron-packager')
const asar = require('asar')
const fs = require('fs-extra')

const options = {
  platform: ['darwin'],
  arch: 'x64',
  icon: './app/resources/icon.icns',
  dir: '.',
  ignore: ['build'],
  out: './build/Release',
  overwrite: true,
  prune: true
}

packager(options, (error, path) => {
  if (error) {
    console.log(`Error: ${error}`)

    return
  }

  console.log(`Package created, path: ${path}`)
  console.log(`Creating asar archive...`)

  const src = './build/Release/Katana-darwin-x64/Katana.app/Contents/Resources/app'

  asar.createPackageWithOptions(src, `${src}.asar`, {unpackDir: 'app/resources/notifier.app'}, () => {
    fs.remove(src, error => {
      if (error) {
        console.error(error)

        return
      }

      console.log(`Build complete!`)
    })
  })
})
