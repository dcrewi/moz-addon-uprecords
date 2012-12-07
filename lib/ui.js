'use strict';
const data = require('self').data;

const records = require('./records');

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
thePanel.port.on('resizeTo', function (w, h) {
  thePanel.resize(w, h);
});

const theWidget = require('widget').Widget({
  id: require('self').id,
  label: 'Uprecords',
  contentURL: data.url("icon.png"),
  panel: thePanel
});
