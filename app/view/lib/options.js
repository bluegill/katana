window.$ = window.jQuery =

require('../../resources/js/jquery.js');
require('../../resources/js/mousetrap.js');

$('#general').show();

const ipc    = require('electron').ipcRenderer;
const remote = require('electron').remote;

let optionsObj;

$('#close').click(() => {
  ipc.send('saveOptions', optionsObj);

  // close the winderrrr
  (remote.getCurrentWindow()).close();
});

ipc.send('getOptions');
ipc.send('getVersion');

ipc.on('getVersion', (event, version) => {
  $('#version').text(`${version}`);
});

ipc.on('getOptions', (event, options) => {
  optionsObj = options;

  if(options.showIcon       === true) $('#showIcon').prop('checked', true);
  if(options.deleteOnUpload === true) $('#deleteOnUpload').prop('checked', true);
  if(options.startAtLogin   === true) $('#startAtLogin').prop('checked', true);

  if(options.shortcut){
    $('#shortcutInput').text(options.shortcut);
  }

  if(options.uploadService){
    $('select[name="uploadService"]').val(options.uploadService);
  } else {
    $('select[name="uploadService"]').val('imgur');
  }
});

ipc.on('showUpdate', (event) => {
  $('.backdrop').show();
});

$('.sidebar a').click((event) => {
  const url = event.target.href.split('#')[1];
  goto(url, event.target);
});

$('a[href="#check"]').click(() => {
  ipc.send('checkForUpdate');
});

$('a[href="#download"]').click(function() {
  ipc.send('downloadUpdate');
  $(this).parent().hide();
  $('.update > .progress').show();
});

$('a[href="#cancel"]').click(() => {
  $('.backdrop').hide();
});

$('input[type="checkbox"]').change(function(){
  let option = $(this).attr('id');
  optionsObj[option] = this.checked;
});

$('select[name="uploadService"]').change(function(){
  let service = $(this).find('option:selected').val();
  optionsObj.uploadService = service;
});

const shortcutInput = $('#shortcutInput');

$('.container').click((event) => {
  if($('#shortcuts').is(':visible')){
    if(event.target.id == shortcutInput.attr('id')){
      if(!shortcutInput.hasClass('active')){
        shortcutInput.text('Recording shortcut');
        shortcutInput.addClass('active');
        Mousetrap.record(function(sequence) {
          const combo = parseCombo(sequence[0]);
          optionsObj.shortcut = combo;
          shortcutInput.html(combo);
        });
      }
    } else {
      if(shortcutInput.hasClass('active')){
        if(shortcutInput.text() == 'Recording shortcut'){
          shortcutInput.html(optionsObj.shortcut);
        }
        shortcutInput.removeClass('active');
      }
    }
  }
});

//////

function parseCombo(combo){
  if(combo.includes('meta')){
    combo = combo.replace('meta', 'command');
  }
  return combo;
}

function goto(view, target){
  $('.sidebar li').each((key, val) => {
    if($(val).hasClass('active')){
      $(val).removeClass('active');
    }
  });

  if(target) $(target).parent().addClass('active');

  $('.view').hide();
  $(`#${view}`).show();
}