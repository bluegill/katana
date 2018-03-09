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

/* globals $, Mousetrap */

window.$ = window.jQuery = require('../static/js/jquery.js')

require('../static/js/mousetrap.js')
require('../static/js/date.format.min.js')

$('#general').show()

const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

let optionsObj

$('.close').click(() => {
  saveAndClose()
})

$('.close-prompt').click(() => {
  $('.backdrop').hide()
})

ipc.send('getOptions')
ipc.send('getVersion')

ipc.on('getVersion', (event, version) => {
  window.version = version
})

ipc.on('getOptions', (event, options) => {
  optionsObj = options

  for (const key in options.hosts) {
    let service = options.hosts[key]

    let select = '#services select[name="uploadService"] > optgroup'
    let option = `<option value="pomf:${service}">${service}</option>'`

    $(select).append(option)
  }

  for (const key in options.history.reverse()) {
    let screenshot = options.history[key]

    let element = `<li class="screenshot">
    <div class="thumbnail"><span class="helper"></span><img src="${screenshot.url.link}" /></div>
    <p><i class="icon ion-link"></i> <a href="${screenshot.url.link}" target="_blank">${screenshot.url.link}</a></p>
    <p><i class="icon ion-clock"></i> <span style="opacity:0.75">${parseTime(screenshot.timestamp)}</span></p></li>`

    $('#history .history-container > ul').append(element)
  }

  if (options.showIcon === true) $('#showIcon').prop('checked', true)
  if (options.deleteOnUpload === true) $('#deleteOnUpload').prop('checked', true)
  if (options.startAtLogin === true) $('#startAtLogin').prop('checked', true)

  if (options.shortcuts) {
    for (const shortcut of Object.keys(options.shortcuts)) {
      let combo = options.shortcuts[shortcut]

      $('#' + shortcut).val(combo)
    }
  }

  if (options.services && options.services.uploadService) {
    $('select[name="uploadService"]').val(options.services.uploadService)
  }

  if (options.services && options.services.shortenerService) {
    $('select[name="shortenerService"]').val(options.services.shortenerService)
  }

  if (options.customService) {
    $('#servicePrompt input[name="uploadPath"]').val(options.customService.uploadPath)
    $('select[name="uploadService"]').val('custom')
  }

  if (options.customService) {
    $('#servicePrompt input[name="resultPath"]').val(options.customService.resultPath)
  }
})

ipc.on('showUpdate', (event) => {
  showPrompt('#updatePrompt')
})

ipc.on('showService', (event, current) => {
  showPrompt('#servicePrompt')
})

$('.sidebar li').click((event) => {
  const url = event.target.id.split('#')[1]

  if (!url) return

  if (url === 'save') {
    return $('#savePrompt').fadeIn(500)
  }

  switchView(url, event.target)
})

$('#servicePrompt button[name="save"]').click(() => {
  let uploadPath = $('#servicePrompt input[name="uploadPath"]').val()
  let resultPath = $('#servicePrompt input[name="resultPath"]').val()

  if (!uploadPath || !resultPath) return

  ipc.send('updateService', { 'uploadPath': uploadPath, 'resultPath': resultPath })

  $('.backdrop').fadeOut(200)
})

$('a[href="#check"]').click(() => {
  ipc.send('checkForUpdate')
})

$('a[href="#download"]').click(function () {
  ipc.send('downloadUpdate')
  $(this).parent().hide()
  $('#updatePrompt .progress').show()
})

$('a[href="#cancel"]').click(() => {
  $('.backdrop').hide()
})

$('input[type="checkbox"]').change(function () {
  let option = $(this).attr('id')
  optionsObj[option] = this.checked
})

$('select[name="uploadService"]').change(function () {
  let service = $(this).find('option:selected').val()
  if (service === 'custom') {
    return (
      showPrompt('#servicePrompt')
    )
  }
  if (!optionsObj.services) optionsObj.services = {}
  optionsObj.services.uploadService = service
})

$('select[name="shortenerService"]').change(function () {
  let service = $(this).find('option:selected').val()
  if (!optionsObj.services) optionsObj.services = {}
  optionsObj.services.shortenerService = service
})

$('.shortcutInput').focus((event) => {
  let shortcutInput = $('#' + event.target.id)

  shortcutInput.val('Recording shortcut')
  shortcutInput.addClass('active')

  $(shortcutInput).parent().find('.icon').show().addClass('spin')

  Mousetrap.record(function (sequence) {
    const combo = parseCombo(sequence[0])
    optionsObj.shortcuts[event.target.id] = combo
    shortcutInput.val(combo)
    shortcutInput.blur()
  })
})

$('.shortcutInput').blur((event) => {
  let shortcutInput = $('#' + event.target.id)
  let combo = optionsObj.shortcuts[event.target.id]

  $(shortcutInput).val(combo)
  $(shortcutInput).removeClass('active')

  $(shortcutInput).parent().find('.icon').hide().removeClass('spin')
})

function showPrompt (prompt) {
  $(prompt).fadeIn(200)
}

function parseTime (str) {
  const date = new Date(str * 1000)

  return date.format('M jS \\a\\t g:ia')
}

function saveAndClose () {
  ipc.send('saveOptions', optionsObj)
  remote.getCurrentWindow().close()
}

function parseCombo (combo) {
  if (combo.includes('meta')) {
    combo = combo.replace('meta', 'command')
  }
  return combo
}

function switchView (view, target) {
  $('.sidebar li').each((key, val) => {
    if ($(val).hasClass('active')) {
      $(val).removeClass('active')
    }
  })

  if (target) $(target).addClass('active')

  $('.view').hide()
  $(`#${view}`).show()
}
