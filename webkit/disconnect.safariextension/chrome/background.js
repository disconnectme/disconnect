/*
  The script for a background page that handles request blocking and the
  visualization thereof.

  Copyright 2010, 2011 Brian Kennish

  Licensed under the Apache License, Version 2.0 (the "License"); you may not
  use this file except in compliance with the License. You may obtain a copy of
  the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
  License for the specific language governing permissions and limitations under
  the License.

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

/* Rewrites a generic cookie with specific domains and paths. */
function mapCookie(cookie, storeId, url, domain, subdomains, paths) {
  const MINIMIZE = Math.min;
  const SUBDOMAIN_COUNT = MINIMIZE(subdomains.length, 20);
      // Chrome won't persist more than 22 domains because of cookie limits.
  delete cookie.hostOnly;
  delete cookie.session;
  const DOMAIN = cookie.domain;

  for (var i = 0; i < SUBDOMAIN_COUNT; i++) {
    var subdomain = subdomains[i];
    cookie.url = url.replace('www', subdomain).replace('search', subdomain);
    cookie.domain = subdomain + domain;
    COOKIES.set(cookie);
  }

  const PATH_COUNT = MINIMIZE(paths.length, 10);
      // Chrome won't persist more than 11 paths.
  cookie.domain = DOMAIN;

  for (i = 0; i < PATH_COUNT; i++) {
    var path = paths[i];
    cookie.url = url + path;
    cookie.path = '/' + path;
    COOKIES.set(cookie);
  }

  COOKIES.remove({url: url, name: cookie.name, storeId: storeId});
}

/* Rewrites a batch of generic cookies with specific domains and paths. */
function mapCookies(url, service) {
  COOKIES.getAllCookieStores(function(cookieStores) {
    const STORE_COUNT = cookieStores.length;
    const DOMAIN = '.' + service[1][0];
    const SUBDOMAINS = service[2];
    const PATHS = service[3];

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      COOKIES.getAll({url: url, storeId: storeId}, function(cookies) {
        const COOKIE_COUNT = cookies.length;
        for (var j = 0; j < COOKIE_COUNT; j++)
            mapCookie(cookies[j], storeId, url, DOMAIN, SUBDOMAINS, PATHS);
      });
    }
  });
}

/* Erases a batch of cookies. */
function deleteCookies(url, domain, path, storeId, name) {
  const DETAILS = {url: url, storeId: storeId};
  if (name) DETAILS.name = name;

  COOKIES.getAll(DETAILS, function(cookies) {
    const COOKIE_COUNT = cookies.length;

    for (var i = 0; i < COOKIE_COUNT; i++) {
      var cookie = cookies[i];
      if (cookie.domain == domain && cookie.path == path)
          COOKIES.remove(
            {url: url, name: name || cookie.name, storeId: storeId}
          );
    }
  });
}

/* Rewrites a batch of specific cookies with a generic domain and path. */
function reduceCookies(url, service, name) {
  COOKIES.getAllCookieStores(function(cookieStores) {
    const STORE_COUNT = cookieStores.length;
    const SUBDOMAINS = service[2];
    const SUBDOMAIN_COUNT = SUBDOMAINS.length;
    const DOMAIN = '.' + service[1][0];
    const PATHS = service[3];
    const PATH_COUNT = PATHS.length;

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      for (var j = 0; j < SUBDOMAIN_COUNT; j++) {
        var subdomain = SUBDOMAINS[j];
        var mappedUrl =
            url.replace('www', subdomain).replace('search', subdomain);

        if (!name && !j) {
          COOKIES.getAll({url: mappedUrl, storeId: storeId}, function(cookies) {
            const COOKIE_COUNT = cookies.length;

            for (var i = 0; i < COOKIE_COUNT; i++) {
              var details = cookies[i];
              details.url = url;
              details.domain = DOMAIN;
              delete details.hostOnly;
              delete details.session;

              setTimeout(function(details) {
                COOKIES.set(details);
              }.bind(null, details), 1000);
            }
          });
        }

        deleteCookies(mappedUrl, '.' + subdomain + DOMAIN, '/', storeId, name);
      }

      for (j = 0; j < PATH_COUNT; j++) {
        var path = PATHS[j];
        deleteCookies(url + path, DOMAIN, '/' + path, storeId, name);
      }
    }
  });
}

