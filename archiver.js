'use strict';
/*global chrome*/
/*global document*/
/*global window*/

var Archiver = window.Archiver = {
  progress: function (done, total) {
    chrome.browserAction.setBadgeText({text: Math.round(done/total*100)+'%'});
  },
  findYearlyArchiveFolders: function (folder) {
    var folders_by_year = {};
    folder.children.forEach(function(bookmark) {
      if(/(19\d\d|20\d\d)/.match(bookmark.title)) {
        folders_by_year[bookmark.title] = bookmark;
      }
    });
    return folders_by_year;
  },
  arrangeBookmark: function(argument) {
    // TODO:
    // chrome.bookmarks.move(string id, object destination, function callback)
    // chrome.bookmarks.create({'parentId': parent, 'title': year}, callback);
  },
  arrangeFolder: function (folder) {
    var folders_by_year = Archiver.findYearlyArchiveFolders(folder);
    var bookmarks = folder.children.filter(function (bookmark) {
      return !bookmark.children;
    });
    bookmarks.arrangeBookmark();
  },
  scan: function(bookmarks) {
    bookmarks.forEach(function(bookmark) {
      if (bookmark.children) {
        Archiver.arrangeFolder(bookmark);
        Archiver.scan(bookmark.children);
      } else {
        Archiver.scan(bookmark);
      }
    });
  },
  moveBookmarks: function() {
    chrome.bookmarks.getTree(function(arr) {
      document.getElementById('loading').remove();
      Archiver.displayList(arr);
    });
  }
};

