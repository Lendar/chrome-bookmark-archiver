'use strict';
/*global chrome */
/*global Archiver */

chrome.alarms.onAlarm.addListener(function(alarm) {
  Archiver.incrQuota(chrome.bookmarks.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE);
  Archiver.arrangeBookmarks();
});
