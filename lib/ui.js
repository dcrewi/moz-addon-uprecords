'use strict';
const data = require('sdk/self').data;

const records = require('./records');

// The panel. It refreshes every 2.5 seconds.
const timers = require('sdk/timers');
let timerId;
const thePanel = require('sdk/panel').Panel({
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
    theButton.state('window', {checked: false});
  }
});
// The content script populates the HTML table using the records,
// detects the size of the table, and finally reports the size of the
// table. When the report is received, the panel resizes itself to
// just the right size.
thePanel.port.on('resizeTo', function (w, h) {
  thePanel.resize(w, h);
});

const theButton = require('sdk/ui/button/toggle').ToggleButton({
  id: "uprecords-button",
  label: 'Uprecords',
  icon: {
    "16": data.url("icon.png"),
    "32": data.url("icon.png"),
    "64": data.url("icon.png")
  },
  onChange: function handleChange(state) {
    if (state.checked) {
      thePanel.show({
        position: theButton
      });
    }
  }
});
