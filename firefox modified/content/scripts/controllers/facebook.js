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
	
	/* determine whether to block or unblock */
	switchBlock : function(){
		if(window.content.localStorage.getItem('DcFbdcStatus')!="unblock"){
			DcFbdc.unblock();
		}
		else{
			DcFbdc.block();
		}
	},

	/* Lifts international trade embargo on Facebook */
	unblock: function(){
		//alert("I am unblocking facebook");
		DcController.jQuery("#FacebookBlockIcon").attr("src","chrome://disconnect/content/resources/facebook-deactivated.png");		
		DcController.jQuery("#FacebookBlockStatus").attr("value","Unblocked");				
		window.content.localStorage.setItem('DcFbdcStatus', "unblock");	
		window.content.location.reload();		
	
	},
	
	/* Enforce international trade embargo on Facebook */
	block: function(){
		DcController.jQuery("#FacebookBlockIcon").attr("src","chrome://disconnect/content/resources/facebook-activated.png");		
		DcController.jQuery("#FacebookBlockStatus").attr("value","Blocked");				
		window.content.localStorage.setItem('DcFbdcStatus', "block");	
		window.content.location.reload();				

	},
	
	setDisplayIcons: function(){
		if(window.content.localStorage.getItem('DcFbdcStatus')!="unblock"){

			DcController.jQuery("#FacebookBlockIcon").attr("src","chrome://disconnect/content/resources/facebook-activated.png");		
			DcController.jQuery("#FacebookBlockStatus").attr("value","Blocked");				
		}
		else{

			DcController.jQuery("#FacebookBlockIcon").attr("src","chrome://disconnect/content/resources/facebook-deactivated.png");		
			DcController.jQuery("#FacebookBlockStatus").attr("value","Unblocked");				
		}		
	},
	  
	/* Initialization */	  
    init : function() {  

		/* registers this controller in the main controller */
		DcController.controllers.push(DcFbdc);
		
		if(gBrowser){
			gBrowser.addEventListener("DOMContentLoaded", DcFbdc.setDisplayIcons, false);  
			gBrowser.tabContainer.addEventListener("TabAttrModified", DcFbdc.setDisplayIcons, false);  		
		}


	}
  }
}

/* Initialization of DcFbdc object on load */
window.addEventListener("load", function() { DcFbdc.init(); }, false);  
