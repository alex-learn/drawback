(function($){

  // *** DrawBack ***
  DrawBack = {

    // all functions registered into the _stack array
    _stack: [],

    // all functions registered like object collections.
    // the function name es the object key
    _stack_: {},

    start: function () {
      this.canvasSupport = document.createElement("canvas").getContext ? true : false;
    },

    register: function(name, fn){
      this._stack_[name] = {
        i: this._stack.length,
        fn: fn
      };
      this._stack.push(fn);
    },

    _modUrl: function (url, objDraw) {
      var _addAtt = function (att, str, objDraw) {
        return str + (str.search('&'+att)< 0 ? '&'+att + '='+ $(objDraw.el)[att]() : '')
      }
        ,  _url = _addAtt('width', url, objDraw);

      _url = _addAtt('height', _url, objDraw);
      return _url;
    },

    _addMethodsToObject: function (objDraw) {
      var self = this;

      // refresh method
      objDraw.refresh = function (url) {
        if(url) objDraw.url = url;

        if(objDraw.options.forceServer)
          self.renderFallback(objDraw, true);
        else
          self._draw(objDraw);
      }
    },

    _draw: function (objDraw) {
      // forceServer property
        // if set to true it ignores browser rendering and always does server side rendering.
        if(objDraw.options.forceServer)
          this.renderFallback(objDraw);
        else if(objDraw.url != undefined)
            this.requestData(objDraw);
          else {
            this.process(objDraw);
          }

        return objDraw;
    },

    /**
    * draw method (pseudo constructor)
    */
    draw: function (el_id, draw_id, url, options) {
      var objDraw = this._stack_[draw_id];

      if(objDraw) {
        var el = $(el_id);
        // add new properties
        objDraw = $.extend({
          id: draw_id,
          el: el,
          url: url,
          data: {},
          dims: {
            width: el.width(),
            height: el.height()
          },
          options: $.extend({
            autoInject: true,
            sync: false,
            download: true,
            forceServer: false
          }, options)
        }, objDraw);

        // add methods to drawback object
        this._addMethodsToObject(objDraw);

        return this._draw(objDraw);
      }
      else {
        console.error('There is no function associated with `' + draw_id + '` id.\n');
        console.log ('ensure:');
        console.warn ('  Exists `' + draw_id + '.js`.');
        console.warn ('  Exists a registered method named `' + draw_id + '`.');

        return null;
      }

    },

    /**
     * requestData method
     * retrieve the data throug ajax request
     */
    requestData: function (objDraw) {
      var self = this;
      $.ajax({
        type: "GET",
        async: true,
        url: objDraw.url,
        beforeSend: function () {
          $(objDraw.el).addClass('loading');
        },
        complete: function () {
          $(objDraw.el).removeClass('loading');
        },
        success: function(resp) {
          objDraw.data = resp;
          self.process(objDraw);
        }
      });
    },

    /**
     * renderFallback method
     * make a ajax request to rendering in server side.
     */
    renderFallback: function (objDraw, refresh) {
      $(objDraw.el).addClass('loading');

      // urlBuilder function
      // A function that constructs the url for server fallback.
      // It gets the drawing name and data url as parameters.
      // There's also a third argument called forceDownload, which is set to true for the download link construction.

      var url = objDraw.options.urlBuilder(objDraw.id, objDraw.url, false)
        ,  _url = this._modUrl(url, objDraw);

      // create obj element image
      var img = new Image();

      img.src = _url + (refresh ? '&rnd='+(+new Date) : '');

      img.onload = function() {
        $(objDraw.el).removeClass('loading');
        $(objDraw.el).empty();
        $(objDraw.el).append(img);

        $(objDraw).trigger('imgReady', [objDraw]);
        if(objDraw.options.onImgReady) objDraw.options.onImgReady(objDraw);
      }

    },

    process: function (objDraw) {
      // execute function
      var data = {
          dims: objDraw.dims,
          data: objDraw.data.data
        }
        , cssClass = 'graph-' + (objDraw.options.name || objDraw.id);

      // browser canvas support ?
      if(this.canvasSupport) {

        // insert canvas response into element
        $(objDraw.el).find('.'+cssClass).remove();
        $(objDraw.el).addClass(cssClass);
        $(objDraw).trigger('canvasReady', [objDraw.data]);

        if(objDraw.options.autoInject) {
          var canvas = objDraw.fn(data, objDraw.el);
          $(objDraw.el).empty().append(canvas);
          $(objDraw).trigger('chartReady', [objDraw.data]);
        }
      }
      else {
        // if not canvas supported then make rendering in server side
        this.renderFallback(objDraw);
      }

      // whether to include a download button along with the . If set to true, it injects an element like this before the target element.
      if(objDraw.options.download) {
        var url = objDraw.options.urlBuilder ? objDraw.options.urlBuilder(objDraw.id, objDraw.url, false) : '/draw/' + objDraw.id + '?url=/getData&forceDownload=true'
          ,  src = this._modUrl(url, objDraw);

        if(src.search(/forceDownload=/) < 0) src+= '&forceDownload=true';

        objDraw.el.append($('<div class="download"><a title="download \'' + objDraw.id + '\'" href="' + src + '">download</a></div>'));
      }
    }
  }
  // *** END DrawBack ***

  DrawBack.start();

})(jQuery)
