/*
 *  Katana - a powerful, open-source screenshot utility
 *
 *  Copyright (C) 2018, Gage Alexander <gage@washedout.co>
 *
 *  Katana is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 *  Katana  is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Katana. If not, see <http://www.gnu.org/licenses/>.
 */

const packager = require('electron-packager')
const asar = require('asar')
const fs = require('fs-extra')

const options = {
  platform: ['darwin'],
  arch: 'x64',
  icon: './app/static/images/icon.alt.png',
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

  /*
  console.log(`Creating asar archive...`)

  const src = './build/Release/Katana-darwin-x64/Katana.app/Contents/Resources/app'


  asar.createPackageWithOptions(src, `${src}.asar`, {}, () => {
    fs.remove(src, error => {
      if (error) {
        console.error(error)

        return
      }

      console.log(`Build complete!`)
    })
  })
  */
})