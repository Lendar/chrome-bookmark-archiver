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
  findYearlyArchiveFolders: function (folder) {
    var folders_by_year = {};
    folder.children.forEach(function(bookmark) {
      if(/^(19\d\d|20\d\d)$/.exec(bookmark.title)) {
        folders_by_year[bookmark.title] = bookmark;
      }
    });
    return folders_by_year;
  },
  getYear: function(bookmark) {
    return new Date(bookmark.dateAdded).getFullYear();
  },
  createFolder: function(title, parent) {
    console.debug('creating folder %s inside', title, parent.title);
    return {title: title};
    // TODO:
    // chrome.bookmarks.create({'parentId': parent, 'title': year}, callback);
  },
  moveBookmark: function(bookmark, folder) {
    console.debug('moving %s to %s', bookmark.title, folder.title);
    // TODO:
    // chrome.bookmarks.move(string id, object destination, callback);
  },
  arrangeFolder: function(parent_folder) {
    var folders_by_year = Archiver.findYearlyArchiveFolders(parent_folder);
    var bookmarks = parent_folder.children.filter(function(bookmark) {
      return !bookmark.children && !folders_by_year[bookmark.title];
    });
    bookmarks.forEach(function(bookmark, index, bookmarks) {
      var key = Archiver.getYear(bookmark);
      var folder = folders_by_year[key];
      if (!folder) {
        folder = folders_by_year[key] = Archiver.createFolder(key, parent_folder);
      }
      Archiver.moveBookmark(bookmark, folder);
      Archiver.progress(index + 1, bookmarks.length);
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
    chrome.bookmarks.getTree(function(arr) {
      Archiver.scan(arr);
    });
  }
};

