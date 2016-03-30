var LATEST_ARRIVALS = 'http://aquariusrecords.org/cat/newest.html';

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({ url: LATEST_ARRIVALS });
});
