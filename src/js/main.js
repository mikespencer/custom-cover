var wpAd = wpAd || {};
wpAd.CustomCover = (function($){

  'use strict';

  // no console safety fallback for console.log:
  var console = window.console || { log: function(){} };

  //match this to transition speed in CSS:
  var animSpeed = 800;

  if(!$){
    return function(){
      console.log('Custom Cover failed - jQuery is undefined');
    };
  }

  function CustomCover(config){
    this.config = $.extend({

      creative: '',
      creativeType: 'image',
      width: '718px',
      height: '512px',
      target: 'article.main:first div.row:first',

      replayCreative: '',
      replayWidth: '300px',
      replayHeight: '16px',
      replayTarget: 'div.customcover-replay-target',
      prependReplayCreativeToTarget: true,

      clickTracker: '',
      clickTrackerEsc: '',
      clickTag: '',

      onInteractionConfig: {
        // Any values that are passed in to config can be passed in here to tweak the execution to
        // display a different creative on replay/manual.
        // eg: video ads - auto is on mute, shorter. manual is full length with sound (change creative)
        // creative: 'url/to/full/length/video/creative.swf'
      },

      timeOpen: 7000,
      auto: true,
      expDelay: 1000,
      adid: false,
      impressionPixel: ''

    }, config);

    this.$target = $(this.config.target);
    this.init();
  }

  CustomCover.prototype = {

    init: function(){
      if(this.config.auto){
        this.exec();
      } else {
        this.buildReplayCreative();
        this.placeReplayCreative();
      }
      if(this.config.impressionPixel){
        this.addPixel(this.config.impressionPixel);
      }
    },

    exec: function(){
      var root = this;
      this.buildCreativeContainer();
      this.buildCreative();
      this.placeCreative();
      if(this.config.auto){
        this.config.auto = false;
        this.expDelay = setTimeout(function(){
          root.expand();
          root.colDelay = setTimeout(function(){
            root.collapse();
          }, root.config.timeOpen + animSpeed); // + 1000 is animation speed to fully open.
        }, this.config.expDelay);
      } else {
        this.expDelay = setTimeout(function(){
          root.expand();
        }, 100);
      }
    },

    buildCreativeContainer: function(){
      this.$creativeContainer = $('<div class="customcover"></div>').addClass('collapse');
    },

    buildCreative: function(){
      var builders = {
        'image': 'buildImageCreative',
        'flash': 'buildFlashCreative',
        'iframe': 'buildIframeCreative',
        'video': 'buildVideoCreative'
      };
      this.config.creativeType = builders[this.config.creativeType] ? this.config.creativeType : 'image';
      this.creativeCode = this[builders[this.config.creativeType]].call(this);
      this.$creativeContainer.append(this.creativeCode);
      this.addCloseButton();
    },

    buildImageCreative: function(){
      return '<a href="' + this.config.clickTracker + this.config.clickTag + '" target="_blank">' +
        '<img src="' + this.config.creative + '" alt="Click here for more information.">' +
      '</a>';
    },

    buildFlashCreative: function(){
      return '';
    },

    buildIframeCreative: function(){
      return '';
    },

    buildVideoCreative: function(){
      return '';
    },

    placeCreative: function(){
      this.$target.prepend(this.$creativeContainer);
    },

    addReplayButton: function(){
      var root = this,
        fn = this.config.prependReplayCreativeToTarget ? 'prependTo' : 'appendTo';

      this.$replayButton = $('<img />').attr({
        src: this.config.replayCreative,
        width: this.config.replayWidth,
        height: this.config.replayHeight,
        alt: 'Click here to replay advertisement.'
      }).addClass('replay-customcover').hide()[fn](this.config.replayTarget).on('click', function(){
        $(this).off('click');
        root.reconfig(root.config.onInteractionConfig);
        root.exec();
      }).show(250);
    },

    removeReplayButton: function(){
      if(this.$replayButton){
        this.$replayButton.remove();
      }
    },

    addCloseButton: function(){
      var root = this;
      this.closeBtn = $('<span>close [x]</span>').addClass('customcover-closebtn').prependTo(this.$creativeContainer)
      .on('click', function(){
        $(this).off('click');
        root.collapse();
      });
    },

    expand: function(){
      this.removeReplayButton();
      this.$creativeContainer.addClass('expand').removeClass('collapse');
    },

    collapse: function(){
      var root = this;
      if(this.colDelay){
        clearTimeout(this.colDelay);
      }
      this.$creativeContainer.addClass('collapse').removeClass('expand');
      setTimeout(function(){
        root.remove();
        root.addReplayButton();
      }, animSpeed);
    },

    remove: function(){
      this.$creativeContainer.remove();
    },

    reconfig: function(data){
      this.config = $.extend(this.config, data);
    },

    addPixel: function(url){
      url = url.replace(/\[random\]/i, Math.floor(Math.random() * 1E5));
      $('<img src="' + url + '" height="1" width="1" alt="" style="display:none;" />').appendTo('body');
    }

  };

  return CustomCover;

})(window.jQuery);
