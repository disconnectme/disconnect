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
  data = deserialize(sjcl.decrypt(
    'be1ba0b3-ccd4-45b1-ac47-6760849ac1d4', JSON.stringify(data)
  ));
  var categories = data.categories;

  for (var categoryName in categories) {
    var category = categories[categoryName];
    var serviceCount = category.length;
    var legacy = categoryName.length > 11;

    for (var i = 0; i < serviceCount; i++) {
      var service = category[i];

      for (var serviceName in service) {
        var urls = service[serviceName];

        for (var homepage in urls) {
          var domains = urls[homepage];
          var domainCount = domains.length;

          for (var j = 0; j < domainCount; j++)
              (legacy ? evenMoreServices : moreServices)[domains[j]] = {
                category: legacy ? categoryName.slice(7) : categoryName,
                name: serviceName,
                url: homepage
              };
        }
      }
    }
  }

  filteringRules = data.filteringRules;
  hardeningRules = data.hardeningRules;
  moreRules = data.moreRules;
}

/* Retrieves the third-party metadata, if any, associated with a domain name. */
function getService(domain) { return servicePointer[domain]; }

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
  if (deserialize(options.searchHardened)) rules = rules.concat(moreRules);
  if (deserialize(options.browsingHardened))
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

/* Hot-swaps the blacklists. */
function downgradeServices(downgraded) {
  servicePointer = downgraded ? evenMoreServices : moreServices;
}

/*
  The categories and third parties, titlecased, and URL of their homepage and
  domain names they phone home with, lowercased.
*/
var moreServices = {};

/* The categories et al. for Disconnect 1. */
var evenMoreServices = {};

/* The supplementary domain names, regexes, and categories. */
var filteringRules = {};

/* The matching regexes and replacement strings. */
var hardeningRules = [];

/* The rest of the matching regexes and replacement strings. */
var moreRules = [];

/* The active categories et al. */
var servicePointer = moreServices;

function fetchServicesData() {
  var now = new Date();
  var firstUpdate = new Date(deserialize(localStorage.firstUpdate)) || now;
  var howLongInstalledMsec = now.getTime() - firstUpdate.getTime();
  var oneWeekAsMsec = 7 * 24 * 60 * 60 * 1000;
  var oneMonthAsMsec = 30 * 24 * 60 * 60 * 1000;
  var weekly = JSON.stringify(howLongInstalledMsec >= oneWeekAsMsec);
  var monthly = JSON.stringify(howLongInstalledMsec >= oneMonthAsMsec);
  var url = 'https://services.disconnect.me/disconnect.json';
  // Include params that tell whether the user has been using the extension for
  // a month or for a month.
  var params = ['weekly=' + weekly, 'monthly=' + monthly].join('&');
  url = url + '?' + params;
  $.get(url, function() {
    var now = new Date();
    localStorage.lastUpdate = JSON.stringify(now);
    if (localStorage.firstUpdate == null) {
      localStorage.firstUpdate = localStorage.lastUpdate;
    }
    localStorage.updateCount = JSON.stringify((deserialize(localStorage.updateCount) || 0) + 1);
  });
}

// Set the block list from the local, default dataset.
processServices(data);
// Fetch a more up-to-date block list from the web.
fetchServicesData();
// Update the block list once every 24 hours.
setInterval(fetchServicesData, 24*60*60*1000);

