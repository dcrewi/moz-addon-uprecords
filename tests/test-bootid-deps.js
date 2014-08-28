const { Cc, Ci, Cr } = require('chrome');

const CATEGORY = require('sdk/self').id;
const ENTRY = 'TEST-ENTRY';
const VALUE = 'TEST-VALUE';

// Category Manager is not part of the addon SDK, so test whether it's
// available and behaves as expected.
exports["test category manager"] = function(assert) {
  const cm = (Cc['@mozilla.org/categorymanager;1']
              .getService(Ci.nsICategoryManager));
  try {
    cm.getCategoryEntry(CATEGORY, ENTRY);
    throw new Error('previous line should have thrown because '+
                    'the category entry should not exist yet');
  } catch (exc) {
    assert.ok(exc.result === Cr.NS_ERROR_NOT_AVAILABLE,
              'category manager throws expected exception when '+
              'entry does not exist');
  }
  cm.addCategoryEntry(CATEGORY, ENTRY, VALUE, false, true);
  assert.equal(cm.getCategoryEntry(CATEGORY, ENTRY), VALUE,
               'category manager can store and retrieve values');
  cm.deleteCategoryEntry(CATEGORY, ENTRY, false);
};

// UUID generator is not part of the addon SDK, so test whether it's
// available and generates identifiers.
exports["test UUID generator"] = function (assert) {
  const uuidService = (Cc['@mozilla.org/uuid-generator;1']
                       .getService(Ci.nsIUUIDGenerator));
  let uuid = uuidService.generateUUID();
  assert.ok(uuid, 'UUID service does generate something');
};

require("test").run(exports);
