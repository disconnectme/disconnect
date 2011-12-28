/*
  A controller script that stops Networks of registered controllers from tracking the webpages you go to.

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

if (typeof DcController == "undefined") {  

  var DcController = {
	  
	/* List of controllers */
	controllers : [],
	  
    /* The inclusion of the jQuery library*/
    jQuery : jQuery.noConflict(),	  
	
	/* This function puts the block count of the various channels in the page*/
	putCountInPage : function(key, valueAdd, doc){
		if(DcController.jQuery("#"+key, doc).length){
			currVal = 1 * DcController.jQuery("#"+key, doc).html();					
			DcController.jQuery("#"+key, doc).html( valueAdd + currVal );									
		}
		else{

			var ele = doc.createElement("div")
			DcController.jQuery(ele).attr("id", key);
			DcController.jQuery(ele).html(valueAdd);			
			DcController.jQuery("body", doc).append(ele );
		}

	},

	/* Updates the number of blocks in the popup menu for all registered controllers */	
	updateCount : function(){
		DcController.jQuery.each(DcController.controllers, function(index, currController){
			currController.updateCount();
		})
		
	},
	
	/* Initialization */	  
    init : function() {  
		DcController.jQuery("#TwitterBlockCount").attr("value", DcTwdc.BlockCount)		
	}
  }
}	  