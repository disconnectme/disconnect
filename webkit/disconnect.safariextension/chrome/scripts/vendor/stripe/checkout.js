(function() {

  this.StripeCheckout = {};

  StripeCheckout.load = function() {
    var _ref;
    return (_ref = StripeCheckout.App).load.apply(_ref, arguments);
  };

  StripeCheckout.open = function() {
    var _ref;
    return (_ref = StripeCheckout.App).open.apply(_ref, arguments);
  };

  StripeCheckout.setHost = function() {
    var _ref;
    return (_ref = StripeCheckout.App).setHost.apply(_ref, arguments);
  };

  this.StripeButton = StripeCheckout;

}).call(this);
// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
(function() {
  var cacheBust, interval, lastHash, postMessage, re, receiveMessage;

  cacheBust = 1;

  interval = null;

  lastHash = null;

  re = /^#?\d+&/;

  postMessage = function(target, targetURL, message, targetOrigin) {
    if (targetOrigin == null) {
      targetOrigin = targetURL;
    }
    message = (+(new Date)) + (cacheBust++) + '&' + message;
    return target.location = targetURL.replace(/#.*$/, '') + '#' + message;
  };

  receiveMessage = function(callback, delay) {
    if (delay == null) {
      delay = 100;
    }
    interval && clearInterval(interval);
    return interval = setInterval(function() {
      var hash;
      hash = window.location.hash;
      if (hash !== lastHash && re.test(hash)) {
        window.location.hash = '';
        lastHash = hash;
        return callback({
          data: hash.replace(re, '')
        });
      }
    }, delay);
  };

  StripeCheckout.message = {
    postMessage: postMessage,
    receiveMessage: receiveMessage
  };

}).call(this);
(function() {
  var $, $$, addClass, append, attr, bind, css, escape, except, hasAttr, hasClass, host, insertAfter, insertBefore, parents, remove, resolve, text, trigger, unbind,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  $ = function(sel) {
    return document.querySelectorAll(sel);
  };

  $$ = function(cls) {
    var el, reg, _i, _len, _ref, _results;
    if (typeof document.getElementsByClassName === 'function') {
      return document.getElementsByClassName(cls);
    } else if (typeof document.querySelectorAll === 'function') {
      return document.querySelectorAll("." + cls);
    } else {
      reg = new RegExp("(^|\\s)" + cls + "(\\s|$)");
      _ref = document.getElementsByTagName('*');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        if (reg.test(el.className)) {
          _results.push(el);
        }
      }
      return _results;
    }
  };

  attr = function(element, attr, value) {
    if (value != null) {
      return element.setAttribute(attr, value);
    } else {
      return element.getAttribute(attr);
    }
  };

  hasAttr = function(element, attr) {
    var node;
    if (typeof element.hasAttribute === 'function') {
      return element.hasAttribute(attr);
    } else {
      node = element.getAttributeNode(attr);
      return !!(node && (node.specified || node.nodeValue));
    }
  };

  bind = function(element, name, callback) {
    if (element.addEventListener) {
      return element.addEventListener(name, callback, false);
    } else {
      return element.attachEvent("on" + name, callback);
    }
  };

  unbind = function(element, name, callback) {
    if (element.removeEventListener) {
      return element.removeEventListener(name, callback, false);
    } else {
      return element.detachEvent("on" + name, callback);
    }
  };

  trigger = function(element, name, data, bubble) {
    if (data == null) {
      data = {};
    }
    if (bubble == null) {
      bubble = true;
    }
    if (window.jQuery) {
      return jQuery(element).trigger(name, data);
    }
  };

  addClass = function(element, name) {
    return element.className += ' ' + name;
  };

  hasClass = function(element, name) {
    return __indexOf.call(element.className.split(' '), name) >= 0;
  };

  css = function(element, css) {
    return element.style.cssText += ';' + css;
  };

  insertBefore = function(element, child) {
    return element.parentNode.insertBefore(child, element);
  };

  insertAfter = function(element, child) {
    return element.parentNode.insertBefore(child, element.nextSibling);
  };

  append = function(element, child) {
    return element.appendChild(child);
  };

  remove = function(element) {
    var _ref;
    return (_ref = element.parentNode) != null ? _ref.removeChild(element) : void 0;
  };

  parents = function(node) {
    var ancestors;
    ancestors = [];
    while ((node = node.parentNode) && node !== document && __indexOf.call(ancestors, node) < 0) {
      ancestors.push(node);
    }
    return ancestors;
  };

  host = function(url) {
    var parent, parser;
    parent = document.createElement('div');
    parent.innerHTML = "<a href=\"" + (escape(url)) + "\">x</a>";
    parser = parent.firstChild;
    return "" + parser.protocol + "//" + parser.host;
  };

  resolve = function(url) {
    var parser;
    parser = document.createElement('a');
    parser.href = url;
    return "" + parser.href;
  };

  escape = function(value) {
    return value && ('' + value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  text = function(element, value) {
    if ('innerText' in element) {
      element.innerText = value;
    } else {
      element.textContent = value;
    }
    return value;
  };

  except = function() {
    var k, keys, object, result, v;
    object = arguments[0], keys = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    result = {};
    for (k in object) {
      v = object[k];
      if (__indexOf.call(keys, k) < 0) {
        result[k] = v;
      }
    }
    return result;
  };

  StripeCheckout.Utils = {
    $: $,
    $$: $$,
    attr: attr,
    hasAttr: hasAttr,
    bind: bind,
    unbind: unbind,
    trigger: trigger,
    addClass: addClass,
    hasClass: hasClass,
    css: css,
    insertBefore: insertBefore,
    insertAfter: insertAfter,
    append: append,
    remove: remove,
    parents: parents,
    host: host,
    resolve: resolve,
    escape: escape,
    text: text,
    except: except
  };

}).call(this);
(function() {
  var host,
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  host = StripeCheckout.Utils.host;

  StripeCheckout.RPC = {
    whitelist: ['frameReady', 'frameCallback'],
    getTarget: function() {
      throw new Error('override getTarget');
    },
    getHost: function() {
      throw new Error('override getHost');
    },
    rpcID: 0,
    invoke: function() {
      var args, frame, id, message, method;
      frame = arguments[0], method = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      id = ++this.rpcID;
      if (typeof args[args.length - 1] === 'function') {
        this.callbacks || (this.callbacks = {});
        this.callbacks[id] = args.pop();
      }
      message = JSON.stringify({
        method: method,
        args: args,
        id: id
      });
      return frame.postMessage(message, this.getHost());
    },
    invokeTarget: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.invoke.apply(this, [this.getTarget()].concat(__slice.call(args)));
    },
    message: function(e) {
      var data, result, _name, _ref;
      if (host(e.origin) !== host(this.getHost())) {
        return;
      }
      if (!e.source || e.source !== this.getTarget()) {
        return;
      }
      data = JSON.parse(e.data);
      if (_ref = data.method, __indexOf.call(this.whitelist, _ref) < 0) {
        throw new Error("Method not allowed: " + data.method);
      }
      result = typeof this[_name = data.method] === "function" ? this[_name].apply(this, __slice.call(data.args).concat([e])) : void 0;
      if (data.method !== 'frameCallback') {
        return this.invoke(e.source, 'frameCallback', data.id, result);
      }
    },
    ready: function(fn) {
      var callbacks, cb, _i, _len, _results;
      this.readyQueue || (this.readyQueue = []);
      this.readyStatus || (this.readyStatus = false);
      if (typeof fn === 'function') {
        if (this.readyStatus) {
          return fn();
        } else {
          return this.readyQueue.push(fn);
        }
      } else {
        this.readyStatus = true;
        callbacks = this.readyQueue.slice(0);
        _results = [];
        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
          cb = callbacks[_i];
          _results.push(cb());
        }
        return _results;
      }
    },
    frameCallback: function(id, result) {
      var _base;
      if (!this.callbacks) {
        return;
      }
      if (typeof (_base = this.callbacks)[id] === "function") {
        _base[id](result);
      }
      delete this.callbacks[id];
      return true;
    },
    frameReady: function() {
      this.ready();
      return true;
    }
  };

}).call(this);
(function() {
  var $, $$, append, bind, css, host, remove, resolve, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = StripeCheckout.Utils, $ = _ref.$, $$ = _ref.$$, bind = _ref.bind, css = _ref.css, append = _ref.append, remove = _ref.remove, host = _ref.host, resolve = _ref.resolve;

  StripeCheckout.App = (function() {

    App.load = function(options) {
      return App.instance || (App.instance = new App(options));
    };

    App.open = function(options) {
      App.instance || (App.instance = new App);
      App.instance.open(options);
      return App.instance;
    };

    App.setHost = function(host) {
      return App.prototype.defaults.host = host;
    };

    App.prototype.defaults = {
      path: '/',
      fallbackPath: '/fallback.html',
      host: 'https://checkout.stripe.com',
      address: false,
      amount: null,
      name: null,
      description: null,
      image: null,
      label: null,
      panelLabel: null,
      currency: 'usd',
      notrack: false
    };

    function App(options) {
      var _base;
      if (options == null) {
        options = {};
      }
      this.close = __bind(this.close, this);

      this.open = __bind(this.open, this);

      this.setOptions(options);
      if (StripeCheckout.App.Fallback.isEnabled()) {
        this.view = new StripeCheckout.App.Fallback(this.options);
      } else if (StripeCheckout.App.Mobile.isEnabled()) {
        this.view = new StripeCheckout.App.Mobile(this.options);
      } else {
        this.view = new StripeCheckout.App.Overlay(this.options);
      }
      if (typeof (_base = this.view).render === "function") {
        _base.render();
      }
    }

    App.prototype.open = function(options) {
      var _base;
      if (options == null) {
        options = {};
      }
      this.setOptions(options);
      return typeof (_base = this.view).open === "function" ? _base.open() : void 0;
    };

    App.prototype.close = function() {
      return this.view.close();
    };

    App.prototype.setOptions = function(options) {
      var key, value, _base, _ref1, _ref2, _ref3;
      if (options == null) {
        options = {};
      }
      this.options || (this.options = {});
      _ref1 = this.defaults;
      for (key in _ref1) {
        value = _ref1[key];
        if ((_ref2 = options[key]) == null) {
          options[key] = value;
        }
      }
      for (key in options) {
        value = options[key];
        this.options[key] = value;
      }
      if (this.options.image) {
        this.options.image = resolve(this.options.image);
      }
      if ((_ref3 = (_base = this.options).body) == null) {
        _base.body = document.body;
      }
      this.options.url = document.URL;
      return this.options.referrer = document.referrer;
    };

    return App;

  }).call(this);

}).call(this);
(function() {
  var except,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  except = StripeCheckout.Utils.except;

  StripeCheckout.App.Fallback = (function() {

    Fallback.isEnabled = function() {
      return !('postMessage' in window);
    };

    function Fallback(options) {
      this.options = options != null ? options : {};
      this.setToken = __bind(this.setToken, this);

    }

    Fallback.prototype.open = function() {
      var message, options, url,
        _this = this;
      url = this.options.host + this.options.fallbackPath;
      options = except(this.options, 'body', 'script', 'document', 'token');
      message = JSON.stringify(options);
      this.frame = window.open(url, '_blank', 'width=400,height=400,location=yes,resizable=yes,scrollbars=yes');
      StripeCheckout.message.postMessage(this.frame, url, message);
      return StripeCheckout.message.receiveMessage(function(e) {
        return _this.setToken(JSON.parse(e.data));
      });
    };

    Fallback.prototype.close = function() {
      return this.frame.close();
    };

    Fallback.prototype.setToken = function(token) {
      var _base;
      if (typeof (_base = this.options).token === "function") {
        _base.token(token);
      }
      this.close();
      return true;
    };

    return Fallback;

  })();

}).call(this);
(function() {
  var $, $$, append, bind, css, except, host, remove, resolve, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  _ref = StripeCheckout.Utils, $ = _ref.$, $$ = _ref.$$, bind = _ref.bind, css = _ref.css, append = _ref.append, remove = _ref.remove, host = _ref.host, resolve = _ref.resolve, except = _ref.except;

  StripeCheckout.App.Mobile = (function() {

    Mobile.include = function(module) {
      var key, value, _results;
      _results = [];
      for (key in module) {
        value = module[key];
        _results.push(this.prototype[key] = value);
      }
      return _results;
    };

    Mobile.include(StripeCheckout.RPC);

    Mobile.isEnabled = function() {
      return Mobile.isDebugEnabled() || Mobile.isMobileEnv();
    };

    Mobile.isMobileEnv = function() {
      var ua;
      ua = window.navigator.userAgent;
      return /(Android|iPhone|iPad|CriOS)/i.test(ua);
    };

    Mobile.isDebugEnabled = function() {
      return window.location.hash === '#_stripeMobile';
    };

    function Mobile(options) {
      var _this = this;
      this.options = options != null ? options : {};
      this.setToken = __bind(this.setToken, this);

      bind(window, 'message', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.message.apply(_this, args);
      });
    }

    Mobile.prototype.open = function() {
      var _base,
        _this = this;
      this.readyStatus = false;
      this.ready(function() {
        var options;
        options = except(_this.options, 'body', 'script', 'document', 'token');
        return _this.invokeTarget('render', 'mobile', options);
      });
      this.frame = window.open(this.options.host + this.options.path);
      if (!this.frame) {
        return alert('Please disable your popup blocker.');
      } else {
        return typeof (_base = this.options).opened === "function" ? _base.opened() : void 0;
      }
    };

    Mobile.prototype.close = function() {
      return window.focus();
    };

    Mobile.prototype.getTarget = function() {
      return this.frame;
    };

    Mobile.prototype.getHost = function() {
      return this.options.host;
    };

    Mobile.prototype.whitelist = ['frameReady', 'frameCallback', 'setToken'];

    Mobile.prototype.setToken = function(token) {
      var _base;
      if (typeof (_base = this.options).token === "function") {
        _base.token(token);
      }
      this.close();
      return true;
    };

    return Mobile;

  }).call(this);

}).call(this);
(function() {
  var $, $$, append, bind, css, except, host, remove, resolve, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  _ref = StripeCheckout.Utils, $ = _ref.$, $$ = _ref.$$, bind = _ref.bind, css = _ref.css, append = _ref.append, remove = _ref.remove, host = _ref.host, resolve = _ref.resolve, except = _ref.except;

  StripeCheckout.App.Overlay = (function() {

    Overlay.include = function(module) {
      var key, value, _results;
      _results = [];
      for (key in module) {
        value = module[key];
        _results.push(this.prototype[key] = value);
      }
      return _results;
    };

    Overlay.include(StripeCheckout.RPC);

    Overlay.prototype.iframeCSS = 'background: transparent;\nborder: 0px none transparent;\noverflow: hidden;\nvisibility: hidden;\nmargin: 0;\npadding: 0;\n-webkit-tap-highlight-color: transparent;\n-webkit-touch-callout: none;';

    Overlay.prototype.css = 'position: fixed;\nleft: 0;\ntop: 0;\nwidth: 100%;\nheight: 100%;\nz-index: 9999;\ndisplay: none;';

    function Overlay(options) {
      var _this = this;
      this.options = options != null ? options : {};
      this.toggleTabIndex = __bind(this.toggleTabIndex, this);

      this.renderFrame = __bind(this.renderFrame, this);

      this.closed = __bind(this.closed, this);

      this.setToken = __bind(this.setToken, this);

      this.overlayClosed = __bind(this.overlayClosed, this);

      this.getHost = __bind(this.getHost, this);

      this.getTarget = __bind(this.getTarget, this);

      this.close = __bind(this.close, this);

      this.open = __bind(this.open, this);

      this.render = __bind(this.render, this);

      bind(window, 'message', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.message.apply(_this, args);
      });
    }

    Overlay.prototype.render = function() {
      if (this.frame) {
        remove(this.frame);
      }
      this.frame = this.renderFrame();
      this.frame.className = 'stripe-app';
      css(this.frame, this.css);
      if (this.options.body) {
        return append(document.body, this.frame);
      }
    };

    Overlay.prototype.open = function() {
      var _base,
        _this = this;
      this.ready(function() {
        var options;
        options = except(_this.options, 'body', 'script', 'document', 'token');
        return _this.invokeTarget('render', 'overlay', options);
      });
      this.frame.style.display = 'block';
      this.ready(function() {
        return _this.invokeTarget('overlayOpen');
      });
      this.toggleTabIndex(false);
      return typeof (_base = this.options).opened === "function" ? _base.opened() : void 0;
    };

    Overlay.prototype.close = function() {
      var _this = this;
      return this.ready(function() {
        return _this.invokeTarget('close');
      });
    };

    Overlay.prototype.getTarget = function() {
      var _ref1;
      return (_ref1 = this.frame) != null ? _ref1.contentWindow : void 0;
    };

    Overlay.prototype.getHost = function() {
      return this.options.host;
    };

    Overlay.prototype.whitelist = ['frameReady', 'frameCallback', 'overlayClosed', 'setToken'];

    Overlay.prototype.overlayClosed = function() {
      this.closed();
      return true;
    };

    Overlay.prototype.setToken = function(token) {
      var _base;
      if (typeof (_base = this.options).token === "function") {
        _base.token(token);
      }
      this.close();
      return true;
    };

    Overlay.prototype.closed = function() {
      var _base;
      this.frame.style.display = 'none';
      this.toggleTabIndex(true);
      return typeof (_base = this.options).closed === "function" ? _base.closed() : void 0;
    };

    Overlay.prototype.renderFrame = function() {
      var iframe,
        _this = this;
      iframe = document.createElement('iframe');
      iframe.setAttribute('frameBorder', '0');
      iframe.setAttribute('allowtransparency', 'true');
      iframe.style.cssText = this.iframeCSS;
      bind(iframe, 'load', function() {
        return iframe.style.visibility = 'visible';
      });
      iframe.src = this.options.host + this.options.path;
      return iframe;
    };

    Overlay.prototype.toggleTabIndex = function(enabled) {
      var element, elements, index, _i, _len, _results;
      elements = $('button, input, select, textarea');
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        if (enabled) {
          index = element.getAttribute('data-tabindex');
          element.tabIndex = index;
          _results.push(element.removeAttribute('data-tabindex'));
        } else {
          index = element.tabIndex;
          element.setAttribute('data-tabindex', index);
          _results.push(element.setAttribute('tabindex', -1));
        }
      }
      return _results;
    };

    return Overlay;

  })();

}).call(this);
(function() {
  var App, append, attr, bind, hasAttr, host, insertAfter, parents, remove, text, trigger, unbind, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = StripeCheckout.Utils, bind = _ref.bind, unbind = _ref.unbind, trigger = _ref.trigger, append = _ref.append, text = _ref.text, parents = _ref.parents, host = _ref.host, remove = _ref.remove, insertAfter = _ref.insertAfter, attr = _ref.attr, hasAttr = _ref.hasAttr;

  App = StripeCheckout.App;

  StripeCheckout.Button = (function() {

    Button.prototype.defaults = {
      label: 'Pay with Card',
      host: 'https://button.stripe.com',
      cssPath: '/assets/inner/button.css',
      tokenName: 'stripeToken'
    };

    function Button(options) {
      var _base;
      if (options == null) {
        options = {};
      }
      this.setOptions = __bind(this.setOptions, this);

      this.parentHead = __bind(this.parentHead, this);

      this.parentForm = __bind(this.parentForm, this);

      this.token = __bind(this.token, this);

      this.open = __bind(this.open, this);

      this.submit = __bind(this.submit, this);

      this.append = __bind(this.append, this);

      this.render = __bind(this.render, this);

      this.setOptions(options);
      (_base = this.options).token || (_base.token = this.token);
      this.$el = document.createElement('button');
      this.$el.setAttribute('type', 'submit');
      this.$el.className = 'stripe-button-el';
      bind(this.$el, 'click', this.submit);
      bind(this.$el, 'touchstart', function() {});
      this.render();
    }

    Button.prototype.render = function() {
      this.$el.innerHTML = '';
      this.$span = document.createElement('span');
      text(this.$span, this.options.label);
      if (!this.options.nostyle) {
        this.$el.style.visibility = 'hidden';
        this.$span.style.display = 'block';
        this.$span.style.minHeight = '30px';
      }
      this.$style = document.createElement('link');
      this.$style.setAttribute('type', 'text/css');
      this.$style.setAttribute('rel', 'stylesheet');
      this.$style.setAttribute('href', this.options.host + this.options.cssPath);
      return append(this.$el, this.$span);
    };

    Button.prototype.append = function() {
      var head,
        _this = this;
      if (this.options.script) {
        insertAfter(this.options.script, this.$el);
      }
      if (!this.options.nostyle) {
        head = this.parentHead();
        if (head) {
          append(head, this.$style);
        }
      }
      if (this.$form = this.parentForm()) {
        unbind(this.$form, 'submit', this.submit);
        bind(this.$form, 'submit', this.submit);
      }
      if (!this.options.nostyle) {
        return setTimeout(function() {
          return _this.$el.style.visibility = 'visible';
        }, 1000);
      }
    };

    Button.prototype.disable = function() {
      return attr(this.$el, 'disabled', true);
    };

    Button.prototype.enable = function() {
      return this.$el.removeAttribute('disabled');
    };

    Button.prototype.isDisabled = function() {
      return hasAttr(this.$el, 'disabled');
    };

    Button.prototype.submit = function(e) {
      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      }
      if (!this.isDisabled()) {
        this.open();
      }
      return false;
    };

    Button.prototype.open = function(options) {
      if (options == null) {
        options = {};
      }
      this.setOptions(options);
      return App.open(this.options);
    };

    Button.prototype.token = function(value) {
      var $input;
      if (this.options.script) {
        trigger(this.options.script, 'token', value);
      }
      if (this.$form) {
        $input = this.renderInput(value.id);
        append(this.$form, $input);
        this.$form.submit();
      }
      return this.disable();
    };

    Button.prototype.renderInput = function(value) {
      var input;
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = this.options.tokenName;
      input.value = value;
      return input;
    };

    Button.prototype.parentForm = function() {
      var el, elements, _i, _len, _ref1;
      elements = parents(this.$el);
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        el = elements[_i];
        if (((_ref1 = el.tagName) != null ? _ref1.toLowerCase() : void 0) === 'form') {
          return el;
        }
      }
      return null;
    };

    Button.prototype.parentHead = function() {
      var _ref1, _ref2;
      return ((_ref1 = this.options.document) != null ? _ref1.head : void 0) || ((_ref2 = this.options.document) != null ? _ref2.getElementsByTagName('head')[0] : void 0) || this.options.document.body;
    };

    Button.prototype.setOptions = function(options) {
      var elementOptions, key, value, _base, _ref1, _ref2;
      if (options == null) {
        options = {};
      }
      this.options || (this.options = {});
      if (options.script) {
        elementOptions = this.elementOptions(options.script);
        for (key in elementOptions) {
          value = elementOptions[key];
          this.options[key] = value;
        }
      }
      for (key in options) {
        value = options[key];
        this.options[key] = value;
      }
      _ref1 = this.defaults;
      for (key in _ref1) {
        value = _ref1[key];
        if ((_ref2 = (_base = this.options)[key]) == null) {
          _base[key] = value;
        }
      }
      this.options.fallback = this.isFallback();
      if (this.options.fallback) {
        return this.options.nostyle = true;
      }
    };

    Button.prototype.elementOptions = function(el) {
      return {
        key: attr(el, 'data-key'),
        host: host(el.src),
        amount: attr(el, 'data-amount'),
        name: attr(el, 'data-name'),
        description: attr(el, 'data-description'),
        image: attr(el, 'data-image'),
        label: attr(el, 'data-label'),
        panelLabel: attr(el, 'data-panel-label'),
        currency: attr(el, 'data-currency'),
        address: hasAttr(el, 'data-address'),
        notrack: hasAttr(el, 'data-notrack'),
        nostyle: hasAttr(el, 'data-nostyle'),
        document: el.ownerDocument,
        body: el.ownerDocument.body
      };
    };

    Button.prototype.isFallback = function() {
      return !('postMessage' in window);
    };

    return Button;

  })();

}).call(this);
(function() {
  var $$, addClass, bind, hasClass, _ref;

  _ref = StripeCheckout.Utils, $$ = _ref.$$, hasClass = _ref.hasClass, addClass = _ref.addClass, bind = _ref.bind;

  bind(window, 'load', function() {
    return StripeCheckout.load();
  });

  (function() {
    var button, el, element;
    element = $$('stripe-button');
    element = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = element.length; _i < _len; _i++) {
        el = element[_i];
        if (!hasClass(el, 'active')) {
          _results.push(el);
        }
      }
      return _results;
    })();
    element = element[element.length - 1];
    if (!element) {
      return;
    }
    addClass(element, 'active');
    button = new StripeCheckout.Button({
      script: element
    });
    button.render();
    button.append();
    return StripeCheckout.setHost(button.options.host);
  })();

}).call(this);
