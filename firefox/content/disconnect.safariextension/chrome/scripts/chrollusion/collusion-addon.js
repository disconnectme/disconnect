var CollusionAddon = (function() {
  var self = {
    isInstalled: function() {
      return ('onGraph' in window);
    },
    onGraph: window.onGraph,
    resetGraph: window.resetGraph
  };
  
  return self;
})();
