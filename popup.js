'use strict';
/*global chrome*/
/*global Archiver */

var Foreman = {
  start: function() {
    Archiver.progress(0, 100);
    chrome.alarms.create({delayInMinutes: 1});
  },
  stop: function() {
    Archiver.progress(100, 100);
    chrome.alarms.clearAll();
  },
  bindEvents: function() {
    var el = document.getElementById('start');
    el.onclick = function() {
      chrome.alarms.getAll(function(alarms) {
        if (alarms.length > 0) {
          Foreman.stop();
          Foreman.displayStatus();
        } else {
          Foreman.start();
          Foreman.displayStatus();
          Archiver.arrangeBookmarks();
        }
      });
    };
  },
  displayStatus: function() {
    var el = document.getElementById('foreman');
    chrome.alarms.getAll(function(alarms) {
      var btn = document.getElementById('start');
      if (alarms.length > 0) {
        btn.textContent = btn.dataset.stopText;
        el.textContent = el.dataset.runningText;
      } else {
        btn.textContent = btn.dataset.startText;
        el.textContent = "";
      }
    });
  }
};

var ArchiverView = {
  moveBookmark: function(message) {
    var bookmark = message.bookmark;
    var folder = message.folder;
    var el = document.createElement('div');
    el.classList.add('bookmark-title');
    el.textContent = folder.title + ' <- ' + bookmark.title;
    document.body.appendChild(el);
  },
  createFolder: function (message) {
    var folder = message;
    var el = document.createElement('div');
    el.classList.add('bookmark-title');
    el.textContent = '* New folder: ' + folder.title;
    document.body.appendChild(el);
  },
  clear: function() {
    document.getElementById('loading').remove();
  }
};

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
  Archiver.arrangeBookmarks();
});
