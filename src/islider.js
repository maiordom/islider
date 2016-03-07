/* eslint no-unused-vars: 0 */
/* global IsliderControl */
(function($, root, undefined) { // eslint-disable-line
    'use strict';

    const Utils = {
        getPageCoords(e) {
            if (e.originalEvent.changedTouches || e.originalEventtargetTouches) {
                let page = (e.originalEvent.changedTouches[0] || e.originalEventtargetTouches[0]);
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

    const ns = 'islider';

    const Defaults = {
        islider: `${ns}`,
        left: `${ns}__left`,
        right: `${ns}__right`,
        slider: `${ns}__slider`,
        path: `${ns}__path`,
        box: `${ns}__box`,
        hover: `${ns}_hover`,
        active: `${ns}_active`,
        focus: `${ns}_focus`,
        hasAnim: `${ns}_has_anim`,
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
        let item;
        let instance;

        $(this).each(function() {
            item = $(this);
            if (item.data('islider')) {
                console.log('islider already init', this);
            } else {
                instance = new IsliderControl(item, props);
                item.data('islider', instance);
            }
        });

        return this;
    };

})(jQuery, window, undefined); // eslint-disable-line
