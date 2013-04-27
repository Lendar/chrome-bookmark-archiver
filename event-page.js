'use strict';
/*global chrome */
/*global Archiver */

chrome.alarms.onAlarm.addListener(function(alarm) {
  Archiver.arrangeBookmarks();
});
