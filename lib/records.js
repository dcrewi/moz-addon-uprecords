'use strict';

const { bootid } = require('./bootid');

const ss = require('simple-storage');
const xulApp = require('xul-app');

if (!ss.storage.records) {
  ss.storage.records = [];
}

if (ss.storage.thisSession &&
    ss.storage.thisSession.bootid !== bootid) {
  console.warn('bootid mismatch; this indicates an unclean shutdown');
  (function () {
    let record = genCurrentRecord();
    record.uptime = ss.storage.thisSession.uptime;
    ss.storage.records.push(record);
  })();
  delete ss.storage.thisSession;
}
if (!ss.storage.thisSession) {
  ss.storage.thisSession = {
    bootid: bootid,
    bootTime: Date.now(),
    uptime: 0
  };
}

function genCurrentRecord() {
  return {
    bootTime: ss.storage.thisSession.bootTime,
    version: xulApp.name+' '+xulApp.version,
    uptime: Date.now() - ss.storage.thisSession.bootTime
  };
}

require('unload').when(function (reason) {
  if (reason === 'shutdown') {
    ss.storage.records.push(genCurrentRecord());
    delete ss.storage.thisSession;
  }
});

require('timers').setInterval(function () {
  ss.storage.thisSession.uptime = Date.now() - ss.storage.thisSession.bootTime;
}, 4*60*1000);

function sortRecords() {
  ss.storage.records.sort(function (a, b) {
    return b.uptime - a.uptime;
  });
}

ss.on("OverQuota", function () {
  // drop low-uptime records until under quota
  sortRecords();
  while (ss.quotaUsage > 1) {
    ss.storage.records.pop();
  }
});

exports.get = function () {
  const N_RECS = 10;
  sortRecords();
  let records = ss.storage.records.slice(0, N_RECS);
  let session = genCurrentRecord();
  session.isCurrentSession = true;
  let i;
  for (i = ss.storage.records.length; i > 0; --i) {
    if (ss.storage.records[i-1].uptime > session.uptime) {
      break;
    }
  }
  session.rank = i;
  if (i > 0) {
    session.numOneIn = records[0].uptime - session.uptime;
  }
  if (i > 1) {
    session.oneUpIn = ss.storage.records[i-1].uptime - session.uptime;
  }
  if (i >= N_RECS) {
    session.toplistIn = records[N_RECS-1].uptime - session.uptime;
  }
  records.splice(Math.min(i, N_RECS), 0, session);
  if (i < N_RECS && records.length > N_RECS) {
    records.pop();
  }
  return records;
};

