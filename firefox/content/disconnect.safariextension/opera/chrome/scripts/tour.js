// Define the tour!
var tour = {
  id: "disconnect-tour",
  onEnd: function(){
    localStorage.show_tour = "false";
  },
  steps: [
    {
      title: "Welcome!",
      content: "This small tour will teach you the basics on how to use the extension",
      target: "#logo",
      placement: "bottom",
      width: 180,
      padding: 7,
      yOffset: 12,
      arrowOffset: 45
    },
    {
      title: "Blocking from tracking",
      content: "Green means you are blocking that company or category from tracking your browsing data",
      target: document.querySelector(".category .badge"),
      placement: "bottom",
      width: 150,
      padding: 10,
      yOffset: 90,
      arrowOffset: 5
    },
    {
      title: "Tracking allowed",
      content: "Gray means that company or category can track your browsing data.",
      target: document.querySelector(".category .badge"),
      placement: "top",
      width: 150,
      padding: 10,
      yOffset: 200,
      arrowOffset: 5
    },
    {
      title: "Default tracking",
      content: "Blocking certain tracking requests can break a webpage, so we unblock many of those requests by default",
      target: document.querySelector(".category .badge"),
      placement: "top",
      width: 150,
      padding: 10,
      yOffset: 207,
      arrowOffset: 5
    },
    {
      title: "Company tracking control",
      content: "Click on a company to block and unblock tracking",
      target: document.querySelector("#shortcuts"),
      placement: "bottom",
      width: 170,
      padding: 10,
      yOffset: -10,
      arrowOffset: 78
    },
    {
      title: "Category tracking control",
      content: "Click on a category to block and unblock tracking",
      target: document.querySelector(".category .badge"),
      placement: "bottom",
      width: 150,
      padding: 10,
      yOffset: 125,
      arrowOffset: 5
    },
    {
      title: "Whitelist",
      content: "If a website you like visiting isn't working properly try hitting Whitelist Site, which pauses blocking on that site",
      target: document.querySelector("#options"),
      placement: "top",
      width: 150,
      padding: 10,
      yOffset: 15,
      arrowOffset: 38
    }
  ]
};

// Start the tour!

if(localStorage.show_tour == undefined) {
  localStorage.show_tour = "true";
}

if(JSON.parse(localStorage.show_tour)) {
  hopscotch.startTour(tour);
}