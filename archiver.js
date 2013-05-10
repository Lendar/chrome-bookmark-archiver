'use strict';
/*global console*/
/*global chrome*/
/*global window*/

var Archiver = window.Archiver = {
  progress: function (done, total) {
    if (done < total) {
      chrome.browserAction.setBadgeText({text: Math.round(done/total*100)+'%'});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
  },
  getQuota: function() {
    return parseInt(localStorage.quota_writes, 10) || 0;
  },
  incrQuota: function(delta) {
    localStorage.quota_writes = Archiver.getQuota() + delta;
  },
  findYearlyArchiveFolders: function (folder) {
    var folders_by_year = {};
    folder.children.forEach(function(bookmark) {
      if (/^(19\d\d|20\d\d)$/.exec(bookmark.title)) {
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
      if (bookmark.children) {
        Archiver.arrangeFolder(bookmark);
        Archiver.scan(bookmark.children);
      }
    });
  },
  arrangeBookmarks: function() {
    chrome.runtime.sendMessage({arrangeBookmarks: true});
    chrome.bookmarks.getTree(function(arr) {
      Archiver.scan(arr);
    });
  }
};

