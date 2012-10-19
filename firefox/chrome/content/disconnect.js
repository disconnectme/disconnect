/*
  An overlay script that stops Facebook from tracking the webpages you go to.

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
    Gary Teh <garyjob@gmail.com>
*/

/**
 * The Disconnect namespace.
 */
if (typeof Disconnect == 'undefined') {
  var Disconnect = {

    services: ['facebook'],
    /**
     * Fetches the number of tracking requests.
     */
    getRequestCount: function() {
      if (typeof gBrowser.contentWindow.document.thirdPartyRequestCount == 'undefined'){
        return 0;
      }
      return gBrowser.contentWindow.document.thirdPartyRequestCount;
    },

    /**
     * Fetches the blocking state.
     */
    isUnblocked: function() {
      if (typeof content.localStorage.thirdPartiesUnblocked == 'undefined'){
        content.localStorage.thirdPartiesUnblocked = false;
      }
      return JSON.parse(content.localStorage.thirdPartiesUnblocked);
    },


    initialize: function() {
      var that = this;

      window.removeEventListener('load', Disconnect.initialize, false);
      try { DisconnectUI.clearMenuPopup(); } catch(e) {}

      var appcontent = document.getElementById('appcontent');
      if ( appcontent ) {
        try {
            //document.getElementById('disconnect-status').style.display = '';
            var p = document.getElementById('disconnect-popup');
            p.parentNode.removeChild(p);
        } catch (err) { }

        appcontent.addEventListener('load', DisconnectUI.onPageLoad, true);
      }
  
      gBrowser.tabContainer.addEventListener('TabAttrModified', function() {
        DisconnectUI.updateBlockedCount();
      }, false);

      gBrowser.addEventListener('error', function() {
        DisconnectUI.updateBlockedCount();
      }, false);

      gBrowser.addEventListener('DOMContentLoaded', function() {
        DisconnectUI.updateBlockedCount();
      }, false);
    }
  };
}

/**
 * Initializes the object.
 */
addEventListener('load', function() { Disconnect.initialize(); }, false);
