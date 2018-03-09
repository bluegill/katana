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

const options = {
  platform: ['darwin'],
  arch: 'x64',
  icon: './app/static/images/icon',
  dir: '.',
  ignore: ['build'],
  out: './build/Release',
  overwrite: true,
  prune: true
}

packager(options, (error, path) => {
  if (error) {
    return (
      console.log(`Error: ${error}`)
    )
  }

  console.log(`Package created, path: ${path}`)
})