/* Preps the browser action. */
function initializeToolbar() {
  BROWSER_ACTION.setBadgeBackgroundColor({color: [60, 92, 153, 255]});
  BROWSER_ACTION.setPopup({popup: 'popup.html'});
}

/* Tallies and indicates the number of blocked requests. */
function incrementCounter(tabId, serviceIndex) {
  const TAB_BLOCKED_COUNTS =
      BLOCKED_COUNTS[tabId] ||
          (BLOCKED_COUNTS[tabId] = [0, initializeArray(SERVICE_COUNT, 0)]);
  const TAB_BLOCKED_COUNT = ++TAB_BLOCKED_COUNTS[0];
  TAB_BLOCKED_COUNTS[1][serviceIndex]++;
  BROWSER_ACTION.setIcon({tabId: tabId, path: 'blocked.png'});
  if (deserialize(localStorage.blockingIndicated))
      BROWSER_ACTION.setBadgeText({tabId: tabId, text: TAB_BLOCKED_COUNT + ''});
}

/*
  The third parties and search engines, titlecased, and domain, subdomain, and
  path names they phone home with and secure URL of their query page,
  lowercased.
*/
const SERVICES = [
  ['Digg', ['digg.com']],
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

/* The "cookies" API. */
const COOKIES = chrome.cookies;

/* The "browserAction" API. */
const BROWSER_ACTION = chrome.browserAction;

/* The timestamping method. */
const TIMESTAMP = Date.now;

/* The start time of this script. */
const START_TIME = TIMESTAMP();

/* A throwaway index. */
var i;

if (!deserialize(localStorage.initialized)) {
  for (i = 0; i < SERVICE_COUNT; i++)
      localStorage[SERVICES[i][0].toLowerCase() + BLOCKED_NAME] = true;
  localStorage.blockingIndicated = true;
  localStorage.initialized = true;
}

for (i = 0; i < SERVICE_COUNT; i++) {
  var service = SERVICES[i];
  var url = service[4];

  if (
    url && deserialize(localStorage[service[0].toLowerCase() + BLOCKED_NAME])
  ) {
    reduceCookies(url, service);
    if (deserialize(localStorage.searchDepersonalized))
        mapCookies(url, service);
  }
}

if (!deserialize(localStorage.fbmeOpened))
    BROWSER_ACTION.setBadgeText({text: 'NEW!'});
else initializeToolbar();

/* Resets the number of blocked requests for a tab. */
TABS.onUpdated.addListener(function(tabId, changeInfo) {
  if (changeInfo.status == 'loading') delete BLOCKED_COUNTS[tabId];
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

/*
  Optionally rewrites a search cookie and adds to the number of blocked
  requests.
*/
COOKIES.onChanged.addListener(function(changeInfo) {
  if (deserialize(localStorage.searchDepersonalized) && !changeInfo.removed) {
    const COOKIE = changeInfo.cookie;
    const DOMAIN = COOKIE.domain;
    const PATH = COOKIE.path;
    const NAME = COOKIE.name;
    const EXPIRATION = COOKIE.expirationDate;

    for (var i = 0; i < SERVICE_COUNT; i++) {
      var service = SERVICES[i];
      var url = service[4];
      var domain = '.' + service[1][0];

      if (
        url &&
            deserialize(localStorage[service[0].toLowerCase() + BLOCKED_NAME])
                && DOMAIN == domain && PATH == '/' && NAME != 'AO'
      ) {
        // The cookie API doesn't properly expire cookies.
        if (!EXPIRATION || EXPIRATION > TIMESTAMP() / 1000)
            mapCookie(
              COOKIE, COOKIE.storeId, url, domain, service[2], service[3]
            );
        else reduceCookies(url, service, NAME);
        if (START_TIME <= TIMESTAMP() - 3000)
            setTimeout(function(serviceIndex) {
              TABS.getSelected(null, function(tab) {
                incrementCounter(tab.id, serviceIndex);
              }); // The cookie might not be getting set from the selected tab.
            }.bind(null, i), 2000);
                // This call would otherwise race that of the tab listener.
      }
    }
  }
});

/* Loads the FBME promo. */
BROWSER_ACTION.onClicked.addListener(function() {
  TABS.create({url: 'https://fbme.disconnect.me/extension'});
  BROWSER_ACTION.setBadgeText({text: ''});
  initializeToolbar();
  localStorage.fbmeOpened = true;
});
