/*******************************************************************************************************************

	Consolidated here are a list of functions that helps clarify the architecture of the Firefox Browser.
	Each function shows you what works, how implementation is supposed to be done for it to work
	
*******************************************************************************************************************/

if (typeof DcSandbox == "undefined") {  

  var DcSandbox = {
		/*
			This is the function called when our test button in the tool bars panel is clicked
		*/
		hello: function(){
			showMenuPopup();
		},
		
		
		/*
			This function adds a new image element when the Tool bar button by the ID of disconnect-toolbarbutton is clicked
		*/
		showMenuPopup: function(){
			var menuPopup = document.getElementById("clipmenu");
			alert(menuPopup.state);
			menu.Popup.openPopup();
		},
		
		
		/*
			This function adds a new image element when the Tool bar button by the ID of disconnect-toolbarbutton is clicked
		*/
		toolbarAddNew : function(){
			var item = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "image"); 
			DcController.jQuery(item).attr("src", "chrome://disconnect/content/resources/64.png");
			DcController.jQuery("#disconnect-toolbarbutton").append(item);
			
		},
		
		
		/*
			This function tries to access the DOM element in the Tool bar by the ID disconnect-image 
			and shows the src
		*/
		accessToolbarElement: function(){
			alert(DcController.jQuery("image").length);	
			alert(DcController.jQuery("#disconnect-image").length);		
			alert(DcController.jQuery("#disconnect-image").attr("src"));			
		},
		
		
		/*
			This function tries to access the DOM element in the Tool bar by the ID disconnect-image 
			and dynamically changes it
		*/
		changeToolbarElement : function(){
			alert(DcController.jQuery("#disconnect-image").attr("src"));
			DcController.jQuery("#disconnect-image").attr("class", "hating");	
		},
		
		
		/*
			This function demonstrates that so long as another script is loaded 
			this script could freely access functions or variables in that script
			
			Function taskOne is located in controller.js
		*/
		
		somewhere : function(){
			taskOne();	
		},
		
		
		/*
			This function shows you how to get the title of the page
		*/
		getCurrPageTitle: function(){
			//This object becomes available once the page is loaded
			var doc = window.content.document;
			alert(doc.title);	
		},
		
		
		/*
			This function shows you how to the jQuery is used to access elements in a page by ID
			in the below scenario, jQuery is used to access an element with id thisIsMyHref in the document
		*/
		accessPageElement : function(){
			var doc = window.content.document;
			alert(DcController.jQuery("#thisIsMyHref", doc).attr("href"));
		},
		
		
		/*
			This function shows you how to the jQuery is used to access elements in a page by ID
			in the below scenario, jQuery is used to count the number of hyperlinks in a page that was loaded
		*/
		countPageElement: function(){
			var doc = window.content.document;
			alert(DcController.jQuery("a", doc).length);
		},
		
		
		/*
			Returns all attributes in any javascript Object in a string
		*/
		getAllAttrInObj: function(obj){
			status = "";	
			status += "<p>";
			DcController.jQuery.each(obj , function(name, value) {
				status += name + ": " + value+"<br>";
			});	
			status += "</p>";	
			return status;
		},
		
		
		/*
			Event is triggered when the state of a Tab is changed
		*/
		//gBrowser.tabContainer.addEventListener("TabAttrModified", exampleTabAttrModified, false);  
		exampleTabAttrModified: function (event) {  
			var tab = event.target;  
			var doc = getDocOfTab(tab);
		},
		
		
		/*
			Event is triggered when a html document is loaded
		*/
		//gBrowser.addEventListener("DOMContentLoaded", exampleDomLoaded, false);  
		exampleDomLoaded: function(event){
			var doc = event.originalTarget;	
			//alert(doc.title);
			//accessPageElement();
		},
		
		
		//Removing list of listeners from Browser
		//gBrowser.tabContainer.removeEventListener("TabAttrModified", exampleTabAttrModified, false);  
		
		
		/*
			Returns the context for use in jQuery
		*/
		getDocOfTab: function(tab){
			var linkedBrowser = tab.linkedBrowser;
			var currentWindow = linkedBrowser._contentWindow;
			return currentWindow.content.document;
		}

  }
}