'use strict';

self.port.on('records', function (records) {
  var tableBody = document.getElementById('records-table-body');
  while(tableBody.hasChildNodes()) {
    tableBody.removeChild(tableBody.lastChild);
  }

  // Add a table row for each record.
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

  // Add rows that count down to milestones.
  if (session.oneUpIn) {
    tableBody.appendChild(milestoneRow('1up in', session.oneUpIn));
  }
  if (session.toplistIn) {
    tableBody.appendChild(milestoneRow('HOF in', session.toplistIn));
  }
  if (session.numOneIn) {
    tableBody.appendChild(milestoneRow('no1 in', session.numOneIn));
  }

  // Report the table size so that the panel can resize itself.
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
  // NOTE: remember ~~ is equivalent to casting a float to an int
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


function milestoneRow(kind, delta) {
  var row;
  row = document.createElement('tr');

  addCell(row, 'rank', kind);
  addCell(row, 'uptime', prettyPrintUptime(delta));
  addCell(row, null, 'at');
  addCell(row, 'boottime', new Date(Date.now() + delta).toLocaleString());

  return row;
}
