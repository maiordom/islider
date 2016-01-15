(function($, root, undefined) { // eslint-disable-line
    'use strict';

    var Utils = {
        getPageCoords: function(e) {
            if (e.originalEvent.changedTouches || e.originalEventtargetTouches) {
                var page = (e.originalEvent.changedTouches[0] || e.originalEventtargetTouches[0]);
                return {
                    left: page.pageX,
                    top: page.pageY
                };
            } else {
                return {
                    left: e.pageX,
                    top: e.pageY
                };
            }
        }
    };

    var Defaults = {
        islider: 'islider',
        left: 'islider__left',
        right: 'islider__right',
        slider: 'islider__slider',
        path: 'islider__path',
        box: 'islider__box',
        hover: 'islider_hover',
        active: 'islider_active',
        focus: 'islider_focus',
        hasAnim: 'islider_has_anim',
        orientation: 'horizontal',
        range: 'min',
        step: 1,
        generate: true,
        value: 0,
        domain: [0, 1],
        values: [0, 0],
        onSlide: function(value, values) {}
    };

    // @@control
    // @@drag

    $.fn.islider = function(props) {
        var item, instance;
        $(this).each(function() {
            item = $(this);
            if (item.data('islider')) {
                console.log('islider already init', this);
            } else {
                instance = iSlider(item, props ? props : {});
                item.data('islider', instance);
            }
        });

        return this;
    };

})(jQuery, window, undefined);
