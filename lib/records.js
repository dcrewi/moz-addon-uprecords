'use strict';
const { Cc, Ci, Cr } = require('chrome');

// Uptime is tracked via a "boot identifier". A boot id must:
// 1. be different every time the firefox process starts, and
// 2. persist accross addon enable+disables and upgrades.
// Towards this end, I've decided to abuse the category manager to
// store a uuid.
const CATEGORY = require('self').id;
const ENTRY = 'bootid';
const cm = (Cc['@mozilla.org/categorymanager;1']
            .getService(Ci.nsICategoryManager));
const uuidService = (Cc['@mozilla.org/uuid-generator;1']
                     .getService(Ci.nsIUUIDGenerator));
const bootid = (function () {
  // retrieve boot id, or create and store if there isn't one
  try {
      return cm.getCategoryEntry(CATEGORY, ENTRY);
  } catch (exc if exc.result === Cr.NS_ERROR_NOT_AVAILABLE) {
    let bootid = uuidService.generateUUID().toString();
    if (!bootid) throw Error('uuid generator service disappeared!');
    cm.addCategoryEntry(CATEGORY, ENTRY, bootid, false, true);
    return bootid;
  }
})();

const ss = require('simple-storage');

if (ss.storage.thisSession) {
  if (ss.storage.thisSession.bootid !== bootid) {
    console.warn('bootid mismatch; discarding stale session started at ' +
                 ss.storage.thisSession.bootTime);
    delete ss.storage.thisSession;
  }
}
if (!ss.storage.thisSession) {
  ss.storage.thisSession = {
    bootid: bootid,
    bootTime: Date.now()
  };
}

if (!ss.storage.records) {
  ss.storage.records = [];
}

const xulApp = require('xul-app');
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
  return records;
};

