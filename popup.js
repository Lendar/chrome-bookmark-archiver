'use strict';
/*global chrome*/
/*global Archiver */

var Foreman = {
  start: function() {
    Archiver.progress(0, 100);
    chrome.alarms.create({delayInMinutes: 1});
  },
  bindEvents: function() {
    var el = document.getElementById('start');
    el.onclick = function() {
      Foreman.start();
      Foreman.displayStatus();
      Archiver.arrangeBookmarks();
    };
  },
  displayStatus: function() {
    var el = document.getElementById('foreman');
    el.textContent = 'Loading timers...';
    chrome.alarms.getAll(function(alarms) {
      document.getElementById('start').disabled = alarms.length > 0;
      el.textContent = alarms.length > 0 ? 'running' : '';
    });
  }
};

var ArchiverView = {
  loadAndDisplayBookmarks: function() {
    chrome.bookmarks.getTree(function(arr) {
      document.getElementById('loading').remove();
      ArchiverView.displayList(arr);
    });
  },
  moveBookmark: function(message) {
    var bookmark = message.bookmark;
    var folder = message.folder;
    var el = document.createElement('div');
    el.classList.add('bookmark-title');
    el.textContent = bookmark.title + '->' + folder.title;
    document.body.appendChild(el);
  },
  createFolder: function (message) {
    var folder = message;
    var el = document.createElement('div');
    el.classList.add('bookmark-title');
    el.textContent = '* New folder: ' + folder.title;
    document.body.appendChild(el);
  },
  displayList: function(bookmarks) {
    bookmarks.forEach(function(bookmark) {
      if (bookmark.children)
        ArchiverView.displayList(bookmark.children);
      else {
        ArchiverView.displayItem(bookmark);
      }
    });
  },
  clear: function() {
    // document.
  }
};

// TODO: display everything on view
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.arrangeBookmarks) {
    ArchiverView.clear();
  }
  if (request.createFolder) {
    ArchiverView.createFolder(request.createFolder);
  }
  if (request.moveBookmark) {
    ArchiverView.moveBookmark(request.moveBookmark);
  }
  return;
});

document.addEventListener('DOMContentLoaded', function () {
  Foreman.bindEvents();
  Foreman.displayStatus();
  // similar to: ArchiverView.loadAndDisplayBookmarks();
  Archiver.arrangeBookmarks();
});
