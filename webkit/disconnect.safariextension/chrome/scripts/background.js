/*
  The script for a background page that handles request blocking and the
  visualization thereof.

  Copyright 2010-2012 Disconnect, Inc.

  This program is free software: you can redistribute it and/or modify it under
  the terms of the GNU General Public License as published by the Free Software
  Foundation, either version 3 of the License, or (at your option) any later
  version.

  This program is distributed in the hope that it will be useful, but WITHOUT
  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

  You should have received a copy of the GNU General Public License along with
  this program. If not, see <http://www.gnu.org/licenses/>.

  Authors (one per line):

    Brian Kennish <byoogle@gmail.com>
*/

/* Populates an array of a given length with a default value. */
function initializeArray(length, defaultValue) {
  const ARRAY = [];
  for (var i = 0; i < length; i++) ARRAY[i] = defaultValue;
  return ARRAY;
}

/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* Preps the browser action. */
function initializeToolbar() {
  BROWSER_ACTION.setBadgeBackgroundColor({color: [60, 92, 153, 255]});
  const DETAILS = {popup: (SAFARI ? 'chrome' : '') + '/markup/popup.html'};

  if (SAFARI) {
    DETAILS.width = 140;
    DETAILS.height = 228;
  }

  BROWSER_ACTION.setPopup(DETAILS);
}

/* Tallies and indicates the number of blocked requests. */
function incrementCounter(tabId, serviceIndex) {
  const TAB_BLOCKED_COUNTS =
      BLOCKED_COUNTS[tabId] ||
          (BLOCKED_COUNTS[tabId] = [0, initializeArray(SERVICE_COUNT, 0)]);
  const TAB_BLOCKED_COUNT = ++TAB_BLOCKED_COUNTS[0];
  TAB_BLOCKED_COUNTS[1][serviceIndex]++;
  if (deserialize(localStorage.blockingIndicated))
      BROWSER_ACTION.setBadgeText({tabId: tabId, text: TAB_BLOCKED_COUNT + ''});
}

/*
  The third parties and search engines, titlecased, and domain, subdomain, and
  path names they phone home with and secure URL of their query page,
  lowercased.
*/
const SERVICES = [
  ['Facebook', [
    'facebook.com',
    'facebook.net',
    'fbcdn.net',
    'disconnect.me',
    'localhost'
        // "disconnect.me" and "localhost" whitelisting is temporary, for FBME.
  ]],
  ['Google', [
    'google.com',
    '2mdn.net',
    'doubleclick.net',
    'feedburner.com',
    'gmodules.com',
    'google-analytics.com',
    'googleadservices.com',
    'googlesyndication.com'
  ], [
    'adwords',
    'checkout',
    'chrome',
    'code',
    'docs',
    'feedburner',
    'groups',
    'health',
    'knol',
    'mail',
    'music',
    'picasaweb',
    'plus',
    'sites',
    'sketchup',
    'talkgadget',
    'wave'
  ], [
    'accounts',
    'analytics',
    'bookmarks',
    'calendar',
    'finance',
    'ig',
    'latitude',
    'reader',
    'voice',
    'webmasters',
    'adsense',
    'alerts',
    'cse',
    'dfp',
    'friendconnect',
    'local',
    'merchants',
    'notebook',
    'support'
  ], 'https://www.google.com/'],
  ['LinkedIn', ['linkedin.com']],
  ['Twitter', ['twitter.com', 'twimg.com']],
  ['Yahoo', ['yahoo.com'], [
    'address',
    'answers',
    'apps',
    'buzz',
    'calendar',
    'edit',
    'finance',
    'games',
    'groups',
    'hotjobs',
    'local',
    'mail',
    'my',
    'notepad',
    'pulse',
    'shine',
    'sports',
    'upcoming',
    'webmessenger',
    'www',
    'alerts',
    'autos',
    'avatars',
    'help',
    'login', // "login" is required for OpenID access but conflicts with "edit".
    'messages',
    'pipes',
    'realestate',
    'smallbusiness',
    'travel',
    'widgets'
  ], [], 'https://search.yahoo.com/']
];

/* The number of third parties. */
const SERVICE_COUNT = SERVICES.length;

/* The suffix of the blocking key. */
const BLOCKED_NAME = 'Blocked';

/* The number of blocked requests per tab, overall and by third party. */
const BLOCKED_COUNTS = {};

/* The "tabs" API. */
const TABS = chrome.tabs;

/* The "browserAction" API. */
const BROWSER_ACTION = chrome.browserAction;

/* A throwaway index. */
var i;

if (!deserialize(localStorage.initialized)) {
  for (i = 0; i < SERVICE_COUNT; i++)
      localStorage[SERVICES[i][0].toLowerCase() + BLOCKED_NAME] = true;
  localStorage.blockingIndicated = true;
  localStorage.initialized = true;
}

localStorage.fbmeOpened = true;
if (!deserialize(localStorage.fbmeOpened))
    BROWSER_ACTION.setBadgeText({text: 'NEW!'});
else initializeToolbar();

/* Resets the number of blocked requests for a tab. */
TABS.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status == 'loading') delete BLOCKED_COUNTS[tabId];
  if (SAFARI && deserialize(localStorage.blockingIndicated))
      BROWSER_ACTION.setBadgeText({tabId: tabId, text: ''});
});

/* Builds a block list or adds to the number of blocked requests. */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.initialized) {
    const BLACKLIST = [];

    for (var i = 0; i < SERVICE_COUNT; i++) {
      var service = SERVICES[i];
      BLACKLIST[i] =
          deserialize(localStorage[service[0].toLowerCase() + BLOCKED_NAME]) ?
              [service[1], !!service[2]] : [[]];
    }

    sendResponse({blacklist: BLACKLIST});
  } else {
    incrementCounter(sender.tab.id, request.serviceIndex);
    sendResponse({});
  }
});

/* Loads the FBME promo. */
BROWSER_ACTION.onClicked.addListener(function() {
  BROWSER_ACTION.getPopup({}, function(result) {
    if (!result) {
      TABS.create({url: 'https://fbme.disconnect.me/extension'});
      BROWSER_ACTION.setBadgeText({text: ''});
      initializeToolbar();
      localStorage.fbmeOpened = true;
    }
  });
});
