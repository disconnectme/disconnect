/*
  An XPcom component that stops Google from tracking the webpages you go to.

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

    Gary Teh <garyjob@gmail.com>	
*/


const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

/**
 * Application startup/shutdown observer, triggers init()/shutdown() methods in Bootstrap.jsm module.
 * @constructor
 */
function DcGgdcContentPolicy() {
	//allows access of native methods by scripts in content area
	this.wrappedJSObject = this;  	
}

DcGgdcContentPolicy.prototype =
{
	classDescription: "This is an image blocker",
	contractID: "@disconnect.me/dcggdc/contentpolicy;1",
	classID: Components.ID("{d32a3c00-4ed3-11de-8a39-0800200c9a75}"),
	
	_xpcom_categories:  [{ category: "content-policy"}],

	QueryInterface:     XPCOMUtils.generateQI([Ci.nsIContentPolicy]),

	/* The domain names Facebook phones home with, lowercased. */
	DOMAINS :   [
				  '2mdn.net',
				  'accounts.google.com',
				  'blogger.com',
				  'books.google.com',
				  'code.google.com',
				  'docs.google.com',
				  'doubleclick.net',
				  'earth.google.com',
				  'feedburner.com',
				  'gmodules.com',
				  'google-analytics.com',
				  'google.com/alerts',
				  'google.com/blogsearch',
				  'google.com/bookmarks',
				  'google.com/calendar',
				  'google.com/chrome',
				  'google.com/coop',
				  'google.com/cse',
				  'google.com/finance',
				  'google.com/fusiontables',
				  'google.com/health',
				  'google.com/ig',
				  'google.com/imghp',
				  'google.com/intl',
				  'google.com/latitude',
				  'google.com/mobile',
				  'google.com/offers',
				  'google.com/patents',
				  'google.com/prdhp',
				  'google.com/products',
				  'google.com/reader',
				  'google.com/schhp',
				  'google.com/shopping',
				  'google.com/talk',
				  'google.com/trends',
				  'google.com/videohp',
				  'google.com/voice',
				  'google.com/wallet',
				  'google.com/webhp',
				  'googleadservices.com',
				  'googlesyndication.com',
				  'groups.google.com',
				  'health.google.com',
				  'images.google.com',
				  'knol.google.com',
				  'latitude.google.com',
				  'mail.google.com',
				  'music.google.com',
				  'news.google.com',
				  'orkut.com',
				  'panoramio.com',
				  'picasa.google.com',
				  'picasaweb.google.com',
				  'picnik.com',
				  'plus.google.com',
				  'scholar.google.com',
				  'sites.google.com',
				  'sketchup.google.com',
				  'toolbar.google.com',
				  'translate.google.com',
				  'video.google.com',
				  'voice.google.com',
				  'youtube.com'			   
			   ],
	
	rejectedLoc : "",
	
	displayer : false,
	
	/* sets the display function */
	setDisplayer : function(aFunc){
		this.displayer = aFunc;
	},		
	
	// define the function we want to expose in our interface  
	showStatus: function() {  
		//return "Hello World!";  
		return this.rejectedLoc ;
	},  	
	
	/* Determines whether any of a bucket of domains is part of a URL, regex free. */
	isMatching: function(url, domains) {
		url = "   "+url;
	  const DOMAIN_COUNT = domains.length;
	  for (var i = 0; i < DOMAIN_COUNT; i++){
		  if (url.toLowerCase().indexOf(domains[i], 2) >= 2) return true;
			  // A valid URL has at least two characters ("//"), then the domain.	  
	  }
	},
	
	/* A function of the nsIContentPolicy interface : called when an element is to be loaded from the internet */
	shouldLoad: function (contType, contLoc, reqOrig, aContext, typeGuess, extra) {
		
		try{
			if(reqOrig != null ){
				reqOrig.host;
			}
		}
		catch(anError){
			return Ci.nsIContentPolicy.ACCEPT;			
		}

		try{
			if(contLoc != null ){
				contLoc.host;
			}
		}
		catch(anError){
			return Ci.nsIContentPolicy.ACCEPT;			
		}
		
		
		if(reqOrig != null && reqOrig.host!="browser" && contLoc.host!="browser" && contLoc.host!="global" && contType!=6){
			//this.rejectedLoc += "checking > "+contLoc.host+" : "+reqOrig.host+" -- results: "+this.isMatching(contLoc.host, this.DOMAINS)+"\r\n";				
			if( reqOrig.host !=contLoc.host && !this.isMatching(reqOrig.host, this.DOMAINS) && this.isMatching(contLoc.host, this.DOMAINS) && typeof aContext.ownerDocument != null){
				this.rejectedLoc += "rejected > "+contLoc.host+" : "+reqOrig.host+"\r\n";				
				try{
					if(this.displayer){
						this.displayer(1);
					}					
					
					if(typeof aContext.ownerDocument.DcGgdcCount == "undefined"){
						aContext.ownerDocument.DcGgdcCount = 1;
					}
					else{
						aContext.ownerDocument.DcGgdcCount += 1;						
					}					
					
					var finalBlocking = aContext.ownerDocument.defaultView.content.localStorage.getItem('DcGgdcStatus');
					if(finalBlocking == "unblock"){
						return Ci.nsIContentPolicy.ACCEPT;						
					}

				}
				catch(anError){
					this.rejectedLoc += anError+"\r\n";
					
				}
				return Ci.nsIContentPolicy.REJECT;				
			}
		}

		return Ci.nsIContentPolicy.ACCEPT;
	},

	/* A function of the nsIContentPolicy interface : called when an element is to be loaded from the internet */
    shouldProcess: function (contType, contLoc, reqOrig, ctx, mimeType, extra) {
       return Ci.nsIContentPolicy.ACCEPT;
    }
	

	
};

if (XPCOMUtils.generateNSGetFactory)
	var NSGetFactory = XPCOMUtils.generateNSGetFactory([DcGgdcContentPolicy]);
else
	var NSGetModule = XPCOMUtils.generateNSGetModule([DcGgdcContentPolicy]);
