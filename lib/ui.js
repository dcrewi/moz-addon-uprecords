'use strict';
const data = require('self').data;

const records = require('./records');

const cm = require('context-menu');
cm.Item({
  label: 'Uprecords',
  contentScript: 'self.on("click", self.postMessage);',
  onMessage: function () {
    thePanel.show();
  }
});

const timers = require('timers');
let timerId;
const thePanel = require('panel').Panel({
  width: 512,
  height: 340,
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

const theWidget = require('widget').Widget({
  id: require('self').id,
  label: 'Uprecords',
  contentURL: data.url("History.png"),
  panel: thePanel
});
