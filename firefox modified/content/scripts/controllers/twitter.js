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
	
	/* Updates the number of twitter blocks in the popup menu */
	updateCount : function(){
		if(typeof window.content.document.DcTwdcCount == "undefined"){
			window.content.document.DcTwdcCount = 0;
		}						
		DcController.jQuery("#TwitterBlockCount").attr("value",window.content.document.DcTwdcCount);	
	},	
	
	
	/* determine whether to block or unblock */
	switchBlock : function(){
		if(window.content.localStorage.getItem('DcTwdcStatus')!="unblock"){
			DcTwdc.unblock();
		}
		else{
			DcTwdc.block();
		}
	},

	/* Lifts international trade embargo on Twitter */
	unblock: function(){
		//alert("I am unblocking twitter");
		DcController.jQuery("#TwitterBlockIcon").attr("src","chrome://disconnect/content/resources/twitter-deactivated.png");		
		DcController.jQuery("#TwitterBlockStatus").attr("value","Unblocked");				
		window.content.localStorage.setItem('DcTwdcStatus', "unblock");	
		window.content.location.reload();		
	
	},
	
	/* Enforce international trade embargo on Twitter */
	block: function(){
		DcController.jQuery("#TwitterBlockIcon").attr("src","chrome://disconnect/content/resources/twitter-activated.png");		
		DcController.jQuery("#TwitterBlockStatus").attr("value","Blocked");				
		window.content.localStorage.setItem('DcTwdcStatus', "block");	
		window.content.location.reload();				

	},
	
	setDisplayIcons: function(){
		if(window.content.localStorage.getItem('DcTwdcStatus')!="unblock"){

			DcController.jQuery("#TwitterBlockIcon").attr("src","chrome://disconnect/content/resources/twitter-activated.png");		
			DcController.jQuery("#TwitterBlockStatus").attr("value","Blocked");				
		}
		else{

			DcController.jQuery("#TwitterBlockIcon").attr("src","chrome://disconnect/content/resources/twitter-deactivated.png");		
			DcController.jQuery("#TwitterBlockStatus").attr("value","Unblocked");				
		}		
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
		
		if(gBrowser){
			gBrowser.addEventListener("DOMContentLoaded", DcTwdc.setDisplayIcons, false);  
			gBrowser.tabContainer.addEventListener("TabAttrModified", DcTwdc.setDisplayIcons, false);  		
		}
				
	}
  }
}

/* Initialization of Fbdc object on load */
window.addEventListener("load", function() { DcTwdc.init(); }, false);  
