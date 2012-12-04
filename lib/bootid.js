// Unclean shutdowns and addon upgrades are handled by using a "boot
// identifier".  A boot id mechanism must:
//
// 1. be different every time the firefox process starts, and
//
// 2. persist accross addon enable+disables and upgrades.
//
// Towards this end, I've decided to abuse the category manager to
// store a uuid string:
'use strict';
const { Cc, Ci, Cr } = require('chrome');
const CATEGORY = require('self').id;
const ENTRY = 'bootid';
const cm = (Cc['@mozilla.org/categorymanager;1']
            .getService(Ci.nsICategoryManager));
const uuidService = (Cc['@mozilla.org/uuid-generator;1']
                     .getService(Ci.nsIUUIDGenerator));
exports.bootid = (function () {
  // retrieve boot id, or create and store it if there isn't one
  try {
      return cm.getCategoryEntry(CATEGORY, ENTRY);
  } catch (exc if exc.result === Cr.NS_ERROR_NOT_AVAILABLE) {
    let bootid = uuidService.generateUUID().toString();
    if (!bootid) throw Error('uuid generator service disappeared!');
    cm.addCategoryEntry(CATEGORY, ENTRY, bootid, false, true);
    return bootid;
  }
})();
