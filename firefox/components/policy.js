/*
  An XPCOM component that makes the web faster, more private, and more secure.

  Copyright 2010-2013 Disconnect, Inc.

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
Components.utils['import']('resource://gre/modules/XPCOMUtils.jsm');
Components.utils['import']('resource://disconnect/state.js');
var interfaces = Components.interfaces;
var loader =
    Components.
      classes['@mozilla.org/moz/jssubscript-loader;1'].
      getService(interfaces.mozIJSSubScriptLoader);
loader.loadSubScript('chrome://disconnect/skin/scripts/vendor/sjcl/sjcl.js');
loader.loadSubScript('chrome://disconnect/content/sitename.js');
loader.loadSubScript('chrome://disconnect/content/services.js');
loader.loadSubScript('chrome://disconnect/content/debug.js');
var observer =
    Components.
      classes['@mozilla.org/observer-service;1'].
      getService(interfaces.nsIObserverService);

/**
 * Constants.
 */
var preferences =
    Components.
      classes['@mozilla.org/preferences-service;1'].
      getService(interfaces.nsIPrefService).
      getBranch('extensions.disconnect.');
var contentPolicy = interfaces.nsIContentPolicy;
var accept = contentPolicy.ACCEPT;
var get = (new Sitename).get;
var requests = {};
var redirects = {};
var contentName = 'Content';
var startTime = new Date();

/**
 * Creates the component.
 */
function Disconnect() { this.wrappedJSObject = this; }

/**
 * A content policy that makes the web faster, more private, and more secure.
 */
Disconnect.prototype = {
  /**
   * The properties required for XPCOM registration.
   */
  classID: Components.ID('{3f722c5d-555d-4fbc-9444-c5e0d963de8f}'),
  classDescription:
      'A content policy that makes the web faster, more private, and more secure.',
  contractID: '@disconnect.me/d2;1',

  /**
   * The categories to register the component in.
   */
  _xpcom_categories: [{category: 'content-policy'}],

  /**
   * Gets a component interface.
   */
  QueryInterface: XPCOMUtils.generateQI([contentPolicy]),

  /**
   * Traps and selectively cancels or redirects a request.
   */
  shouldLoad: function(contentType, contentLocation, requestOrigin, context) {
    var result = accept;

    if (contentLocation.asciiHost && context) {
      var html = context.ownerDocument;

      if (html) {
        var view = html.defaultView;

        if (view) {
          var childUrl = contentLocation.spec;
          var childDomain = get(contentLocation.host);
          var childService = getService(childDomain);
          var parentUrl = view.top.location;
          var parent = contentType == contentPolicy.TYPE_DOCUMENT;
          var hardenedUrl;
          var hardened;
          var whitelisted;
          var blockedCount;
          var tabDashboard =
              dashboardCounts[parentUrl] || (
                dashboardCounts[parentUrl] = {total: 0, blocked: 0, secured: 0}
              );
          var totalCount = ++tabDashboard.total;
          var date = new Date();
          var month = date.getMonth() + 1;
          month = (month < 10 ? '0' : '') + month;
          var day = date.getDate();
          day = (day < 10 ? '0' : '') + day;
          date = date.getFullYear() + '-' + month + '-' + day;

          if (parent) {
            requestCounts[childUrl] = {};
            observer.notifyObservers(null, 'disconnect-load', childUrl);
          }

          if (childService) {
            var parentDomain = get(parentUrl.hostname);
            var parentService = getService(parentDomain);
            var childName = childService.name;
            var redirectSafe = childUrl != requests[parentUrl];
            var childCategory =
                recategorize(childDomain, childUrl) || childService.category;
            var content = childCategory == contentName;
            var categoryWhitelist =
                (JSON.parse(preferences.getCharPref('whitelist'))[parentDomain]
                    || {})[childCategory] || {};

            if (
              parent || childDomain == parentDomain ||
                  parentService && childName == parentService.name
            ) { // The request is allowed: the top frame has the same origin.
              if (redirectSafe) {
                hardenedUrl = harden(childUrl);
                hardened = hardenedUrl.hardened;
                hardenedUrl = hardenedUrl.url;
                if (hardened) contentLocation.spec = hardenedUrl;
              }
            } else if (
              (content || categoryWhitelist.whitelisted ||
                  (categoryWhitelist.services || {})[childName]) &&
                      !((JSON.parse(preferences.getCharPref(
                        'blacklist'
                      ))[parentDomain] || {})[childCategory] || {})[childName]
            ) { // The request is allowed: the category or service is unblocked.
              if (redirectSafe) {
                hardenedUrl = harden(childUrl);
                hardened = hardenedUrl.hardened;
                hardenedUrl = hardenedUrl.url;
                if (hardened) contentLocation.spec = hardenedUrl;
                else whitelisted = true;
              }
            } else {
              result = contentPolicy.REJECT_SERVER;
              blockedCount = ++tabDashboard.blocked;
              var blockedRequestName = 'blockedRequests';
              var blockedRequests =
                  JSON.parse(preferences.getCharPref(blockedRequestName));
              blockedRequests[date] ? blockedRequests[date]++ :
                  blockedRequests[date] = 1;
              preferences.setCharPref(
                blockedRequestName, JSON.stringify(blockedRequests)
              );
            } // The request is denied.

            if (hardened || whitelisted || result != accept) {
              var tabRequests =
                  requestCounts[parentUrl] || (requestCounts[parentUrl] = {});
              var categoryRequests =
                  tabRequests[childCategory] ||
                      (tabRequests[childCategory] = {});
              var serviceRequests =
                  categoryRequests[childName] || (
                    categoryRequests[childName] = {
                      url: childService.url,
                      count: 0,
                      blocked: !whitelisted || content
                    }
                  );
              serviceRequests.count++;
              observer.notifyObservers(null, 'disconnect-request', parentUrl);
            }
          }

          childUrl != redirects[parentUrl] && delete requests[parentUrl];
          delete redirects[parentUrl];
          var securedCount;

          if (hardened) {
            requests[parentUrl] = childUrl;
            redirects[parentUrl] = hardenedUrl;
            securedCount = ++tabDashboard.secured;
            var hardenedRequestName = 'hardenedRequests';
            var hardenedRequests =
                JSON.parse(preferences.getCharPref(hardenedRequestName));
            hardenedRequests[date] ? hardenedRequests[date]++ :
                hardenedRequests[date] = 1;
            preferences.setCharPref(
              hardenedRequestName, JSON.stringify(hardenedRequests)
            );
          }

          // The Collusion data structure.
          if (!(childDomain in log))
              log[childDomain] = {
                host: childDomain, referrers: {}, visited: false
              };
          if (!(parentDomain in log))
              log[parentDomain] = {host: parentDomain, referrers: {}};
          log[parentDomain].visited = true;
          var referrers = log[childDomain].referrers;
          if (childDomain != parentDomain && !(parentDomain in referrers))
              referrers[parentDomain] = {
                host: parentDomain,
                types: [new Date() - startTime]
              };
          var parentReferrers = referrers[parentDomain];

          if (parentReferrers) {
            var types = parentReferrers.types;
            types.indexOf(contentType) == -1 && types.push(contentType);
          }
        }
      }
    }

    return result;
  },

  /**
   * Passes a request through.
   */
  shouldProcess: function() { return accept; }
}

/**
 * The component entry point.
 */
if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([Disconnect]);
else var NSGetModule = XPCOMUtils.generateNSGetModule([Disconnect]);
