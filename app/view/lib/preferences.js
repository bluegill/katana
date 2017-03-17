window.$ = window.jQuery =

require('../../resources/js/jquery.js')
require('../../resources/js/mousetrap.js')

$('#general').show()

const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

let optionsObj

$('#close').click(() => {
  ipc.send('saveOptions', optionsObj)
  (remote.getCurrentWindow()).close()
})

ipc.send('getOptions')
ipc.send('getVersion')

ipc.on('getVersion', (event, version) => {
  window.version = version
})

ipc.on('getOptions', (event, options) => {
  optionsObj = options

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
})

ipc.on('showUpdate', (event) => {
  $('.backdrop').fadeIn(200)
})

$('.sidebar a').click((event) => {
  const url = event.target.href.split('#')[1]
  goto(url, event.target)
})

$('.sidebar img').dblclick((event) => {
  alert(`Current Version: ${window.version}`)
})

$('a[href="#check"]').click(() => {
  ipc.send('checkForUpdate')
})

$('a[href="#download"]').click(function () {
  ipc.send('downloadUpdate')
  $(this).parent().hide()
  $('.update > .progress').show()
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
})

function parseCombo (combo) {
  if (combo.includes('meta')) {
    combo = combo.replace('meta', 'command')
  }
  return combo
}

function goto (view, target) {
  $('.sidebar li').each((key, val) => {
    if ($(val).hasClass('active')) {
      $(val).removeClass('active')
    }
  })

  if (target) $(target).parent().addClass('active')

  $('.view').hide()
  $(`#${view}`).show()
}
