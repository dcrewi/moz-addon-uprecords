'use strict';
const data = require('self').data;

const records = require('./records');

// NOTE: Without this workaround, the sdk throws an exception, something
// about the hidden frame not being initialized yet. Same behavior with
// both versions 1.12 and 1.13b1. Workaround until that's fixed.
require('timers').setTimeout(function() {

// The panel. It refreshes every 2.5 seconds.
const timers = require('timers');
let timerId;
const thePanel = require('panel').Panel({
  contentURL: data.url('the-panel.html'),
  contentScriptFile: data.url('the-panel.js'),
  onShow: function () {
    thePanel.port.emit('records', records.get());
    if (timerId) {
      timers.clearInterval(timerId);
    }
    timerId = timers.setInterval(function () {
      thePanel.port.emit('records', records.get());
    }, 2500);
  },
  onHide: function () {
    if (timerId) {
      timers.clearInterval(timerId);
      timerId = undefined;
    }
  }
});
// The content script populates the HTML table using the records,
// detects the size of the table, and finally reports the size of the
// table. When the report is received, the panel resizes itself to
// just the right size.
thePanel.port.on('resizeTo', function (w, h) {
  thePanel.resize(w, h);
});

const theWidget = require('widget').Widget({
  id: require('self').id,
  label: 'Uprecords',
  contentURL: data.url("icon.png"),
  panel: thePanel
});

}, 0); // end hidden frame workaround
