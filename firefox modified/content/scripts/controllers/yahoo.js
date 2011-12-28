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

if (typeof DcYahoo == "undefined") {  

  var DcYahoo = {
	  
	/* The domain names Facebook phones home with, lowercased. */
	DOMAINS : ['yahoo.com'],
		
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
		if(typeof window.content.document.DcYahooCount == "undefined"){
			window.content.document.DcYahooCount = 0;
		}				
		DcController.jQuery("#YahooBlockCount").attr("value",window.content.document.DcYahooCount);		
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
		DcController.controllers.push(DcYahoo);

		/* Traps and selectively cancels a request. */
        DcYahoo.obsService =  Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);  
		DcYahoo.obsService.addObserver({observe: function(subject) {
			DcYahoo.NOTIFICATION_CALLBACKS =
				subject.QueryInterface(DcYahoo.INTERFACES.nsIHttpChannel).notificationCallbacks
					|| subject.loadGroup.notificationCallbacks;
			DcYahoo.BROWSER =
				DcYahoo.NOTIFICATION_CALLBACKS &&
					gBrowser.getBrowserForDocument(
					  DcYahoo.NOTIFICATION_CALLBACKS
						.getInterface(DcYahoo.INTERFACES.nsIDOMWindow).top.document
					);
			subject.referrer.ref;
				// HACK: The URL read otherwise outraces the window unload.
			if(DcYahoo.BROWSER && !DcYahoo.isMatching(DcYahoo.BROWSER.currentURI.spec, DcYahoo.DOMAINS) &&
				DcYahoo.isMatching(subject.URI.spec, DcYahoo.DOMAINS)){

					if(typeof DcYahoo.NOTIFICATION_CALLBACKS.getInterface(DcYahoo.INTERFACES.nsIDOMWindow).top.document.DcYahooCount == "undefined"){
						DcYahoo.NOTIFICATION_CALLBACKS.getInterface(DcYahoo.INTERFACES.nsIDOMWindow).top.document.DcYahooCount = 1;
					}
					else{
						DcYahoo.NOTIFICATION_CALLBACKS.getInterface(DcYahoo.INTERFACES.nsIDOMWindow).top.document.DcYahooCount += 1;						
					}

					subject.cancel(Components.results.NS_ERROR_ABORT);
			}
		  }}, 'http-on-modify-request', false);
	}
  }
}

/* Initialization of DcYahoo object on load */
window.addEventListener("load", function() { DcYahoo.init(); }, false);  
