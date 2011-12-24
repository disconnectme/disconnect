/*
	Consolidated here are a list of functions that helps clarify the architecture of the Firefox Browser.
	Each function shows you what works, how implementation is supposed to be done for it to work
*/

/*
	This is the function called when our test button in the tool bars panel is clicked
*/
function hello(){

	countPageElement();
}

/*
	This function demonstrates that so long as another script is loaded 
	this script could freely access functions or variables in that script
	
	Function taskOne is located in controller.js
*/

function somewhere(){
	taskOne();	
}


/*
	This function shows you how to get the title of the page
*/
function getCurrDocTitle(){
	//This object becomes available once the page is loaded
	var doc = window.content.document;
	alert(doc.title);	
}

/*
	This function shows you how to the jQuery is used to access elements in a page by ID
	in the below scenario, jQuery is used to access an element with id thisIsMyHref in the document
*/
function accessPageElement(){
	var doc = window.content.document;
	alert($mb("#thisIsMyHref", doc).attr("href"));
}

/*
	This function shows you how to the jQuery is used to access elements in a page by ID
	in the below scenario, jQuery is used to count the number of hyperlinks in a page that was loaded
*/
function countPageElement(){
	var doc = window.content.document;
	alert($mb("a", doc).length);
}

