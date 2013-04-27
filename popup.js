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
  displayItem: function (bookmark) {
    var el = document.createElement('div');
    var year = new Date(bookmark.dateAdded).getFullYear();
    el.classList.add('bookmark-title');
    el.textContent = '[' + year + '] ' + bookmark.title;
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
  }
};

document.addEventListener('DOMContentLoaded', function () {
  ArchiverView.loadAndDisplayBookmarks();
  Foreman.bindEvents();
  Foreman.displayStatus();
});
