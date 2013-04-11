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
     * Resets the number of tracking requests.
     */
    clearBadge: function(button, badge) {
      button.removeClass(Disconnect.badgeName);
      badge.removeClass(Disconnect.shownName);
    },

    /**
     * Refreshes the number of tracking requests.
     */
    updateBadge: function(button, badge, referrerUrl) {
      var currentUrl = gBrowser.contentWindow.location;

      if (!referrerUrl || currentUrl == referrerUrl) {
        var tabRequests = requestCounts[currentUrl] || {};
        var count = 0;

        for (var categoryName in tabRequests) {
          var category = tabRequests[categoryName];
          for (var serviceName in category)
              count += category[serviceName].count;
        }

        if (count) {
          button.addClass(Disconnect.badgeName);
          badge.addClass(Disconnect.shownName).val(count);
        } else Disconnect.clearBadge(button, badge);
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
      loader.loadSubScript('chrome://disconnect/content/debug.js');
      var preferences =
          Components.
            classes['@mozilla.org/preferences-service;1'].
            getService(interfaces.nsIPrefService).
            getBranch('extensions.disconnect.');
      var tabs = gBrowser.tabContainer;
      var get = (new Sitename).get;
      var clearBadge = this.clearBadge;
      var updateBadge = this.updateBadge;
      var renderShortcut = this.renderShortcut;
      var handleShortcut = this.handleShortcut;
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
        updateBadge(button, badge);
      }, false);

      Components.
        classes['@mozilla.org/observer-service;1'].
        getService(interfaces.nsIObserverService).
        addObserver({observe: function(subject, topic, data) {
          updateBadge(button, badge, data);
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
        }, false);

      var go = this.go;
    },

    /**
     * Global variables.
     */
    preferences: null,
    shortcutNames: ['Facebook', 'Google', 'Twitter'],
    whitelistName: 'whitelist',
    badgeName: 'badge',
    shownName: 'shown',
    deactivatedName: 'deactivated',
    highlightedName: '-highlighted.',
    clickName: 'click',
    blockName: 'Block ',
    unblockName: 'Unblock ',
    imageDirectory: 'chrome://disconnect/skin/images/',
    imageExtension: '.png'
  };
}

/**
 * Initializes the object.
 */
addEventListener('load', function() { Disconnect.initialize(); }, false);
