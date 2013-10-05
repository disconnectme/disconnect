/*
  A script that determines whether a domain name belongs to a third party.

  Copyright 2012, 2013 Disconnect, Inc.

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

/* Destringifies an object. */
function deserialize(object) {
  return typeof object == 'string' ? JSON.parse(object) : object;
}

/* Formats the blacklist. */
function processServices(data) {
  data =
      deserialize(sjcl.decrypt('be1ba0b3-ccd4-45b1-ac47-6760849ac1d4', data));
  var categories = data.categories;

  for (var categoryName in categories) {
    if (categoryName.length < 12) {
      var category = categories[categoryName];
      var serviceCount = category.length;

      for (var i = 0; i < serviceCount; i++) {
        var service = category[i];

        for (var serviceName in service) {
          var urls = service[serviceName];

          for (var homepage in urls) {
            var domains = urls[homepage];
            var domainCount = domains.length;
            for (var j = 0; j < domainCount; j++)
                moreServices[domains[j]] = {
                  category: categoryName, name: serviceName, url: homepage
                };
          }
        }
      }
    }
  }

  filteringRules = data.filteringRules;
  hardeningRules = data.hardeningRules;
  moreRules = data.moreRules;
}

/* Updates the third-party metadata. */
function fetchServices() {
  var index = 1;
  var requestCount = 1;
  var nextRequest = 1;

  if (Date.now() - preferences.getCharPref('lastUpdateTime') >= dayMilliseconds)
      retryTimer.init({observe: function() {
        if (index == nextRequest) {
          var firstUpdate = !preferences.getCharPref('firstUpdateTime');
          var runtime = Date.now();
          var updatedThisWeek =
              runtime - preferences.getCharPref('firstUpdateThisWeekTime') <
                  7 * dayMilliseconds;
          var updatedThisMonth =
              runtime - preferences.getCharPref('firstUpdateThisMonthTime') <
                  30 * dayMilliseconds;
          xhr.open('GET', 'https://services.disconnect.me/disconnect.json?' + [
            'build=' + (preferences.getIntPref(firstBuild) || ''),
            'first_update=' + firstUpdate,
            'updated_this_week=' + updatedThisWeek,
            'updated_this_month=' + updatedThisMonth
          ].join('&'));

          xhr.onload = function() {
            if (xhr.status == 200) {
              retryTimer.cancel();
              processServices(xhr.responseText);
              firstUpdate &&
                  preferences.setCharPref('firstUpdateTime', runtime);
              updatedThisWeek ||
                  preferences.setCharPref('firstUpdateThisWeekTime', runtime);
              updatedThisMonth ||
                  preferences.setCharPref('firstUpdateThisMonthTime', runtime);
              preferences.setCharPref('lastUpdateTime', runtime);
              preferences.setIntPref(
                'updateCount', preferences.getIntPref('updateCount') + 1
              );
            }
          };

          nextRequest = index + Math.pow(2, Math.min(requestCount++, 12));
          try { xhr.send(); } catch (exception) {}
        }

        index++;
      }}, secondMilliseconds, repeatingSlack);
}

/* Retrieves the third-party metadata, if any, associated with a domain name. */
function getService(domain) { return moreServices[domain]; }

/* Retests a URL. */
function recategorize(domain, url) {
  var category;
  var rule = filteringRules[domain];
  if (rule && RegExp(rule[0]).test(url)) category = rule[1];
  return category;
}

/* Rewrites a URL, if insecure. */
function harden(url) {
  var rules = [];
  if (preferences.getBoolPref('searchHardened'))
      rules = rules.concat(moreRules);
  if (preferences.getBoolPref('browsingHardened'))
      rules = rules.concat(hardeningRules);
  var ruleCount = rules.length;
  var hardenedUrl = url;
  var hardened;

  for (var i = 0; i < ruleCount; i++) {
    var rule = rules[i];
    hardenedUrl = url.replace(RegExp(rule[0]), rule[1]);

    if (hardenedUrl != url) {
      hardened = true;
      break;
    }
  }

  return {url: hardenedUrl, hardened: hardened};
}

/* The "setInterval"-replacement class. */
var timerClass = Components.classes['@mozilla.org/timer;1'];

/* The "setInterval"-replacement ID. */
var timerId = Components.interfaces.nsITimer;

/* The "setInterval" replacement for daily updating. */
var dayTimer = timerClass.createInstance(timerId);

/* The "setInterval" replacement for error handling. */
var retryTimer = timerClass.createInstance(timerId);

/* The timer type. */
var repeatingSlack = timerId.TYPE_REPEATING_SLACK;

/* The "XMLHttpRequest" object. */
var xhr =
    new Components.Constructor('@mozilla.org/xmlextras/xmlhttprequest;1')();

/* The add-on settings. */
var preferences =
    Components.
      classes['@mozilla.org/preferences-service;1'].
      getService(interfaces.nsIPrefService).
      getBranch('extensions.disconnect.');

/* The number of milliseconds in a second. */
var secondMilliseconds = 1000;

/* The number of milliseconds in an hour. */
var hourMilliseconds = 60 * 60 * secondMilliseconds;

/* The number of milliseconds in a day. */
var dayMilliseconds = 24 * hourMilliseconds;

/*
  The categories and third parties, titlecased, and URL of their homepage and
  domain names they phone home with, lowercased.
*/
var moreServices = {};

/* The supplementary domain names, regexes, and categories. */
var filteringRules = {};

/* The matching regexes and replacement strings. */
var hardeningRules = [];

/* The rest of the matching regexes and replacement strings. */
var moreRules = [];

Components.
  classes['@mozilla.org/moz/jssubscript-loader;1'].
  getService(Components.interfaces.mozIJSSubScriptLoader).
  loadSubScript('chrome://disconnect/skin/scripts/data.js');
processServices(JSON.stringify(data));
fetchServices();
dayTimer.init({observe: fetchServices}, hourMilliseconds, repeatingSlack);
