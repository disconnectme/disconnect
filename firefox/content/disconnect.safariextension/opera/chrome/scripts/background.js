/*
  The script for a background page that handles request blocking and the
  visualization thereof.

  Copyright 2010-2014 Disconnect, Inc.

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
var options = options || localStorage
/* Populates an array of a given length with a default value. */
function initializeArray(length, defaultValue) {
  var ARRAY = [];
  for (var i = 0; i < length; i++) ARRAY[i] = defaultValue;
  return ARRAY;
}

/* Checks to see if Disconnect Premium is installed */
function checkPremium(callback) {
  if (callback) callback(false);
}

/* Rewrites a generic cookie with specific domains and paths. */
function mapCookie(cookie, storeId, url, domain, subdomains, paths) {
  var MINIMIZE = Math.min;
  var SUBDOMAIN_COUNT = MINIMIZE(subdomains.length, 20);
      // Chrome won't persist more than 22 domains because of cookie limits.
  delete cookie.hostOnly;
  delete cookie.session;
  var DOMAIN = cookie.domain;

  for (var i = 0; i < SUBDOMAIN_COUNT; i++) {
    var subdomain = subdomains[i];
    cookie.url = url.replace('www', subdomain).replace('search', subdomain);
    cookie.domain = subdomain + domain;
    COOKIES.set(cookie);
  }

  var PATH_COUNT = MINIMIZE(paths.length, 10);
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
    var STORE_COUNT = cookieStores.length;
    var DOMAIN = '.' + service[1][0];
    var SUBDOMAINS = service[2];
    var PATHS = service[3];

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      COOKIES.getAll({url: url, storeId: storeId}, function(cookies) {
        var COOKIE_COUNT = cookies.length;
        for (var j = 0; j < COOKIE_COUNT; j++)
            mapCookie(cookies[j], storeId, url, DOMAIN, SUBDOMAINS, PATHS);
      });
    }
  });
}

