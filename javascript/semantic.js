// namespace
window.semantic = {
  handler: {}
};

// Allow for console.log to not break IE
if (typeof window.console == "undefined" || typeof window.console.log == "undefined") {
  window.console = {
    log  : function() {},
    info : function(){},
    warn : function(){}
  };
}
if(typeof window.console.group == 'undefined' || typeof window.console.groupEnd == 'undefined' || typeof window.console.groupCollapsed == 'undefined') {
  window.console.group = function(){};
  window.console.groupEnd = function(){};
  window.console.groupCollapsed = function(){};
}
if(typeof window.console.markTimeline == 'undefined') {
  window.console.markTimeline = function(){};
}
window.console.clear = function(){};

// ready event
semantic.ready = function() {

  // selector cache
  var
    $ui               = $('.ui').not('.hover, .down'),
    $swap             = $('.theme.menu .item'),
    $menu             = $('#menu'),
    $sortTable        = $('.sortable.table'),
    $demo             = $('.demo'),
    $waypoints        = $('.main.container').find('h2').first().siblings('h2').andSelf(),

    $menuPopup        = $('.ui.main.menu .popup.item'),
    $menuDropdown     = $('.ui.main.menu .dropdown'),

    $downloadDropdown = $('.download.buttons .dropdown'),

    $helpPopup        = $('.header .help.icon'),

    $example          = $('.example'),
    $shownExample     = $example.filter('.shown'),

    $developer        = $('.developer.item'),
    $overview         = $('.overview.item, .overview.button'),
    $designer         = $('.designer.item'),

    $sidebarButton    = $('.attached.launch.button'),

    $increaseFont     = $('.font .increase'),
    $decreaseFont     = $('.font .decrease'),

    $peek             = $('.peek'),
    $peekItem         = $peek.children('.menu').children('a.item'),
    $peekSubItem      = $peek.find('.item .menu .item'),
    $code             = $('div.code').not('.existing'),
    $existingCode     = $('.existing.code'),

    // alias
    handler
  ;

  // event handlers
  handler = {

    createIcon: function() {
      $example
        .each(function(){
          $('<i/>')
            .addClass('icon code')
            .prependTo( $(this) )
          ;
        })
      ;
    },

    getSpecification: function(callback) {
      var
        url = $(this).data('url') || false
      ;
      callback = callback || function(){};
      if(url) {
        $.ajax({
          method: 'get',
          url: url,
          type: 'json',
          complete: callback
        });
      }
    },

    create: {
      tick: function() {

      },
      examples: function(json) {
        var
          types      = json['Types'],
          text       = json['Text'],
          states     = json['States'],
          variations = json['Variations'],

          $element,
          html
        ;
        $.each(types, function(name, type){
          html += '<h2 class="ui dividing header">' + name + '</h2';
          if($.isPlainObject(type)) {
            $.each(type, function(name, subType) {
              $element = $.zc(subType);
              $element = handler.create.text($element, text);
              html += '<h3 class="ui header">' + name + '</h3';
              html += handler.create.variations($element, variations);
            });
          }
          else {
            $element = $.zc(type);
            $element = handler.create.text($element);
            html += handler.create.variations($element, variations);
          }
        });
        // Each TYPE
        //   show type name
        //   html = koan (html)
        //   each text
        //     find label
        //     if(obj)
        //       replace random text
        //     else
        //       replace text
        //   end
        //   Each variation
        //     (if obj)
        //       each
        //         add class
        //     (else)
        //       add class
        //     label = property
        //     class = class
        //     show html
        //   end
        // end
      },
      element: function(koan, type, text, variation) {

      },
      variations: function($element, variations) {
        $.each(variations, function(name, variation){

        });
      },
      text: function($element, text) {
        $.each(text, function(selector, text) {
          $element.find(selector).text(text);
        });
        return $element;
      }
    },

    font: {

      increase: function() {
        var
          $container = $(this).parent().prev('.ui.segment'),
          fontSize   = parseInt( $container.css('font-size'), 10)
        ;
        $container
          .css('font-size', fontSize + 1)
        ;
      },
      decrease: function() {
        var
          $container = $(this).parent().prev('.ui.segment'),
          fontSize   = parseInt( $container.css('font-size'), 10)
        ;
        $container
          .css('font-size', fontSize - 1)
        ;
      }
    },
    overviewMode: function() {
      var
        $button  = $(this),
        $body    = $('body'),
        $example = $('.example'),
        $headers = $('.example .ui.header:first-of-type').add('.example p:first-of-type')
      ;
      $body.toggleClass('overview');
      $button.toggleClass('active');
      if($body.hasClass('overview')) {
        $developer.addClass('disabled').popup('destroy');
        $designer.addClass('disabled').popup('destroy');
        $example.children().not($headers).hide();
        $example.filter('.another').hide();
      }
      else {
        $developer.removeClass('disabled').popup();
        $designer.removeClass('disabled').popup();
        $example.children().not($headers).show();
        $example.filter('.another').show();
      }
    },
    developerMode: function() {
      var
        $example = $('.example').not('.no')
      ;
      $developer.addClass('active');
      $designer.removeClass('active');
      $example
        .each(function() {
          $.proxy(handler.createCode, $(this))('developer');
        })
      ;
    },
    designerMode: function() {
      var
        $example = $('.example').not('.no')
      ;
      $designer.addClass('active');
      $developer.removeClass('active');
      $example
        .each(function() {
          $.proxy(handler.createCode, $(this))('designer');
        })
      ;
    },

    createCode: function(type) {
      var
        $example    = $(this).closest('.example'),
        $header     = $example.children('.ui.header:first-of-type').eq(0).add('p:first-of-type'),
        $demo       = $example.children().not($header).not('i.code:first-child, .code, .language.label, .annotation, br, .ignore, .ignored'),
        $annotation = $example.find('.annotation'),
        $code       = $annotation.find('.code'),
        whiteSpace  = new RegExp('\\n\\s{4}', 'g'),
        code       = ''
      ;
      if($annotation.size() === 0) {
        $annotation = $('<div/>')
          .addClass('annotation')
          .appendTo($example)
        ;
      }
      if( $code.hasClass('existing') ) {
        $annotation.show();
        $code.removeClass('existing');
        $.proxy(handler.initializeCode, $code)();
      }
      if( $code.size() === 0) {
        $demo
          .each(function(){
            var $this = $(this).clone(false);
            if($this.not('br')) {
              code += $this.removeAttr('style').get(0).outerHTML + "\n";
            }
          })
        ;
        //code  = $.trim(code.replace(whiteSpace, '\n'));
        $code = $('<div/>')
          .data('type', 'html')
          .addClass('code')
          .html(code)
            .appendTo($annotation)
        ;
        $.proxy(handler.initializeCode, $code)();
      }
      if( ($demo.first().is(':visible') || type == 'developer') && type != 'designer' ) {
        $demo.hide();
        $header.show();
        $annotation.fadeIn(500);
      }
      else {
        $annotation.hide();
        if($demo.size() > 1) {
          $demo.show();
        }
        else {
          $demo.fadeIn(500);
        }
      }
    },

    createAnnotation: function() {
      if(!$(this).data('type')) {
        $(this).data('type', 'html');
      }
      $(this)
        .wrap('<div class="annotation">')
        .parent()
        .hide()
      ;
    },

    initializeCode: function() {
      var
        $code        = $(this),
        code         = $code.html(),
        existingCode = $code.hasClass('existing'),
        contentType  = $code.data('type')    || 'javascript',
        title        = $code.data('title')   || false,
        demo         = $code.data('demo')    || false,
        preview      = $code.data('preview') || false,
        label        = $code.data('label')   || false,
        displayType  = {
          html       : 'HTML',
          javascript : 'Javascript',
          css        : 'CSS',
          text       : 'Command Line',
          sh         : 'Command Line'
        },
        whiteSpace  = new RegExp('\\n\\s{4}', 'g'),
        $label,
        padding     = 4,
        editor,
        editorSession,
        codeHeight
      ;

      // trim whitespace
      code = $.trim(code.replace(whiteSpace, '\n'));

      if(contentType == 'html') {
        $code.text(code);
      }
      else {
        $code.html(code);
      }

      // evaluate if specified
      if($code.hasClass('evaluated')) {
        eval(code);
      }

      // initialize
      editor        = ace.edit($code[0]);
      editorSession = editor.getSession();

      editor.setTheme('ace/theme/github');
      editor.setShowPrintMargin(false);
      editor.setReadOnly(true);
      editor.renderer.setShowGutter(false);
      editor.setHighlightActiveLine(false);
      editorSession.setMode('ace/mode/'+ contentType);
      editorSession.setUseWrapMode(true);
      editorSession.setTabSize(2);
      editorSession.setUseSoftTabs(true);

      codeHeight = editor.session.getScreenLength() * (editor.renderer.lineHeight)  + editor.renderer.scrollBar.getWidth() + padding;
      $(this)
        .height(codeHeight + 'px')
        .wrap('<div class="ui instructive segment">')
      ;
      // add label
      if(title) {
        $('<div>')
          .addClass('ui attached top label')
          .html('<span class="title">' + title + '</span>' + '<em>' + (displayType[contentType] || contentType) + '</em>')
          .prependTo( $(this).parent() )
        ;
      }
      if(label) {
        $('<div>')
          .addClass('ui pointing below label')
          .html(displayType[contentType] || contentType)
          .insertBefore ( $(this).parent() )
        ;
      }
      // add run code button
      if(demo) {
        $('<a>')
          .addClass('ui pointing below black label')
          .html('Run Code')
          .on('click', function() {
            eval(code);
          })
          .insertBefore ( $(this).parent() )
        ;
      }
      // add preview if specified
      if(preview) {
        $(code)
          .insertAfter( $(this).parent() )
        ;
      }
      editor.resize();
    },

    movePeek: function() {
      if( $('.stuck .peek').size() > 0 ) {
        $('.peek')
          .toggleClass('pushed')
        ;
      }
      else {
        $('.peek')
          .removeClass('pushed')
        ;
      }
    },

    menu: {
      mouseenter: function() {
        $(this)
          .stop()
          .animate({
            width: '155px'
          }, 300, function() {
            $(this).find('.text').show();
          })
        ;
      },
      mouseleave: function(event) {
        $(this).find('.text').hide();
        $(this)
          .stop()
          .animate({
            width: '70px'
          }, 300)
        ;
    }

    },

    peek: function() {
      var
        $body     = $('html, body'),
        $header   = $(this),
        $menu     = $header.parent(),
        $group    = $menu.children(),
        $headers  = $group.add( $group.find('.menu .item') ),
        $waypoint = $waypoints.eq( $group.index( $header ) ),
        offset
      ;
      offset    = $waypoint.offset().top - 80;
      if(!$header.hasClass('active') ) {
        $menu
          .addClass('animating')
        ;
        $headers
          .removeClass('active')
        ;
        $body
          .stop()
          .one('scroll', function() {
            $body.stop();
          })
          .animate({
            scrollTop: offset
          }, 500)
          .promise()
            .done(function() {
              $menu
                .removeClass('animating')
              ;
              $headers
                .removeClass('active')
              ;
              $header
                .addClass('active')
              ;
              $waypoint
                .css('color', $header.css('border-right-color'))
              ;
              $waypoints
                .removeAttr('style')
              ;
            })
        ;
      }
    },

    peekSub: function() {
      var
        $body           = $('html, body'),
        $subHeader      = $(this),
        $header         = $subHeader.parents('.item'),
        $menu           = $header.parent(),
        $subHeaderGroup = $header.find('.item'),
        $headerGroup    = $menu.children(),
        $waypoint       = $('h2').eq( $headerGroup.index( $header ) )
        $subWaypoint    = $waypoint.nextAll('h3').eq( $subHeaderGroup.index($subHeader) ),
        offset          = $subWaypoint.offset().top - 80
      ;
      $menu
        .addClass('animating')
      ;
      $headerGroup
        .removeClass('active')
      ;
      $subHeaderGroup
        .removeClass('active')
      ;
      $body
        .stop()
        .animate({
          scrollTop: offset
        }, 500, function() {
          $menu
            .removeClass('animating')
          ;
          $subHeader
            .addClass('active')
          ;
        })
        .one('scroll', function() {
          $body.stop();
        })
      ;
    },

    swapStyle: function() {
      var
        theme = $(this).data('theme')
      ;
      $(this)
        .addClass('active')
        .siblings()
          .removeClass('active')
      ;
      $('head link.ui')
        .each(function() {
          var
            href         = $(this).attr('href'),
            subDirectory = href.split('/')[3],
            newLink      = href.replace(subDirectory, theme)
          ;
          $(this)
            .attr('href', newLink)
          ;
        })
      ;
    }
  };

  $downloadDropdown
    .dropdown({
      on         : 'click',
      transition : 'scale'
    })
  ;

  // attach events
  if($.fn.tablesort !== undefined) {
    $sortTable
      .tablesort()
    ;
  }

  if(window.ace !== undefined) {
    $code
      .each(handler.initializeCode)
    ;
    $existingCode
      .each(handler.createAnnotation)
    ;
  }

  handler.createIcon();
  $example
    .find('i.code')
      .on('click', handler.createCode)
  ;

  $shownExample
    .each(handler.createCode)
  ;

  $helpPopup
    .popup()
  ;

  $swap
    .on('click', handler.swapStyle)
  ;

  $increaseFont
    .on('click', handler.font.increase)
  ;
  $decreaseFont
    .on('click', handler.font.decrease)
  ;

  $developer
    .on('click', handler.developerMode)
  ;
  $designer
    .on('click', handler.designerMode)
  ;
  $overview
    .on('click', handler.overviewMode)
  ;

  $menuPopup
    .popup({
      position   : 'bottom center',
      className: {
        popup: 'ui popup'
      }
    })
  ;

  $menuDropdown
    .dropdown({
      on         : 'hover',
      action     : 'none'
    })
  ;

  $sidebarButton
    .on('mouseenter', handler.menu.mouseenter)
    .on('mouseleave', handler.menu.mouseleave)
  ;

  $menu
    .sidebar('attach events', '.launch.button, .launch.item')
  ;
  $waypoints
    .waypoint({
      continuous : false,
      offset     : 100,
      handler    : function(direction) {
        var
          index = (direction == 'down')
            ? $waypoints.index(this)
            : ($waypoints.index(this) - 1 >= 0)
              ? ($waypoints.index(this) - 1)
              : 0
        ;
        $peekItem
          .removeClass('active')
          .eq( index )
            .addClass('active')
        ;
      }
    })
  ;
  $('body')
    .waypoint({
      handler: function(direction) {
        if(direction == 'down') {
          if( !$('body').is(':animated') ) {
            $peekItem
              .removeClass('active')
              .eq( $peekItem.size() - 1 )
                .addClass('active')
            ;
          }
        }
      },
      offset: 'bottom-in-view'
     })
  ;

  $peek
    .waypoint('sticky', {
      offset     : 85,
      stuckClass : 'stuck'
    })
  ;

  $peekItem
    .on('click', handler.peek)
  ;
  $peekSubItem
    .on('click', handler.peekSub)
  ;

};


// attach ready event
$(document)
  .ready(semantic.ready)
;