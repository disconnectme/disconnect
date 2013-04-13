/*
  An overlay script that makes the web faster, more private, and more secure.

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

/**
 * The Disconnect namespace.
 */
if (typeof Disconnect == 'undefined') {
  var Disconnect = {
    /**
     * Tallies the number of tracking requests.
     */
    getCount: function() {
      var tabRequests = requestCounts[gBrowser.contentWindow.location] || {};
      var count = 0;
      var blocked = true;

      for (var categoryName in tabRequests) {
        var category = tabRequests[categoryName];

        for (var serviceName in category) {
          var service = category[serviceName]
          count += service.count;
          blocked = blocked && service.blocked;
        }
      }

      return {count: count, blocked: blocked};
    },

    /**
     * Resets the number of tracking requests.
     */
    clearBadge: function(button, badge) {
      button.removeClass(Disconnect.badgeName);
      badge.removeClass(
        Disconnect.blockedName + ' ' + Disconnect.unblockedName
      );
    },

    /**
     * Refreshes the number of tracking requests.
     */
    updateBadge: function(button, badge, count, blocked, referrerUrl) {
      var currentUrl = gBrowser.contentWindow.location;

      if (!referrerUrl || currentUrl == referrerUrl) {
        count == 1 && Disconnect.clearBadge(button, badge);
        button.addClass(Disconnect.badgeName);
        badge.
          addClass(blocked ? Disconnect.blockedName : Disconnect.unblockedName).
          val(count);
      }
    },

    /**
     * Outputs major third-party details as per the blocking state.
     */
    renderShortcut: function(
      name,
      lowercaseName,
      blocked,
      requestCount,
      control,
      wrappedControl,
      badge,
      text,
      animation,
      callback
    ) {
      var whitelistingClicked = 0;
      var count =
          animation > 1 || whitelistingClicked && whitelistingClicked-- ? 21 :
              animation;
      var deactivatedName = Disconnect.deactivatedName;
      var offsetX = -Disconnect.shortcutNames.indexOf(name) * 24;

      if (blocked) {
        wrappedControl[count < 2 ? 'removeClass' : 'addClass'](deactivatedName);
        control.title = Disconnect.unblockName + name;
        for (var i = 0; i < count; i++)
            setTimeout(function(index) {
              index || wrappedControl.off('mouseenter').off('mouseleave');
              var offsetY = index < 18 ? index : 34 - index;
              badge.css({top: -(offsetY * 24 + offsetY), left: offsetX});

              if (index > count - 2) {
                wrappedControl.
                  mouseenter(function() { badge.css('left', offsetX - 72); }).
                  mouseleave(function() { badge.css('left', offsetX); });

                callback && wrappedControl.click(callback);
              }
            }, i * 40, i);
      } else {
        wrappedControl[count < 2 ? 'addClass' : 'removeClass'](deactivatedName);
        control.title = Disconnect.blockName + name;
        for (var i = 0; i < count; i++)
            setTimeout(function(index) {
              index || wrappedControl.off('mouseenter').off('mouseleave');
              var offsetY =
                  index < 14 ? index + 14 : 3 - Math.abs(3 - index % 14);
              badge.css({top: -(offsetY * 24 + offsetY), left: offsetX});

              if (index > count - 2) {
                wrappedControl.
                  mouseenter(function() { badge.css('left', offsetX - 72); }).
                  mouseleave(function() { badge.css('left', offsetX); });

                callback && wrappedControl.click(callback);
              }
            }, i * 40, i);
      }

      text.textContent = requestCount;
    },

    /**
     * Restricts the animation of major third parties to 1x per click.
     */
    handleShortcut: function(
      domain,
      url,
      name,
      lowercaseName,
      requestCount,
      control,
      wrappedControl,
      badge,
      text
    ) {
      wrappedControl.off(Disconnect.clickName);
      var preferences = Disconnect.preferences;
      var whitelistName = Disconnect.whitelistName;
      var whitelist = JSON.parse(preferences.getCharPref(whitelistName));
      var siteWhitelist = whitelist[domain] || (whitelist[domain] = {});
      var disconnectWhitelist =
          siteWhitelist.Disconnect ||
              (siteWhitelist.Disconnect = {whitelisted: false, services: {}});
      var shortcutWhitelist = disconnectWhitelist.services;
      shortcutWhitelist[name] = !shortcutWhitelist[name];
      preferences.setCharPref(whitelistName, JSON.stringify(whitelist));
      Disconnect.renderShortcut(
        name,
        lowercaseName,
        shortcutWhitelist[name],
        requestCount,
        control,
        wrappedControl,
        badge,
        text,
        2,
        function() {
          Disconnect.handleShortcut(
            domain,
            url,
            name,
            lowercaseName,
            requestCount,
            control,
            wrappedControl,
            badge,
            text
          );
        }
      );
      Disconnect.renderWhitelisting(siteWhitelist);
      content.location.reload();
    },

    /**
     * Outputs the global blocking state.
     */
    renderWhitelisting: function(siteWhitelist) {},

    /**
     * Outputs a blocked request.
     */
    renderBlockedRequest: function(url, blockedCount, totalCount, weighted) {
      if (gBrowser.contentWindow.location == url) {
        d3.select('.subtotal.speed').remove();
        var dashboard = Disconnect.dashboard;
        var height = (blockedCount / totalCount || 0) * 35;
        var speedHeight =
            Math.round(
              height *
                  (weighted ? 1 :
                      Disconnect.trackingResourceTime / Disconnect.resourceTime)
            );
        var bandwidthHeight =
            Math.round(
              height *
                  (weighted ? 1 :
                      Disconnect.trackingResourceSize / Disconnect.resourceSize)
            );
        dashboard.
          insert('svg:rect', '.control.speed').
          attr('class', 'subtotal speed').
          attr('x', 29).
          attr('y', 38 - speedHeight).
          attr('width', 8).
          attr('height', speedHeight).
          attr('fill', '#ff7f00');
        d3.select('.subtotal.bandwidth').remove();
        dashboard.
          insert('svg:rect', '.control.bandwidth').
          attr('class', 'subtotal bandwidth').
          attr('x', 95).
          attr('y', 38 - bandwidthHeight).
          attr('width', 8).
          attr('height', bandwidthHeight).
          attr('fill', '#ffbf3f');
      }
    },

    /**
     * Outputs a secured request.
     */
    renderSecuredRequest: function(url, securedCount, totalCount) {
      if (gBrowser.contentWindow.location == url) {
        d3.select('.subtotal.security').remove();
        var height = Math.round((securedCount / totalCount || 0) * 35);
        Disconnect.
          dashboard.
          insert('svg:rect', '.control.security').
          attr('class', 'subtotal security').
          attr('x', 161).
          attr('y', 38 - height).
          attr('width', 8).
          attr('height', height).
          attr('fill', '#00bfff');
      }
    },

    /**
     * Outputs total, blocked, and secured requests.
     */
    renderGraphs: function(url) {
      d3.select('.subtotal.speed').remove();
      d3.select('.total.speed').remove();
      d3.select('.subtotal.bandwidth').remove();
      d3.select('.total.bandwidth').remove();
      d3.select('.subtotal.security').remove();
      d3.select('.total.security').remove();
      var tabDashboard = dashboardCounts[url] || {};
      var blockedCount = tabDashboard.blocked || 0;
      var totalCount = tabDashboard.total || 0;
      var securedCount = tabDashboard.secured || 0;
      var iterations = Math.round(Math.max(
        (blockedCount / totalCount || 0) *
            Disconnect.trackingResourceTime / Disconnect.resourceTime,
        securedCount / totalCount || 0
      ) * 13) + 23;
      var dashboard = Disconnect.dashboard;
      var dummyCount = totalCount || 1;
      var renderBlockedRequest = Disconnect.renderBlockedRequest;
      var weighted = iterations == 23;
      var renderSecuredRequest = Disconnect.renderSecuredRequest;

      for (var i = 1; i < iterations; i++) {
        setTimeout(function(index, delay) {
          if (index < 21) {
            d3.select('.total.speed').remove();
            var height = (index > 19 ? 19 - index % 19 : index) * 2;
            var y = 38 - height;
            dashboard.
              insert('svg:rect', '.subtotal.speed').
              attr('class', 'total speed').
              attr('x', 28).
              attr('y', y).
              attr('width', 10).
              attr('height', height).
              attr('fill', '#ff3f00');
            d3.select('.total.bandwidth').remove();
            dashboard.
              insert('svg:rect', '.subtotal.bandwidth').
              attr('class', 'total bandwidth').
              attr('x', 94).
              attr('y', y).
              attr('width', 10).
              attr('height', height).
              attr('fill', '#ff7f00');
            d3.select('.total.security').remove();
            dashboard.
              insert('svg:rect', '.subtotal.security').
              attr('class', 'total security').
              attr('x', 160).
              attr('y', y).
              attr('width', 10).
              attr('height', height).
              attr('fill', '#007fff');
          }

          if (index > 15) {
            var defaultCount = dummyCount * .28;
            var offsetIndex = index - 15;
            var modulus = iterations - 17;
            var fraction = (
              offsetIndex > modulus ? modulus - offsetIndex % modulus :
                  offsetIndex
            ) / (iterations - 18);
            renderBlockedRequest(
              url,
              Math.min(blockedCount + defaultCount, dummyCount) * fraction,
              dummyCount,
              weighted
            );
            renderSecuredRequest(
              url,
              Math.min(securedCount + defaultCount, dummyCount) * fraction,
              dummyCount
            );
          }

          Disconnect.timeouts[url] =
              Disconnect.timeouts[url] == null ? 1600 :
                  (iterations - index - 1) * 25;
        }, i * 25, i);
      }
    },

    /**
     * Navigates to a URL.
     */
    go: function(that) {
      gBrowser.selectedTab = gBrowser.addTab(that.getAttribute('value'));
    },

    /**
     * Registers event handlers.
     */
    initialize: function() {
      Components.utils['import']('resource://modules/state.js');
      var interfaces = Components.interfaces;
      var loader =
          Components.
            classes['@mozilla.org/moz/jssubscript-loader;1'].
            getService(interfaces.mozIJSSubScriptLoader);
      loader.loadSubScript('chrome://disconnect/content/sitename-firefox.js');
      loader.loadSubScript(
        'chrome://disconnect/skin/scripts/vendor/jquery/jquery.js'
      );
      loader.loadSubScript('chrome://disconnect/skin/scripts/vendor/d3/d3.js');
      loader.loadSubScript(
        'chrome://disconnect/skin/scripts/vendor/d3/d3.layout.js'
      );
      loader.loadSubScript(
        'chrome://disconnect/skin/scripts/vendor/d3/d3.geom.js'
      );
      loader.loadSubScript('chrome://disconnect/content/debug.js');
      var preferences =
          Components.
            classes['@mozilla.org/preferences-service;1'].
            getService(interfaces.nsIPrefService).
            getBranch('extensions.disconnect.');
      var tabs = gBrowser.tabContainer;
      var get = (new Sitename).get;
      var getCount = this.getCount;
      var clearBadge = this.clearBadge;
      var updateBadge = this.updateBadge;
      var renderShortcut = this.renderShortcut;
      var handleShortcut = this.handleShortcut;
      var renderBlockedRequest = this.renderBlockedRequest;
      var renderSecuredRequest = this.renderSecuredRequest;
      var renderGraphs = this.renderGraphs;
      var shortcutNames = this.shortcutNames;
      var shortcutCount = shortcutNames.length;
      var buildName = 'build';
      var navbarName = 'nav-bar';
      var currentSetName = 'currentset';
      var browsingHardenedName = 'browsingHardened';
      var whitelistName = this.whitelistName;
      var highlightedName = this.highlightedName;
      var clickName = this.clickName;
      var currentBuild = 2;
      var previousBuild = preferences.getIntPref(buildName);
      var whitelist = JSON.parse(preferences.getCharPref(whitelistName));
      var browsingHardened = preferences.getBoolPref(browsingHardenedName);
      this.preferences = preferences;

      if (!previousBuild) {
        var toolbar = document.getElementById(navbarName);
        toolbar.insertItem('disconnect-item');
        toolbar.setAttribute(currentSetName, toolbar.currentSet);
        document.persist(navbarName, currentSetName);
      }

      if (!previousBuild || previousBuild < currentBuild) {
        var migratedWhitelist = {};

        for (var domain in whitelist) {
          var siteWhitelist =
              (migratedWhitelist[domain] = {}).Disconnect =
                  {whitelisted: false, services: {}};
          for (var service in whitelist[domain])
              siteWhitelist.services[service] = true;
        }

        preferences.
          setCharPref(whitelistName, JSON.stringify(migratedWhitelist));
        preferences.setIntPref(buildName, currentBuild);
      }

      var button = $(document.getElementById('disconnect-button'));
      var badge = $(document.getElementById('disconnect-badge'));
      var shortcutSurface =
          document.
            getElementById('shortcuts').getElementsByTagName('html:td')[0];
      var shortcutTemplate =
          shortcutSurface.getElementsByClassName('shortcut')[0];
      var activeServices = [];
      var wifi =
          document.
            getElementsByClassName('wifi')[0].
            getElementsByTagName('html:input')[0];

      tabs.addEventListener('TabOpen', function() {
        clearBadge(button, badge);
      }, false);

      tabs.addEventListener('TabClose', function(event) {
        delete requestCounts[
          gBrowser.getBrowserForTab(event.target).contentWindow.location
        ];
      }, false);

      tabs.addEventListener('TabSelect', function() {
        var countReturn = getCount();
        var count = countReturn.count;
        count ? updateBadge(button, badge, count, countReturn.blocked) :
            clearBadge(button, badge);
      }, false);

      Components.
        classes['@mozilla.org/observer-service;1'].
        getService(interfaces.nsIObserverService).
        addObserver({observe: function(subject, topic, data) {
          var countReturn = getCount();
          var count = countReturn.count;

          setTimeout(function() {
            updateBadge(button, badge, count, countReturn.blocked, data);
          }, count * 100);

          var tabDashboard = dashboardCounts[data] || {};
          var blockedCount = tabDashboard.blocked || 0;
          var totalCount = tabDashboard.total || 0;
          var timeout = Disconnect.timeouts[data] || 0;
          var securedCount = tabDashboard.secured || 0;

          blockedCount && setTimeout(function() {
            renderBlockedRequest(
              data,
              Math.min(blockedCount + totalCount * .28, totalCount),
              totalCount
            );
          }, timeout);

          securedCount && setTimeout(function() {
            renderSecuredRequest(
              data,
              Math.min(securedCount + totalCount * .28, totalCount),
              totalCount
            );
          }, timeout);
        }}, 'disconnect-increment', false);

      $(document.getElementById('navbar').getElementsByTagName('html:img')[0]).
        mouseenter(function() {
          this.src = this.src.replace('.', highlightedName);
        }).
        mouseleave(function() {
          this.src = this.src.replace(highlightedName, '.');
        });

      for (var i = 0; i < shortcutCount; i++)
          shortcutSurface.
            appendChild(shortcutTemplate.cloneNode(true)).
            getElementsByTagName('html:img')[0].
            alt = shortcutNames[i];
      wifi.checked = browsingHardened;

      wifi.addEventListener(clickName, function() {
        browsingHardened = !browsingHardened;
        preferences.setBoolPref(browsingHardenedName, browsingHardened);
        this.checked = browsingHardened;
      }, false);

      this.dashboard =
          d3.
            select('#data').
            append('svg:svg').
            attr('width', 198).
            attr('height', 40);
      this.
        dashboard.
        append('svg:rect').
        attr('class', 'control speed').
        attr('x', 10).
        attr('y', 0).
        attr('width', 46).
        attr('height', 40).
        attr('fill', 'transparent');
      this.
        dashboard.
        append('svg:rect').
        attr('class', 'control bandwidth').
        attr('x', 76).
        attr('y', 0).
        attr('width', 46).
        attr('height', 40).
        attr('fill', 'transparent');
      this.
        dashboard.
        append('svg:rect').
        attr('class', 'control security').
        attr('x', 142).
        attr('y', 0).
        attr('width', 46).
        attr('height', 40).
        attr('fill', 'transparent');

      document.getElementById('disconnect-popup').addEventListener(
        'popupshowing', function() {
          var url = gBrowser.contentWindow.location;
          var domain = get(url.hostname);
          var tabRequests = requestCounts[url] || {};
          var disconnectRequests = tabRequests.Disconnect || {};
          whitelist = JSON.parse(preferences.getCharPref(whitelistName));
          var siteWhitelist = whitelist[domain] || {};
          var shortcutWhitelist =
              (siteWhitelist.Disconnect || {}).services || {};

          for (var i = 0; i < shortcutCount; i++) {
            var control = document.getElementsByClassName('shortcut')[i + 1];
            var wrappedControl = $(control);
            var name = shortcutNames[i];
            var lowercaseName = name.toLowerCase();
            var shortcutRequests = disconnectRequests[name];
            var requestCount = shortcutRequests ? shortcutRequests.count : 0;
            var badge = $(control.getElementsByTagName('html:img')[0]);
            var text = control.getElementsByClassName('text')[0];
            wrappedControl.off(clickName);
            renderShortcut(
              name,
              lowercaseName,
              !shortcutWhitelist[name],
              requestCount,
              control,
              wrappedControl,
              badge,
              text,
              1,
              function(
                name,
                lowercaseName,
                requestCount,
                control,
                wrappedControl,
                badge,
                text
              ) {
                handleShortcut(
                  domain,
                  url,
                  name,
                  lowercaseName,
                  requestCount,
                  control,
                  wrappedControl,
                  badge,
                  text
                );
              }.bind(
                null,
                name,
                lowercaseName,
                requestCount,
                control,
                wrappedControl,
                badge,
                text
              )
            );
          }

          renderGraphs(url);
        }, false);

      var go = this.go;
    },

    /**
     * Global variables.
     */
    preferences: null,
    shortcutNames: ['Facebook', 'Google', 'Twitter'],
    timeouts: {},
    whitelistName: 'whitelist',
    badgeName: 'badge',
    blockedName: 'blocked',
    unblockedName: 'unblocked',
    deactivatedName: 'deactivated',
    highlightedName: '-highlighted.',
    clickName: 'click',
    blockName: 'Block ',
    unblockName: 'Unblock ',
    trackingResourceTime: 72.6141083689391,
    resourceTime: 55.787731003361,
    trackingResourceSize: 8.51145760261889,
    resourceSize: 10.4957370842049,
    dashboard: {}
  };
}

/**
 * Initializes the object.
 */
addEventListener('load', function() { Disconnect.initialize(); }, false);