/* Erases a batch of cookies. */
function deleteCookies(url, domain, path, storeId, name) {
  var DETAILS = {url: url, storeId: storeId};
  if (name) DETAILS.name = name;

  COOKIES.getAll(DETAILS, function(cookies) {
    var COOKIE_COUNT = cookies.length;

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
    var STORE_COUNT = cookieStores.length;
    var SUBDOMAINS = service[2];
    var SUBDOMAIN_COUNT = SUBDOMAINS.length;
    var DOMAIN = '.' + service[1][0];
    var PATHS = service[3];
    var PATH_COUNT = PATHS.length;

    for (var i = 0; i < STORE_COUNT; i++) {
      var storeId = cookieStores[i].id;

      for (var j = 0; j < SUBDOMAIN_COUNT; j++) {
        var subdomain = SUBDOMAINS[j];
        var mappedUrl =
            url.replace('www', subdomain).replace('search', subdomain);

        if (!name && !j) {
          COOKIES.getAll({url: mappedUrl, storeId: storeId}, function(cookies) {
            var COOKIE_COUNT = cookies.length;

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
  BROWSER_ACTION.setBadgeBackgroundColor({
    color:
        options.displayMode == LEGACY_NAME ? [85, 144, 210, 255] :
            [0, 186, 77, 255]
  });
  var DETAILS = {popup: PATH + 'markup/popup.html'};

  if (SAFARI) {
    DETAILS.width = 148;
    DETAILS.height = 356;
  }

  BROWSER_ACTION.setPopup(DETAILS);
}

/* Tallies the number of tracking requests. */
function getCount(tabRequests) {
  var count = 0;

  for (var categoryName in tabRequests) {
    var category = tabRequests[categoryName];
    for (var serviceName in category) count += category[serviceName].count;
  }

  return count;
}

/* Creates an HTML5 Growl notification. */
function dispatchBubble(title, text, link) {
  if (!(window.Notification)) return
  var link = link || false;
  var notification =
      new Notification(title, {
        dir: 'auto',
        lang: 'en',
        body: text,
        icon: PATH + 'images/d.png'
      });

  notification.onclick = function() { link && TABS.create({url: link}); };

  try {
    notification.show();
  }
  catch(e) {}
}

/* Indicates the number of tracking requests. */
function updateCounter(tabId, count, deactivated) {
  if (
    deserialize(options.blockingIndicated) &&
        (deserialize(options.pwyw) || {}).bucket != 'pending' &&
            (deserialize(options.pwyw) || {}).bucket != 'pending-trial' &&
                !deserialize(options.promoRunning)
  ) {
    deactivated && BROWSER_ACTION.setBadgeBackgroundColor({
      tabId: tabId,
      color:
          options.displayMode == LEGACY_NAME ? [136, 136, 136, 255] :
              [93, 93, 93, 255]
    });

    setTimeout(function() {
      BROWSER_ACTION.setBadgeText({
        tabId: tabId,
        text:
            count ? !deserialize(options.blockingCapped) || count < 100 ?
                count + '' : '99+' : ''
      });
    }, count * 50);
  }
}

/* Indicates the number of tracking requests, if the tab is rendered. */
function safelyUpdateCounter(tabId, count, deactivated) {
  TABS.query({}, function(tabs) {
    var TAB_COUNT = tabs.length;

    for (var i = 0; i < TAB_COUNT; i++) {
      if (tabId == tabs[i].id) {
        updateCounter(tabId, count, deactivated);
        break;
      }
    }
  });
}

/* Tallies and indicates the number of tracking requests. */
function incrementCounter(tabId, service, blocked, popup) {
  var TAB_REQUESTS = REQUEST_COUNTS[tabId] || (REQUEST_COUNTS[tabId] = {});
  var CATEGORY = service.category;
  var CATEGORY_REQUESTS =
      TAB_REQUESTS[CATEGORY] || (TAB_REQUESTS[CATEGORY] = {});
  var SERVICE = service.name;
  var SERVICE_URL = service.url;
  var SERVICE_REQUESTS =
      CATEGORY_REQUESTS[SERVICE] ||
          (CATEGORY_REQUESTS[SERVICE] = {url: SERVICE_URL, count: 0});
  var SERVICE_COUNT = ++SERVICE_REQUESTS.count;
  safelyUpdateCounter(tabId, getCount(TAB_REQUESTS), !blocked);

  if (popup)
      if (CATEGORY == 'Disconnect')
          popup.updateShortcut(tabId, SERVICE, SERVICE_COUNT);
      else {
        var categoryCount = 0;
        for (var name in CATEGORY_REQUESTS)
            categoryCount += CATEGORY_REQUESTS[name].count;
        var UPDATE_CATEGORY = popup.updateCategory;
        UPDATE_CATEGORY && UPDATE_CATEGORY(
          tabId, CATEGORY, categoryCount, SERVICE, SERVICE_URL, SERVICE_COUNT
        );
      }
}

/* Checks to see if the user has paid. */
function paid() {
  var PWYW = deserialize(options.pwyw) || {};
  var STATUS = PWYW.bucket || "";
  if (STATUS == 'viewed' || STATUS == 'trying' || STATUS == 'pending') {
    return false;
  }
  else return true;
}

/* Clears a badge notification. */
function clearBadge() {
  if (options.promoRunning) {delete options.promoRunning;}
  BROWSER_ACTION.setBadgeText({text: ''});
  initializeToolbar();
}

if (SAFARI)
    for (var key in localStorage) {
      options[key] = localStorage[key];
      delete localStorage[key];
    }

/* The current build number. */
var CURRENT_BUILD = 78;

/* The previous build number. */
var PREVIOUS_BUILD = options.build;

/* The domain name of the tabs. */
var DOMAINS = {};

/* The blacklisted services per domain name. */
var BLACKLIST = deserialize(options.blacklist) || {};

/* The previous requested URL of the tabs. */
var REQUESTS = {};

/* The previous redirected URL of the tabs. */
var REDIRECTS = {};

/* The number of tracking requests per tab, overall and by third party. */
var REQUEST_COUNTS = {};

/* The number of total, blocked, and secured requests per tab. */
var DASHBOARD = {};

/* The Collusion data structure. */
var LOG = {};

/* The content key. */
var CONTENT_NAME = 'Content';

/* The list value. */
var LIST_NAME = 'list';

/* The graph value. */
var GRAPH_NAME = 'graph';

/* The legacy value. */
var LEGACY_NAME = 'legacy';

/* The "extension" API. */
var EXTENSION = chrome.extension;

/* The "tabs" API. */
var TABS = chrome.tabs;

/* The "cookies" API. */
var COOKIES = chrome.cookies;

/* The "browserAction" API. */
var BROWSER_ACTION = chrome.browserAction;

/* The experimental value of the "levelOfControl" property. */
var EDITABLE = 'controllable_by_this_extension';

/* The domain object. */
var SITENAME = new Sitename;

/* The domain initialization. */
var IS_INITIALIZED = SITENAME.isInitialized;

/* The domain getter. */
var GET = SITENAME.get;

/* The Shadow Web. */
var PLAYBACK = [];

/* The path to the Chrome directory. */
var PATH = SAFARI ? 'opera/chrome/' : OPERA ? 'chrome/' : '';

/* The pixel width and height of the toolbar icon. */
var SIZE = SAFARI ? 32 : 19;

/* Records whether or not the desktop app is installed. */
var isPremium = false;

/* The whitelisted services per domain name. */
var whitelist = deserialize(options.whitelist) || {};

/* Today. */
var date = new Date();
var month = date.getMonth() + 1;
month = (month < 10 ? '0' : '') + month;
var day = date.getDate();
day = (day < 10 ? '0' : '') + day;
date = date.getFullYear() + '-' + month + '-' + day;

/* T-0. */
var startTime;

if (!PREVIOUS_BUILD) options.blockingIndicated = true;
if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 26) options.blogOpened = true;

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 31) {
  delete options.settingsEditable;
  options.browsingHardened = true;
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 35) {
  var MEDIA_FIRE_DOMAIN = 'mediafire.com';
  (whitelist[MEDIA_FIRE_DOMAIN] || (whitelist[MEDIA_FIRE_DOMAIN] = {})).
    Facebook = true;
  var SALON_DOMAIN = 'salon.com';
  (whitelist[SALON_DOMAIN] || (whitelist[SALON_DOMAIN] = {})).Google = true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 38) {
  var LA_TIMES_DOMAIN = 'latimes.com';
  (whitelist[LA_TIMES_DOMAIN] || (whitelist[LA_TIMES_DOMAIN] = {})).
    Google = true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 39) {
  var udacityDomain = 'udacity.com';
  (whitelist[udacityDomain] || (whitelist[udacityDomain] = {})).Twitter =
      true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 41) delete options.blogOpened;
if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 42) options.blogOpened = true;

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 43) {
  var MIGRATED_WHITELIST = {};

  for (var domain in whitelist) {
    var siteWhitelist =
        (MIGRATED_WHITELIST[domain] = {}).Disconnect =
            {whitelisted: false, services: {}};
    for (var service in whitelist[domain])
        siteWhitelist.services[service] = true;
  }

  options.displayMode = LEGACY_NAME;

  if (PREVIOUS_BUILD || options.initialized) options.pwyw = JSON.stringify({});
  else {
    options.pwyw = JSON.stringify({date: date, bucket: 'viewed'});
    options.displayMode = LIST_NAME;
    options.installDate = moment();
    var partner = false;
    if (SAFARI) {
      safari.application.browserWindows.forEach(function(windowObject) {
        windowObject.tabs.forEach(function(tab) {
          var url = tab.url;
          if (url && url.indexOf('disconnect.me/disconnect/partner') + 1) {
            partner = url.substr(url.lastIndexOf('/') + 1);
            options.referrer = partner;
          }
        });
      });
      if (partner) {
        options.pwyw = JSON.stringify({date: date, bucket: 'viewed-cream'});
        //TABS.create({url: 'https://disconnect.me/d2/partner/' + partner});
      }
      else {
        options.pwyw = JSON.stringify({date: date, bucket: 'viewed'});
        //TABS.create({url: 'https://disconnect.me/disconnect/welcome'});
      }
    }
    else TABS.query({url: "*://*.disconnect.me/*"}, function(disconnectTabs) {
      disconnectTabs.forEach(function(tab) {
        url = tab.url;
        if (tab.url.indexOf('partner') + 1) {
          partner = url.substr(url.lastIndexOf('/') + 1);
          options.referrer = partner;
        }
      });
      if (navigator.userAgent.indexOf('WhiteHat Aviator') + 1) {
        options.pwyw = JSON.stringify({date: date, bucket: 'trying'});
      }
      else if (partner) {
        options.pwyw = JSON.stringify({date: date, bucket: 'viewed-cream'});
        //TABS.create({url: 'https://disconnect.me/d2/partner/' + partner});
      }
      else {
        options.pwyw = JSON.stringify({date: date, bucket: 'viewed'});
        // checkPremium(function(premium) {
        //   if (!premium) {
        //     TABS.create({url: 'https://disconnect.me/disconnect/welcome'});
        //   }
        // })
      }
    });
  }

  options.whitelist = JSON.stringify(whitelist = MIGRATED_WHITELIST);
  options.blacklist = JSON.stringify(BLACKLIST);
  options.updateClosed = true;
  options.sitesHidden = true;
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 44) {
  var FEEDLY_DOMAIN = 'feedly.com';
  var domainWhitelist =
      whitelist[FEEDLY_DOMAIN] || (whitelist[FEEDLY_DOMAIN] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 54) {
  var udacityDomain = 'udacity.com';
  var domainWhitelist =
      whitelist[udacityDomain] || (whitelist[udacityDomain] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Facebook = true;
  disconnectWhitelist.services.Google = true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 57) {
  var FRESH_DIRECT_DOMAIN = 'freshdirect.com';
  var domainWhitelist =
      whitelist[FRESH_DIRECT_DOMAIN] || (whitelist[FRESH_DIRECT_DOMAIN] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  var NEW_YORKER_DOMAIN = 'newyorker.com';
  domainWhitelist =
      whitelist[NEW_YORKER_DOMAIN] || (whitelist[NEW_YORKER_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 59) options.firstBuild = CURRENT_BUILD;

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 60) {
  var HM_DOMAIN = 'hm.com';
  var domainWhitelist = whitelist[HM_DOMAIN] || (whitelist[HM_DOMAIN] = {});
  var analyticsWhitelist =
      domainWhitelist.Analytics ||
          (domainWhitelist.Analytics = {whitelisted: false, services: {}});
  analyticsWhitelist.services.IBM = true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 63) {
  var CVS_DOMAIN = 'cvs.com';
  var domainWhitelist = whitelist[CVS_DOMAIN] || (whitelist[CVS_DOMAIN] = {});
  var advertisingWhitelist =
      domainWhitelist.Advertising ||
          (domainWhitelist.Advertising = {whitelisted: false, services: {}});
  advertisingWhitelist.services.WPP = true;

  var DEVIANT_ART_DOMAIN = 'deviantart.com';
  domainWhitelist =
      whitelist[DEVIANT_ART_DOMAIN] || (whitelist[DEVIANT_ART_DOMAIN] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;

  var MACYS_DOMAIN = 'macys.com';
  domainWhitelist = whitelist[MACYS_DOMAIN] || (whitelist[MACYS_DOMAIN] = {});
  var analyticsWhitelist =
      domainWhitelist.Analytics ||
          (domainWhitelist.Analytics = {whitelisted: false, services: {}});
  analyticsWhitelist.services.IBM = true;

  var NORDSTROM_DOMAIN = 'nordstrom.com';
  domainWhitelist =
      whitelist[NORDSTROM_DOMAIN] || (whitelist[NORDSTROM_DOMAIN] = {});
  analyticsWhitelist =
      domainWhitelist.Analytics ||
          (domainWhitelist.Analytics = {whitelisted: false, services: {}});
  analyticsWhitelist.services.IBM = true;

  var SLIDESHARE_DOMAIN = 'slideshare.net';
  domainWhitelist =
      whitelist[SLIDESHARE_DOMAIN] || (whitelist[SLIDESHARE_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Facebook = true;
  var socialWhitelist =
      domainWhitelist.Social ||
          (domainWhitelist.Social = {whitelisted: false, services: {}});
  socialWhitelist.services.LinkedIn = true;

  var TARGET_DOMAIN = 'target.com';
  domainWhitelist = whitelist[TARGET_DOMAIN] || (whitelist[TARGET_DOMAIN] = {});
  advertisingWhitelist =
      domainWhitelist.Advertising ||
          (domainWhitelist.Advertising = {whitelisted: false, services: {}});
  advertisingWhitelist.services.Ensighten = true;
  advertisingWhitelist.services.RichRelevance = true;

  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 65) {
  var EASY_JET_DOMAIN = 'easyjet.com';
  var domainWhitelist =
      whitelist[EASY_JET_DOMAIN] || (whitelist[EASY_JET_DOMAIN] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 67) {
  var ALLOCINE_DOMAIN = 'allocine.fr';
  var domainWhitelist =
      whitelist[ALLOCINE_DOMAIN] || (whitelist[ALLOCINE_DOMAIN] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Facebook = true;

  var FORD_DOMAIN = 'ford.com';
  domainWhitelist = whitelist[FORD_DOMAIN] || (whitelist[FORD_DOMAIN] = {});
  var advertisingWhitelist =
      domainWhitelist.Advertising ||
          (domainWhitelist.Advertising = {whitelisted: false, services: {}});
  advertisingWhitelist.services.Adobe = true;

  var PLAY_TV_DOMAIN = 'playtv.fr';
  domainWhitelist =
      whitelist[PLAY_TV_DOMAIN] || (whitelist[PLAY_TV_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  disconnectWhitelist.services.Twitter = true;

  var SUBARU_DOMAIN = 'subaru.com';
  domainWhitelist = whitelist[SUBARU_DOMAIN] || (whitelist[SUBARU_DOMAIN] = {});
  var analyticsWhitelist =
      domainWhitelist.Analytics ||
          (domainWhitelist.Analytics = {whitelisted: false, services: {}});
  analyticsWhitelist.services['Mongoose Metrics'] = true;

  var VIMEO_DOMAIN = 'vimeo.com';
  domainWhitelist = whitelist[VIMEO_DOMAIN] || (whitelist[VIMEO_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;

  options.whitelist = JSON.stringify(whitelist);
  options.build = CURRENT_BUILD;
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 68) {
  var CBS_DOMAIN = 'cbs.com';
  var domainWhitelist = whitelist[CBS_DOMAIN] || (whitelist[CBS_DOMAIN] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  var CBS_NEWS_DOMAIN = 'cbsnews.com';
  domainWhitelist =
      whitelist[CBS_NEWS_DOMAIN] || (whitelist[CBS_NEWS_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  var FOSSIL_DOMAIN = 'fossil.com';
  domainWhitelist = whitelist[FOSSIL_DOMAIN] || (whitelist[FOSSIL_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  var GAMESPOT_DOMAIN = 'gamespot.com';
  domainWhitelist =
      whitelist[GAMESPOT_DOMAIN] || (whitelist[GAMESPOT_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  var IGN_DOMAIN = 'ign.com';
  domainWhitelist = whitelist[IGN_DOMAIN] || (whitelist[IGN_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  var TECH_REPUBLIC_DOMAIN = 'techrepublic.com';
  domainWhitelist =
      whitelist[TECH_REPUBLIC_DOMAIN] || (whitelist[TECH_REPUBLIC_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  options.whitelist = JSON.stringify(whitelist);
  options.blockingCapped = true;
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < 69) {
  var BLOOMBERG_DOMAIN = 'bloomberg.com';
  var domainWhitelist =
      whitelist[BLOOMBERG_DOMAIN] || (whitelist[BLOOMBERG_DOMAIN] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  options.whitelist = JSON.stringify(whitelist);
}

if (!PREVIOUS_BUILD || PREVIOUS_BUILD < CURRENT_BUILD) {
  var OBAMA_DOMAIN = 'barackobama.com';
  var domainWhitelist =
      whitelist[OBAMA_DOMAIN] || (whitelist[OBAMA_DOMAIN] = {});
  var disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Twitter = true;
  var MINECRAFT_DOMAIN = 'minecraft.net';
  domainWhitelist =
      whitelist[MINECRAFT_DOMAIN] || (whitelist[MINECRAFT_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  var TED_DOMAIN = 'ted.com';
  domainWhitelist = whitelist[TED_DOMAIN] || (whitelist[TED_DOMAIN] = {});
  disconnectWhitelist =
      domainWhitelist.Disconnect ||
          (domainWhitelist.Disconnect = {whitelisted: false, services: {}});
  disconnectWhitelist.services.Google = true;
  options.whitelist = JSON.stringify(whitelist);
  options.build = CURRENT_BUILD;
}

BROWSER_ACTION.setIcon({path: PATH + 'images/' + SIZE + '.png'});

checkPremium();


if (
  (deserialize(options.pwyw) || {}).bucket == 'pending' ||
      deserialize(options.promoRunning)
) BROWSER_ACTION.setBadgeText({text: 'NEW!'});
else initializeToolbar();
options.displayMode == GRAPH_NAME && parseInt(options.sidebarCollapsed, 10) &&
    options.sidebarCollapsed--; // An experimental "semisticky" bit.

/* Prepopulates the store of tab domain names. */
var ID = setInterval(function() {
  if (IS_INITIALIZED()) {
    clearInterval(ID);
    var TLDS = deserialize(options.tlds || "{}");
    TLDS['google.com'] = true;
    TLDS['yahoo.com'] = true;
    options.tlds = JSON.stringify(TLDS);

    TABS.query({}, function(tabs) {
      var TAB_COUNT = tabs.length;

      for (var i = 0; i < TAB_COUNT; i++) {
        var tab = tabs[i];
        DOMAINS[tab.id] = GET(tab.url);
      }
    });
  }
}, 100);

/* Traps and selectively cancels or redirects a request. */
chrome.webRequest.onBeforeRequest.addListener(function(details) {
  var TAB_ID = details.tabId;
  var TYPE = details.type;
  var PARENT = TYPE == 'main_frame';
  var REQUESTED_URL = details.url;
  var CHILD_DOMAIN = GET(REQUESTED_URL);

  if (PARENT) {
    DOMAINS[TAB_ID] = CHILD_DOMAIN;
    if (!startTime) startTime = new Date();
  }

  var CHILD_SERVICE = getService(CHILD_DOMAIN);
  var PARENT_DOMAIN = DOMAINS[TAB_ID];
  var hardenedUrl;
  var hardened;
  var blockingResponse = {cancel: false};
  var whitelisted;
  var blockedCount;
  var TAB_DASHBOARD =
      DASHBOARD[TAB_ID] ||
          (DASHBOARD[TAB_ID] = {total: 0, blocked: 0, secured: 0});
  var TOTAL_COUNT = ++TAB_DASHBOARD.total;
  var POPUP =
      options.displayMode != LEGACY_NAME &&
          EXTENSION.getViews({type: 'popup'})[0];

  if (CHILD_SERVICE) {
    var PARENT_SERVICE = getService(PARENT_DOMAIN);
    var CHILD_NAME = CHILD_SERVICE.name;
    var REDIRECT_SAFE = REQUESTED_URL != REQUESTS[TAB_ID];
    var CHILD_CATEGORY =
        CHILD_SERVICE.category =
            recategorize(CHILD_DOMAIN, REQUESTED_URL) || CHILD_SERVICE.category;
    var CONTENT = CHILD_CATEGORY == CONTENT_NAME;
    var CATEGORY_WHITELIST =
        ((deserialize(options.whitelist) || {})[PARENT_DOMAIN] ||
            {})[CHILD_CATEGORY] || {};

    if (
      TAB_ID == -1 || PARENT || !PARENT_DOMAIN || CHILD_DOMAIN == PARENT_DOMAIN
          || PARENT_SERVICE && CHILD_NAME == PARENT_SERVICE.name
    ) { // The request is allowed: the topmost frame has the same origin.
      if (REDIRECT_SAFE) {
        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) blockingResponse = {redirectUrl: hardenedUrl};
      }
    } else if (
      (CONTENT && CATEGORY_WHITELIST.whitelisted != false ||
          CATEGORY_WHITELIST.whitelisted ||
              (CATEGORY_WHITELIST.services || {})[CHILD_NAME]) &&
                  !(((deserialize(options.blacklist) || {})[PARENT_DOMAIN] ||
                      {})[CHILD_CATEGORY] || {})[CHILD_NAME]
    ) { // The request is allowed: the category or service is whitelisted.
      if (REDIRECT_SAFE) {
        hardenedUrl = harden(REQUESTED_URL);
        hardened = hardenedUrl.hardened;
        hardenedUrl = hardenedUrl.url;
        if (hardened) blockingResponse = {redirectUrl: hardenedUrl};
        else whitelisted = true;
      }
    } else {
      blockingResponse = {
        redirectUrl:
            TYPE == 'image' ?
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
                    : 'about:blank'
      };
      blockedCount = ++TAB_DASHBOARD.blocked;
      var BLOCKED_REQUESTS = deserialize(options.blockedRequests) || {};
      BLOCKED_REQUESTS[date] ? BLOCKED_REQUESTS[date]++ :
          BLOCKED_REQUESTS[date] = 1;
      options.blockedRequests = JSON.stringify(BLOCKED_REQUESTS);
    } // The request is denied.

    if (blockingResponse.redirectUrl || whitelisted)
        incrementCounter(TAB_ID, CHILD_SERVICE, !whitelisted || CONTENT, POPUP);
  }

  REQUESTED_URL != REDIRECTS[TAB_ID] && delete REQUESTS[TAB_ID];
  delete REDIRECTS[TAB_ID];
  var securedCount;

  if (hardened) {
    REQUESTS[TAB_ID] = REQUESTED_URL;
    REDIRECTS[TAB_ID] = hardenedUrl;
    securedCount = ++TAB_DASHBOARD.secured;
    var HARDENED_REQUESTS = deserialize(options.hardenedRequests) || {};
    HARDENED_REQUESTS[date] ? HARDENED_REQUESTS[date]++ :
        HARDENED_REQUESTS[date] = 1;
    options.hardenedRequests = JSON.stringify(HARDENED_REQUESTS);
  }

  // The Collusion data structure.
  if (!(CHILD_DOMAIN in LOG))
      LOG[CHILD_DOMAIN] = {host: CHILD_DOMAIN, referrers: {}, visited: false};
  if (!(PARENT_DOMAIN in LOG))
      LOG[PARENT_DOMAIN] = {host: PARENT_DOMAIN, referrers: {}};
  LOG[PARENT_DOMAIN].visited = true;
  var REFERRERS = LOG[CHILD_DOMAIN].referrers;
  var ELAPSED_TIME = new Date() - startTime;
  if (CHILD_DOMAIN != PARENT_DOMAIN && !(PARENT_DOMAIN in REFERRERS))
      REFERRERS[PARENT_DOMAIN] = {
        host: PARENT_DOMAIN,
        types: [ELAPSED_TIME]
      };
  var PARENT_REFERRERS = REFERRERS[PARENT_DOMAIN];

  if (PARENT_REFERRERS) {
    var TYPES = PARENT_REFERRERS.types;
    TYPES.indexOf(TYPE) == -1 && TYPES.push(TYPE);
  }

  // For art.
  false && PLAYBACK.push({
    time: ELAPSED_TIME,
    domain: CHILD_DOMAIN,
    type: TYPE,
    tracker: !!(CHILD_SERVICE && CHILD_SERVICE.category != CONTENT_NAME)
  });

  // A live update.
  if (POPUP)
      if (options.displayMode == GRAPH_NAME) {
        var GRAPH = POPUP.graph;
        GRAPH && GRAPH.update(LOG);
      } else {
        var TIMEOUT = POPUP.timeout;

        blockedCount && setTimeout(function() {
          POPUP.renderBlockedRequest(
            TAB_ID,
            Math.min(blockedCount + TOTAL_COUNT * .28, TOTAL_COUNT),
            TOTAL_COUNT
          );
        }, TIMEOUT);

        securedCount && setTimeout(function() {
          POPUP.renderSecuredRequest(
            TAB_ID,
            Math.min(securedCount + TOTAL_COUNT * .28, TOTAL_COUNT),
            TOTAL_COUNT
          );
        }, TIMEOUT);
      }
  return blockingResponse;
}, {urls: ['http://*/*', 'https://*/*']}, ['blocking']);

/* Resets the number of tracking requests and services for a tab. */
!OPERA && chrome.webNavigation.onCommitted.addListener(function(details) {
  if (!details.frameId) {
    var TAB_ID = details.tabId;
    delete REQUEST_COUNTS[TAB_ID];
    delete DASHBOARD[TAB_ID];
    safelyUpdateCounter(TAB_ID, 0);
    var POPUP =
        options.displayMode != LEGACY_NAME &&
            EXTENSION.getViews({type: 'popup'})[0];
    POPUP && POPUP.clearServices(TAB_ID);
  }
});

/* Resets the number of tracking requests and services for a tab. */
SAFARI && safari.application.addEventListener(
  'beforeNavigate', function(event) {
    var TAB_ID = event.target.id;
    delete REQUEST_COUNTS[TAB_ID];
    delete DASHBOARD[TAB_ID];
    safelyUpdateCounter(TAB_ID, 0);
    window.POPUP =
        options.displayMode != LEGACY_NAME &&
            EXTENSION.getViews({type: 'popup'})[0];
    POPUP && POPUP.clearServices(TAB_ID);
  }, true
);


if (!SAFARI) {
  // Tells other extensions if D2 is installed
  chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      try {
        if (request.checkExtension && request.sourceExtension) {
          sendResponse({product: "d2"});
        }
      }
      catch(e) {
        console.log(e);
      }
    }
  );
}

chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
      console.log("first install");
      TABS.create({url: 'https://disconnect.me/mobileupgrade'});

  }else if(details.reason == "update"){

  }
});

/* Builds a block list or adds to the number of blocked requests. */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var TAB = sender.tab;

  if (TAB) {
    var TAB_ID = TAB.id;
    var TAB_DASHBOARD =
        DASHBOARD[TAB_ID] ||
            (DASHBOARD[TAB_ID] = {total: 0, blocked: 0, secured: 0});
    var TOTAL_COUNT = ++TAB_DASHBOARD.total;

    if (request.initialized) {
      var DOMAIN = GET(TAB.url);
      sendResponse({
        servicePointer: servicePointer,
        tlds: SITENAME.getTlds(),
        domain: DOMAIN,
        whitelist: (deserialize(options.whitelist) || {})[DOMAIN] || {},
        blacklist: (deserialize(options.blacklist) || {})[DOMAIN] || {}
      });
    } else if (request.pwyw) {
      var PWYW = deserialize(options.pwyw);
      PWYW.bucket = request.bucket;
      options.pwyw = JSON.stringify(PWYW);
      sendResponse({});
    } 
    else if (request.deleteTab) {
      TABS.remove(TAB.id);
    } else {
      if (SAFARI) {
        var BLOCKED = request.blocked;
        var WHITELISTED = request.whitelisted;
        var popup =
            options.displayMode != LEGACY_NAME &&
                EXTENSION.getViews({type: 'popup'})[0];
        if (BLOCKED || WHITELISTED)
            incrementCounter(TAB_ID, request.childService, !WHITELISTED, popup);
        var blockedCount;

        if (BLOCKED) {
          blockedCount = ++TAB_DASHBOARD.blocked;
          var BLOCKED_REQUESTS = deserialize(options.blockedRequests) || {};
          BLOCKED_REQUESTS[date] ? BLOCKED_REQUESTS[date]++ :
              BLOCKED_REQUESTS[date] = 1;
          options.blockedRequests = JSON.stringify(BLOCKED_REQUESTS);
        }

        // The Collusion data structure.
        var CHILD_DOMAIN = request.childDomain;
        if (!(CHILD_DOMAIN in LOG))
            LOG[CHILD_DOMAIN] = {
              host: CHILD_DOMAIN, referrers: {}, visited: false
            };
        var PARENT_DOMAIN = request.parentDomain;
        if (!(PARENT_DOMAIN in LOG))
            LOG[PARENT_DOMAIN] = {host: PARENT_DOMAIN, referrers: {}};
        LOG[PARENT_DOMAIN].visited = true;
        var REFERRERS = LOG[CHILD_DOMAIN].referrers;
        if (!startTime) startTime = new Date();
        var ELAPSED_TIME = new Date() - startTime;
        if (CHILD_DOMAIN != PARENT_DOMAIN && !(PARENT_DOMAIN in REFERRERS))
            REFERRERS[PARENT_DOMAIN] = {
              host: PARENT_DOMAIN,
              types: [ELAPSED_TIME]
            };
        var PARENT_REFERRERS = REFERRERS[PARENT_DOMAIN];

        if (PARENT_REFERRERS) {
          var TYPES = PARENT_REFERRERS.types;
          var TYPE = request.type;
          TYPES.indexOf(TYPE) == -1 && TYPES.push(TYPE);
        }

        // A live update.
        if (popup)
            if (options.displayMode == GRAPH_NAME) {
              var GRAPH = popup.graph;
              GRAPH && GRAPH.update(LOG);
            } else {
              var TIMEOUT = popup.timeout;

              blockedCount && setTimeout(function() {
                popup.renderBlockedRequest(
                  TAB_ID,
                  Math.min(blockedCount + TOTAL_COUNT * .28, TOTAL_COUNT),
                  TOTAL_COUNT
                );
              }, TIMEOUT);
            }
      }

      sendResponse({});
    }
  } else sendResponse({});
});

/* Loads the blog promo. */
!SAFARI && BROWSER_ACTION.onClicked.addListener(function() {
  clearBadge();
});

if (!SAFARI && !OPERA) {
  if (chrome) {
    if (chrome.runtime) {
      if (chrome.runtime.setUninstallURL) {
        chrome.runtime.setUninstallURL('https://disconnect.me/extension/uninstall');
      }
    }
  }
}
