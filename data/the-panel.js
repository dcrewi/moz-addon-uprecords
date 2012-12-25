'use strict';

self.port.on('records', function (records) {
  var tableBody = document.getElementById('records-table-body');
  while(tableBody.hasChildNodes()) {
    tableBody.removeChild(tableBody.lastChild);
  }

  var i;
  var session;
  for (i = 0; i < records.length; ++i) {
    var record = records[i];
    var row = document.createElement('tr');
    if (record.isCurrentSession) {
      row.setAttribute('class', 'current-session');
      session = record;
    }

    addCell(row, 'rank', (record.rank || i) + 1);
    addCell(row, 'uptime', prettyPrintUptime(record.uptime));
    addCell(row, 'version', record.version);
    addCell(row, 'boottime', new Date(record.bootTime).toLocaleString());

    tableBody.appendChild(row);
  }

  if (session.oneUpIn) {
    tableBody.appendChild(goalRow('1up in', session.oneUpIn));
  }
  if (session.toplistIn) {
    tableBody.appendChild(goalRow('HOF in', session.toplistIn));
  }
  if (session.numOneIn) {
    tableBody.appendChild(goalRow('no1 in', session.numOneIn));
  }

  let el = document.getElementById('records-table');
  self.port.emit('resizeTo', 16+el.clientWidth, 16+el.clientHeight);
});

function addCell(row, styleClass, entry) {
  var td = document.createElement('td');
  if (styleClass) td.setAttribute('class', styleClass);
  if (entry) td.appendChild(document.createTextNode(entry));
  row.appendChild(td);
}

function prettyPrintUptime(msecs) {
  var days = ~~(msecs / (24*60*60*1000));
  var hours = ~~((msecs / (60*60*1000)) % 24);
  var minutes = ~~((msecs / (60*1000)) % 60);
  var seconds = ~~((msecs / 1000) % 60);
  var s = [];
  if (days > 0) {
    s.push(days.toString());
    s.push(' day');
    if (days > 1) s.push('s');
    s.push(', ');
  }
  if (hours > 0) {
    if (hours < 10) s.push('0');
    s.push(hours.toString());
    s.push(':');
  }
  if (minutes < 10) s.push('0');
  s.push(minutes.toString());
  s.push(':');
  if (seconds < 10) s.push('0');
  s.push(seconds.toString());
  return s.join('');
}


function goalRow(kind, delta) {
  var row;
  row = document.createElement('tr');

  addCell(row, 'rank', kind);
  addCell(row, 'uptime', prettyPrintUptime(delta));
  addCell(row, null, 'at');
  addCell(row, 'boottime', new Date(Date.now() + delta).toLocaleString());

  return row;
}
