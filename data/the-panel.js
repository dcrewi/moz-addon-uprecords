'use strict';

self.port.on('records', function (records) {
  var tableBody = document.getElementById('records-table-body');
  while(tableBody.hasChildNodes()) {
    tableBody.removeChild(tableBody.lastChild);
  }

  var i;
  var session;
  for (i = 0; i < records.length; ++i) {
    // If the current session is in the top N, skip the last record.
    if (i+1 === records.length && !records[i].isCurrentSession) {
      break;
    }

    var record = records[i];
    var row = document.createElement('tr');
    if (record.isCurrentSession) {
      row.setAttribute('class', 'current-session');
      session = record;
    }

    var td = document.createElement('td');
    td.setAttribute('class', 'rank');
    td.appendChild(document.createTextNode((record.rank || i) + 1));
    row.appendChild(td);

    td = document.createElement('td');
    td.setAttribute('class', 'uptime');
    td.appendChild(document.createTextNode(prettyPrintUptime(record.uptime)));
    row.appendChild(td);

    td = document.createElement('td');
    td.setAttribute('class', 'version');
    if (record.version) {
      td.appendChild(document.createTextNode(record.version));
    }
    row.appendChild(td);

    td = document.createElement('td');
    td.setAttribute('class', 'boottime');
    td.appendChild(document.createTextNode(new Date(record.bootTime)
                                           .toLocaleString()));
    row.appendChild(td);

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
});

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
  var row, td;
  row = document.createElement('tr');

  td = document.createElement('td');
  td.setAttribute('class', 'rank');
  td.appendChild(document.createTextNode(kind));
  row.appendChild(td);

  td = document.createElement('td');
  td.setAttribute('class', 'uptime');
  td.appendChild(document.createTextNode(prettyPrintUptime(delta)));
  row.appendChild(td);

  td = document.createElement('td');
  td.appendChild(document.createTextNode('at'));
  row.appendChild(td);

  td = document.createElement('td');
  td.setAttribute('class', 'boottime');
  td.appendChild(document.createTextNode(new Date(Date.now() + delta)
                                         .toLocaleString()));
  row.appendChild(td);

  return row;
}
