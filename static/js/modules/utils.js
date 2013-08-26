// Scope
// -----

// To avoid global scope pollution, declare all variables and functions inside an
// [immediately-invoked function expression](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) using an augmented [module pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript).
var PDP = (function( pdp ) {

  'use strict';

  // Utils
  // ----------------
  // An assortment of helper methods and polyfills.
  var utils = {};

  // Error visualization
  utils.showError = function( errorText ) {
    $('#error').text( errorText ).delay( 20000 ).fadeOut();
  };

  // takes a variable name and returns a nice title
  // ex. state_name becomes State
  utils.varToTitle = function( varName ) {
    var nameParts = varName.split('_'),
        varTitle;

    nameParts = nameParts.reverse();

    // a varName can have both 'name' and an int on the end
    if ( isNaN(nameParts[0]) === false ) {
      nameParts.splice(0, 1);
    }

    if ( nameParts[0] === 'name' ) {
      nameParts.splice(0, 1);
    }

    varTitle = nameParts.reverse().join(' ');
    varTitle = varTitle.charAt(0).toUpperCase() + varTitle.slice(1);

    return varTitle;
  };

  // Return the hash parameters from the current URL. [source](http://stackoverflow.com/questions/4197591/parsing-url-hash-fragment-identifier-with-javascript/4198132#4198132)
  utils.getHashParams = function() {

    var hashParams = {};
    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&;=<>]+)([=><]?)([^&;]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, ' ')); },
        q = window.location.hash.substring(1).replace(/^!\/?/, '');

    while (e = r.exec(q)) {
      hashParams[d(e[1])] = {
        values: d(e[3]),
        comparator: d(e[2])
      };
    }

    return hashParams;

  };

  // localStorage polyfill from https://gist.github.com/juliocesar/926500.
  // Basically just creates an object in memory.
  if ( !('localStorage' in window) ) {
    window.localStorage = {
      _data       : {},
      setItem     : function(id, val) { return this._data[id] = String(val); },
      getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
      removeItem  : function(id) { return delete this._data[id]; },
      clear       : function() { return this._data = {}; }
    };
  }

  // Cache data in the localStorage, adapted from https://gist.github.com/rpflorence/1345787
  utils.getJSON = function( url ) {

    var supportsLocalStorage = 'localStorage' in window,
        slug = 'cfpb:' + url.substring( url.indexOf('?') + 1 );

    // Both functions return a promise, so no matter which function
    // gets called inside getCache, you get the same API.
    function getJSON( url ) {

      var deferred = $.getJSON( url );

      deferred.done(function(data) {
        try {
          localStorage.setItem( slug, JSON.stringify(data) );
        } catch( e ) {
          // @TODO: Only clear out PDP relevant storage.
          window.localStorage.clear();
          //console.log('%c localStorage cleared!', 'color: red');
        }
        // This is a safety to prevent the polyfill object from growing too huge.
        // @TODO: Make this less lame.
        if ( window.localStorage.length > 100 ) {
          window.localStorage.clear();
          //console.log('%c localStorage cleared!', 'color: red');
        }
      });

      //console.log( url + ' %c fetched via AJAX', 'color: orange' );

      return deferred;
    }

    function getStorage( url ) {

      var storageDfd = new $.Deferred(),
          storedData = localStorage.getItem( slug ),
          promise;

      if (!storedData) {
        return getJSON( url );
      }

      setTimeout(function() {
        storageDfd.resolveWith( null, [JSON.parse(storedData)] );
      });

      //console.log( url + ' %c fetched via localStorange', 'color: blue' );
      
      promise = storageDfd.promise();
      promise.status = 200;
      promise.statusText = 'success';

      return promise;

    }

    return supportsLocalStorage ? getStorage( url ) : getJSON( url );

  };

  // A `bind()` polyfill
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          FNOP = function () {},
          fBound = function () {
            return fToBind.apply(this instanceof FNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      FNOP.prototype = this.prototype;
      fBound.prototype = new FNOP();

      return fBound;
    };
  }

  String.prototype.splice = function( idx, rem, s ) {
      return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
  };

  pdp.utils = utils;

  return pdp;

}( PDP || {} ));