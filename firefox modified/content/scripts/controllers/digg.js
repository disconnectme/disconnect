/*
  A controller script that stops Digg from tracking the webpages you go to.

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

if (typeof DcDigg == "undefined") {  

  var DcDigg = {
	  
	/*
	  Determines whether any of a bucket of domains is part of a URL, regex free.
	*/
	isMatching: function(url, domains) {
	  const DOMAIN_COUNT = domains.length;
	  for (var i = 0; i < DOMAIN_COUNT; i++)
		  if (url.toLowerCase().indexOf(domains[i], 2) >= 2) return true;
			  // A valid URL has at least two characters ("//"), then the domain.
	},

	/* Updates the number of digg blocks in the popup menu */
	updateCount : function(){
		
		if(typeof window.content.document.DcDiggCount == "undefined"){
			window.content.document.DcDiggCount = 0;
		}				
		DcController.jQuery("#DiggBlockCount").attr("value",window.content.document.DcDiggCount);		
	},	

	
	/* determine whether to block or unblock */
	switchBlock : function(){
		if(window.content.localStorage.getItem('DcDiggStatus')!="unblock"){
			DcDigg.unblock();
		}
		else{
			DcDigg.block();
		}
	},

	/* Lifts international trade embargo on Digg */
	unblock: function(){
		//alert("I am unblocking digg");
		DcController.jQuery("#DiggBlockIcon").attr("src","chrome://disconnect/content/resources/digg-deactivated.png");		
		DcController.jQuery("#DiggBlockStatus").attr("value","Unblocked");				
		window.content.localStorage.setItem('DcDiggStatus', "unblock");	
		window.content.location.reload();		
	
	},
	
	/* Enforce international trade embargo on Digg */
	block: function(){
		DcController.jQuery("#DiggBlockIcon").attr("src","chrome://disconnect/content/resources/digg-activated.png");		
		DcController.jQuery("#DiggBlockStatus").attr("value","Blocked");				
		window.content.localStorage.setItem('DcDiggStatus', "block");	
		window.content.location.reload();				

	},
	
	setDisplayIcons: function(){
		if(window.content.localStorage.getItem('DcDiggStatus')!="unblock"){

			DcController.jQuery("#DiggBlockIcon").attr("src","chrome://disconnect/content/resources/digg-activated.png");		
			DcController.jQuery("#DiggBlockStatus").attr("value","Blocked");				
		}
		else{

			DcController.jQuery("#DiggBlockIcon").attr("src","chrome://disconnect/content/resources/digg-deactivated.png");		
			DcController.jQuery("#DiggBlockStatus").attr("value","Unblocked");				
		}		
	},
	
	/* Initialization */	  
    init : function() {  

		/* registers this controller in the main controller */
		DcController.controllers.push(DcDigg);

		if(gBrowser){
			gBrowser.addEventListener("DOMContentLoaded", DcDigg.setDisplayIcons, false);  
			gBrowser.tabContainer.addEventListener("TabAttrModified", DcDigg.setDisplayIcons, false);  		
		}


	}
  }
}

/* Initialization of DcDigg object on load */
window.addEventListener("load", function() { DcDigg.init(); }, false);  
