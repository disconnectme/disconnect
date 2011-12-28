/*
  A controller script that stops Twitter from tracking the webpages you go to.

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


if (typeof DcTwdc == "undefined") {  

  var DcTwdc = {
	  
	/* The domain names Facebook phones home with, lowercased. */
	DOMAINS : ['twimg.com', 'twitter.com'],

	/* The number of urls blocked on this page. */
	BlockCount : 0,

	/* The XPCOM interfaces. */
	INTERFACES : Components.interfaces,
	
	/* Updates the number of twitter blocks in the popup menu */
	updateCount : function(){
		if(typeof window.content.document.DcTwdcCount == "undefined"){
			window.content.document.DcTwdcCount = 0;
		}						
		DcController.jQuery("#TwitterBlockCount").attr("value",window.content.document.DcTwdcCount);	
	},	
	
	/* Lifts international trade embargo on Facebook */
	unblock: function(){
		alert("I am unblocking Twitter");
	
	},
	
	/* Enforce international trade embargo on Facebook */
	block: function(){
		alert("I am blocking Twitter");
	},	
	
	/*
	  Determines whether any of a bucket of domains is part of a URL, regex free.
	*/
	isMatching: function(url, domains) {
	  const DOMAIN_COUNT = domains.length;
	  for (var i = 0; i < DOMAIN_COUNT; i++)
		  if (url.toLowerCase().indexOf(domains[i], 2) >= 2) return true;
			  // A valid URL has at least two characters ("//"), then the domain.
	},
	
	/* Initialization */	  
    init : function() {  

		/* registers this controller in the main controller */
		DcController.controllers.push(DcTwdc);
		
		/* Traps and selectively cancels a request. */
        DcTwdc.obsService =  Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);  
		DcTwdc.obsService.addObserver({observe: function(subject) {


			DcTwdc.NOTIFICATION_CALLBACKS =
				subject.QueryInterface(DcTwdc.INTERFACES.nsIHttpChannel).notificationCallbacks
					|| subject.loadGroup.notificationCallbacks;

			DcTwdc.BROWSER =
				DcTwdc.NOTIFICATION_CALLBACKS &&
					gBrowser.getBrowserForDocument(
					  DcTwdc.NOTIFICATION_CALLBACKS
						.getInterface(DcTwdc.INTERFACES.nsIDOMWindow).top.document
					);

			subject.referrer.ref;


			// HACK: The URL read otherwise outraces the window unload.
			if(DcTwdc.BROWSER && !DcTwdc.isMatching(DcTwdc.BROWSER.currentURI.spec, DcTwdc.DOMAINS) &&
				DcTwdc.isMatching(subject.URI.spec, DcTwdc.DOMAINS)){
					
					if(typeof DcTwdc.NOTIFICATION_CALLBACKS.getInterface(DcTwdc.INTERFACES.nsIDOMWindow).top.document.DcTwdcCount == "undefined"){
						DcTwdc.NOTIFICATION_CALLBACKS.getInterface(DcTwdc.INTERFACES.nsIDOMWindow).top.document.DcTwdcCount = 1;
					}
					else{
						DcTwdc.NOTIFICATION_CALLBACKS.getInterface(DcTwdc.INTERFACES.nsIDOMWindow).top.document.DcTwdcCount += 1;						
					}
				
					subject.cancel(Components.results.NS_ERROR_ABORT);				
			}



		  }}, 'http-on-modify-request', false);

	}
  }
}

/* Initialization of Fbdc object on load */
window.addEventListener("load", function() { DcTwdc.init(); }, false);  
