// Define the tour!
var tour = {
  id: "disconnect-tour",
  onEnd: function(){
    localStorage.show_tour = "false";
  },
  steps: [
    {
      title: "Welcome!",
      content: "You're now protected. Learn the basics.",
      target: "#logo",
      placement: "bottom",
      width: 180,
      padding: 7,
      yOffset: 12,
      arrowOffset: 45
    },
    {
      title: "Green means blocked",
      content: "Companies and categories can't track your browsing data.",
      target: document.querySelector(".category .badge"),
      placement: "bottom",
      width: 150,
      padding: 10,
      yOffset: 90,
      arrowOffset: 5
    },
    {
      title: "Gray means unblocked",
      content: "Companies and categories can track your browsing data.",
      target: document.querySelector(".category .badge"),
      placement: "top",
      width: 150,
      padding: 10,
      yOffset: 200,
      arrowOffset: 5
    },
    {
      title: "Click to block or unblock",
      content: "Companies and tracking categories can be blocked of unblocked.",
      target: document.querySelector("#shortcuts"),
      placement: "bottom",
      width: 170,
      padding: 10,
      yOffset: -10,
      arrowOffset: 78
    },
    {
      title: "Content tracking unblocked",
      content: "Blocking certain tracking requests can break a webpage, so we unblock this by default.",
      target: document.querySelector(".category .badge"),
      placement: "top",
      width: 150,
      padding: 10,
      yOffset: 207,
      arrowOffset: 5
    },
    {
      title: "Whitelist site",
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
var tour_pwyw = {
  id: "disconnect-tour-pwyw",
  onEnd: function(){
    localStorage.show_tour = "false";
  },
  steps: [
    {
      title: "Welcome!",
      content: "You're now protected. Learn the basics.",
      target: "#logo",
      placement: "bottom",
      width: 180,
      padding: 7,
      yOffset: 12,
      arrowOffset: 45
    },
    {
      title: "Green means blocked",
      content: "Companies and categories can't track your browsing data.",
      target: document.querySelector(".category .badge"),
      placement: "bottom",
      width: 150,
      padding: 10,
      yOffset: 90,
      arrowOffset: 5
    },
    {
      title: "Gray means unblocked",
      content: "Companies and categories can track your browsing data.",
      target: document.querySelector(".category .badge"),
      placement: "top",
      width: 150,
      padding: 10,
      yOffset: 200,
      arrowOffset: 5
    },
    {
      title: "Click to block or unblock",
      content: "Companies and tracking categories can be blocked of unblocked.",
      target: document.querySelector("#shortcuts"),
      placement: "bottom",
      width: 170,
      padding: 10,
      yOffset: -10,
      arrowOffset: 78
    },
    {
      title: "Content tracking unblocked",
      content: "Blocking certain tracking requests can break a webpage, so we unblock this by default.",
      target: document.querySelector(".category .badge"),
      placement: "top",
      width: 150,
      padding: 10,
      yOffset: 207,
      arrowOffset: 5
    },
    {
      title: "Whitelist site",
      content: "If a website you like visiting isn't working properly try hitting Whitelist Site, which pauses blocking on that site",
      target: document.querySelector("#options"),
      placement: "top",
      width: 150,
      padding: 10,
      yOffset: 15,
      arrowOffset: 38
    },
    {
      title: "Support us",
      content: "We rely solely on your contributions, please pay what you want.",
      target: "#support",
      placement: "top",
      width: 187,
      padding: 7,
      yOffset: 15,
      arrowOffset: 88
    }
  ]
};



var has_paid = JSON.parse(localStorage.pwyw).bucket,
    selected_tour = has_paid != "paid-paypal" ? tour_pwyw : tour;

if(localStorage.show_tour == undefined) {
  localStorage.show_tour = "true";
}

if(JSON.parse(localStorage.show_tour)) {
  hopscotch.startTour(selected_tour);
}