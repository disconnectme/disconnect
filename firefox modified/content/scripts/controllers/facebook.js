/*
  A controller script that stops Facebook from tracking the webpages you go to.

  Copyright 2010, 2011 Disconnect, Inc.

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

if (typeof DcFbdc == "undefined") {  

  var DcFbdc = {
	  
	/* The domain names Facebook phones home with, lowercased. */
	DOMAINS : ['facebook.com', 'facebook.net', 'fbcdn.net'],
		
	/* The XPCOM interfaces. */
	INTERFACES : Components.interfaces,
	  
	/*
	  Determines whether any of a bucket of domains is part of a URL, regex free.
	*/
	isMatching: function(url, domains) {
	  const DOMAIN_COUNT = domains.length;
	  for (var i = 0; i < DOMAIN_COUNT; i++)
		  if (url.toLowerCase().indexOf(domains[i], 2) >= 2) return true;
			  // A valid URL has at least two characters ("//"), then the domain.
	},

	/* Updates the number of facebook blocks in the popup menu */
	updateCount : function(){
		if(typeof window.content.document.DcFbdcCount == "undefined"){
			window.content.document.DcFbdcCount = 0;
		}				
		DcController.jQuery("#FacebookBlockCount").attr("value",window.content.document.DcFbdcCount);		
	},	

	/* Lifts international trade embargo on Facebook */
	unblock: function(){
		alert("I am unblocking facebook");
	
	},
	
	/* Enforce international trade embargo on Facebook */
	block: function(){
		alert("I am blocking facebook");
	},
	  
	/* Initialization */	  
    init : function() {  

		/* registers this controller in the main controller */
		DcController.controllers.push(DcFbdc);

		/* Traps and selectively cancels a request. */
        DcFbdc.obsService =  Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);  
		DcFbdc.obsService.addObserver({observe: function(subject) {
			DcFbdc.NOTIFICATION_CALLBACKS =
				subject.QueryInterface(DcFbdc.INTERFACES.nsIHttpChannel).notificationCallbacks
					|| subject.loadGroup.notificationCallbacks;
			DcFbdc.BROWSER =
				DcFbdc.NOTIFICATION_CALLBACKS &&
					gBrowser.getBrowserForDocument(
					  DcFbdc.NOTIFICATION_CALLBACKS
						.getInterface(DcFbdc.INTERFACES.nsIDOMWindow).top.document
					);
			subject.referrer.ref;
				// HACK: The URL read otherwise outraces the window unload.
			if(DcFbdc.BROWSER && !DcFbdc.isMatching(DcFbdc.BROWSER.currentURI.spec, DcFbdc.DOMAINS) &&
				DcFbdc.isMatching(subject.URI.spec, DcFbdc.DOMAINS)){

					if(typeof DcFbdc.NOTIFICATION_CALLBACKS.getInterface(DcFbdc.INTERFACES.nsIDOMWindow).top.document.DcFbdcCount == "undefined"){
						DcFbdc.NOTIFICATION_CALLBACKS.getInterface(DcFbdc.INTERFACES.nsIDOMWindow).top.document.DcFbdcCount = 1;
					}
					else{
						DcFbdc.NOTIFICATION_CALLBACKS.getInterface(DcFbdc.INTERFACES.nsIDOMWindow).top.document.DcFbdcCount += 1;						
					}

					subject.cancel(Components.results.NS_ERROR_ABORT);
			}
		  }}, 'http-on-modify-request', false);
	}
  }
}

/* Initialization of DcFbdc object on load */
window.addEventListener("load", function() { DcFbdc.init(); }, false);  
