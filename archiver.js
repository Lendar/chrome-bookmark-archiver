'use strict';
/*global console*/
/*global chrome*/
/*global window*/

var Archiver = window.Archiver = {
  start: function() {
    Archiver.calcProgress();
    chrome.alarms.create({delayInMinutes: 1});
  },
  stop: function() {
    Archiver.progress(0);
    chrome.alarms.clearAll();
  },
  progress: function(left) {
    var text = left ? Math.min(9999, left) : "";
    chrome.browserAction.setBadgeText({text: text.toString()});
  },
  calcProgress: function() {
    Archiver.progress(Archiver.getStats());
  },
  getStats: function() {
    return parseInt(localStorage.stats, 10) || 0;
  },
  incrStats: function(delta) {
    localStorage.stats = Archiver.getStats() + delta;
  },
  resetStats: function() {
    localStorage.stats = 0;
  },
  getQuota: function() {
    return parseInt(localStorage.quota_writes, 10) || 0;
  },
  incrQuota: function(delta) {
    localStorage.quota_writes = Archiver.getQuota() + delta;
  },
  isArchiveFolder: function(bookmark) {
    if (bookmark.children && /^(19\d\d|20\d\d)$/.exec(bookmark.title)) {
      return true;
    } else {
      return false;
    }
  },
  findYearlyArchiveFolders: function (folder) {
    var folders_by_year = {};
    folder.children.forEach(function(bookmark) {
      if (Archiver.isArchiveFolder(bookmark)) {
        folders_by_year[bookmark.title] = bookmark;
      }
    });
    return folders_by_year;
  },
  getYear: function(bookmark) {
    return new Date(bookmark.dateAdded).getFullYear();
  },
  createFolder: function(title, parent) {
    chrome.runtime.sendMessage({createFolder: {
      title: title,
      parent: parent
    }});
    if (Archiver.getQuota()) {
      console.debug('creating folder %s inside folder id:%s', title, parent.id);
      chrome.bookmarks.create({'parentId': parent.id, 'title': title});
      Archiver.incrQuota(-1);
    }
    return {title: title};
  },
  moveBookmark: function(bookmark, folder) {
    chrome.runtime.sendMessage({moveBookmark: {
      bookmark: bookmark,
      folder: folder
    }});
    if (Archiver.getQuota()) {
      console.debug('moving %s to %s', bookmark.id, folder.id);
      chrome.bookmarks.move(bookmark.id, {parentId: folder.id});
      Archiver.incrQuota(-1);
    }
  },
  arrangeFolder: function(parent_folder) {
    var folders_by_year = Archiver.findYearlyArchiveFolders(parent_folder);
    var bookmarks = parent_folder.children.filter(function(bookmark) {
      return !bookmark.children && !folders_by_year[bookmark.title];
    });
    bookmarks.forEach(function(bookmark, index, bookmarks) {
      var key = Archiver.getYear(bookmark);
      var folder = folders_by_year[key];
      Archiver.incrStats(1);
      if (folder) {
        if (folder.id) {
          Archiver.moveBookmark(bookmark, folder);
        }
      } else {
        folders_by_year[key] = Archiver.createFolder(
          key.toString(),
          parent_folder);
      }
    });
  },
  scan: function(bookmarks) {
    bookmarks.forEach(function(bookmark) {
      if (bookmark.children && !Archiver.isArchiveFolder(bookmark)) {
        Archiver.arrangeFolder(bookmark);
        Archiver.scan(bookmark.children);
      }
    });
  },
  arrangeBookmarks: function() {
    chrome.runtime.sendMessage({arrangeBookmarks: true});
    chrome.bookmarks.getTree(function(arr) {
      Archiver.resetStats();
      Archiver.scan(arr);
    });
  }
};
