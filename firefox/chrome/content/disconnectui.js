
if (typeof DisconnectUI == 'undefined') {
  var DisconnectUI = {
    
    updateBlockedCount: function(service) {
      if (document.getElementById('disconnect-panel-frame')){
        var doc = document.getElementById('disconnect-panel-frame').contentWindow.document;
        doc.getElementById(service + '-count').textContent = Disconnect.getRequestCount();
      }
    },

    updatePanel: function(service){

      if (document.getElementById('disconnect-panel-frame')){
        Disconnect.services.forEach(function(service){
          var doc, div;
          doc = document.getElementById('disconnect-panel-frame').contentWindow.document,
          div = doc.getElementById(service + '_div');
          if(div){
            if (Disconnect.isUnblocked()){
              div.setAttribute('class','service deactivated');
              doc.getElementById(service + '-img').src = 'images/' + service + '-deactivated' + '.png';
              doc.getElementById(service + '-count').textContent = '0';
              document.getElementById('disconnect-toolbar-button').image = "chrome://disconnect/content/images/unblocked.png";
            } else {
              div.setAttribute('class','service activated');
              doc.getElementById(service + '-img').src = 'images/' + service + '-activated' + '.png';
              document.getElementById('disconnect-toolbar-button').image = "chrome://disconnect/content/images/blocked.png";
            }
          }
        });
      }
    },

    removeChildren: function(container) {
        var children = container.childNodes;
        for( var i = children.length - 1; i >= 0; i-- ) {
            var node = children[i];
            container.removeChild(node);
        }
    },

    hideMenuPopup: function(c) {
        var popup = document.getElementById('disconnect-popup');

        if ( (c === 's') && (popup.state == 'showing') ) {
            DisconnectUI.clearMenuPopup();
        }
    },

    clearMenuPopup: function() {
        DisconnectUI.removeChildren(document.getElementById("disconnect-popup"));
    },

    panelFrame: null,

    displayPanel: function(e) {
        var panel = document.getElementById('disconnect-panel');
        if (!panel) {
            panel = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'panel');
            panel.setAttribute('type', 'arrow');
            panel.setAttribute('id', 'disconnect-panel');
            panel.style.border = '0px';

            let frame = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", 'iframe');
            frame.setAttribute('flex', '1');
            frame.setAttribute('transparent', 'transparent');
            frame.setAttribute('src', 'chrome://disconnect/content/popup.html'); 
            frame.setAttribute('id', 'disconnect-panel-frame');
            frame.style.border = '0px';

            panel.appendChild(frame);
            document.getElementById("mainPopupSet").appendChild(panel);

            panel.firstChild.style.height = 150 + "px";
        }

        panel.style.width = 200 + 'px';
        function waitForBinding() {
            if (!panel.openPopup) {
                setTimeout(function() { waitForBinding();}, 50);
                return;
            }

            if (!DisconnectUI.isPanelReady()){
                setTimeout(function() { waitForBinding();}, 50);
                return;
            }

            DisconnectUI.addPanelContent();
            panel.openPopup( document.getElementById('disconnect-toolbar-button') , 'before_start' , 0 , 0 , true, true, null );

            DisconnectUI.panelFrame = document.getElementById('disconnect-panel-frame').contentWindow.document;
            panel.firstChild.style.height = ( DisconnectUI.panelFrame.body.offsetHeight + 10) + "px";
            Disconnect.services.forEach(function(s){ DisconnectUI.updatePanel(s); });
        }
        waitForBinding();
    },

    isPanelReady: function(){
        var dpf = document.getElementById('disconnect-panel-frame');
        return (dpf && dpf.contentWindow && dpf.contentWindow.document && dpf.contentWindow.document.getElementById('services'));
    },

    addPanelContent: function() {
        var i,div,img,count,txt,
            doc = document.getElementById('disconnect-panel-frame').contentWindow.document,
            services_div = doc.getElementById('services');
        
        if (services_div){
            while(services_div.firstChild) {
                services_div.removeChild(services_div.firstChild);
            }

            for(i=0 ; i< Disconnect.services.length;i++){
                div =   doc.createElement('div'),
                img =   doc.createElement('img'),
                count = doc.createElement('span'),
                txt =   doc.createElement('span');

                div.id  = Disconnect.services[i] + '_div';
                div.setAttribute('class','service activated');
                img.id = Disconnect.services[i] + '-img';
                img.src = 'images/' + Disconnect.services[i] + '-activated' + '.png';
        
                count.setAttribute('id',Disconnect.services[i] + '-count');
                count.setAttribute('class','count');
                count.textContent = Disconnect.getRequestCount(Disconnect.services[i]);
            
                txt.setAttribute('class','count-text');
                txt.textContent = ' blocked';

                div.appendChild(img);
                div.appendChild(count);
                div.appendChild(txt);
                (function(service,div){
                    div.addEventListener(
                        'click', 
                        function() {
                          content.localStorage.thirdPartiesUnblocked = !Disconnect.isUnblocked();
                          DisconnectUI.updatePanel(service);
                          document.getElementById('disconnect-panel').hidePopup();
                          content.location.reload();
                        }, 
                        false
                    )
                }(Disconnect.services[i],div));

                services_div.appendChild(div);
                services_div.appendChild(document.createElement("menuseparator"));
            }
        }
    },

    onPageLoad: function(event) {
        try {
            var navbar = document.getElementById('nav-bar');
            var curSet = navbar.currentSet;

            if (curSet.indexOf('disconnect-toolbar-button') < 0) {
                curSet = curSet + ',disconnect-toolbar-button';
            }

            navbar.setAttribute('currentset', curSet);
            navbar.currentSet = curSet;
            document.persist('nav-bar', 'currentset');
        } catch(e) { }
    },
  };
}

