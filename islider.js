(function( $, root, undefined ) {
    'use strict';

function iSlider( el, props ) {
    var a, f, defs, event = {}, collisionOffset = 0, metricType, coordType, isVertical = false;

    defs = {
        islider:     'islider',
        left:        'islider__left',
        right:       'islider__right',
        slider:      'islider__slider',
        path:        'islider__path',
        hover:       'islider_hover',
        active:      'islider_active',
        focus:       'islider_focus',
        orientation: 'horizontal',
        generate:    true,
        range:       'min',
        value:       0,
        domain:      [ 0, 1 ],
        values:      [ 0, 0 ],
        onSlide:     function( value, values ) {}
    };

    f = {
        on: function( eventName, callback ) {
            event[ eventName ] = callback;
            return f.interface();
        },

        trigger: function( eventName, data ) {
            if ( event[ eventName ] ) { event[ eventName ].apply( null, data ); }
        },

        init: function() {
            f.extend();
            f.cache();
            f.setCollisionOffset();
            f.setPathMargin();
            f.setSliders();
            f.isRangeSingle();
            f.setInitialData();
            f.bindEvents();
        },

        bindEvents: function() {
            a.leftSl.on( 'move',       f.onLeftMove );
            a.leftSl.on( 'stopSlide',  f.onStopSlide );
            a.rightSl.on( 'move',      f.onRightMove );
            a.rightSl.on( 'stopSlide', f.onStopSlide );

            a.slider.on( 'mousedown touchstart', f.onStartSlide );
            a.slider.on( 'mouseenter', f.onHoverEl );
            a.slider.on( 'mouseleave', f.onUnhoverEl );
        },

        hasCollision: function() {
            return f.getLeft() === f.getRight();
        },

        onHoverEl: function() {
            $( this ).addClass( defs.hover );
        },

        onUnhoverEl: function() {
            $( this ).removeClass( defs.hover );
        },

        onStopSlide: function() {
            a.actSl.el.removeClass( defs.active );
            el.trigger( 'islider.stop-slide' );
        },

        onStartSlide: function( e ) {
            if ( defs.range === true && f.hasCollision() ) {
                a.actSl.startSlide( e );
            } else if ( e.target === a.leftSl.el[ 0 ] ) {
                a.actSl = a.leftSl;
                a.leftSl.startSlide( e );
            } else if ( e.target === a.rightSl.el[ 0 ] ) {
                a.actSl = a.rightSl;
                a.rightSl.startSlide( e );
            }

            a.actSl.el.addClass( defs.active );

            return false;
        },

        extend: function() {
            $.extend( defs, props );
        },

        cache: function() {
            el.addClass( defs.islider );

            if ( defs.generate ) { f.generate(); }

            a = {
                actSl:   null,
                slider:  el.find( '.' + defs.slider ),
                leftEl:  el.find( '.' + defs.left ),
                rightEl: el.find( '.' + defs.right ),
                path:    el.find( '.' + defs.path )
            };

            isVertical = defs.orientation === 'vertical';
            metricType = isVertical ? 'height' : 'width';
            coordType  = isVertical ? 'top' : 'left';
            a.handleMetric = a.leftEl[ metricType ]() || a.rightEl[ metricType ]();
            f.setPath  = defs.range === true ? f.setPath : defs.range === 'min' ? f.setMinPath : f.setMaxPath;
        },

        setCollisionOffset: function() {
            if ( defs.range === true ) {
                collisionOffset = a.handleMetric;
            }
        },

        setPathMargin: function() {
            if ( isVertical && defs.range === true ) {
                a.path.css( 'marginTop', collisionOffset / 2 );
            } else if ( defs.range === true ) {
                a.path.css( 'marginLeft', collisionOffset / 2 );
            }
        },
        
        getTotalWidth: function() {
            if ( defs.orientation === 'vertical' ) {
                return el[ 0 ].offsetHeight;
            } else {
                return el[ 0 ].offsetWidth;
            }
        },

        isRangeSingle: function() {
            if ( defs.range === 'min' ) {
                defs.values[ 1 ] = defs.value;
            } else if ( defs.range === 'max' ) {
                var hook = defs.orientation === 'horizontal' ? 'right' : 'bottom';
                a.path[ 0 ].style[ hook ] = 0;
                defs.values[ 0 ] = defs.value;
                defs.values[ 1 ] = defs.domain[ 1 ];
            }
        },

        generate: function() {
            $( '<div>' ).addClass( defs.left ).addClass( defs.slider ).appendTo( el );
            $( '<div>' ).addClass( defs.right ).addClass( defs.slider ).appendTo( el );
            $( '<div>' ).addClass( defs.path ).appendTo( el );
        },

        setSliders: function() {
            a.leftSl  = Slider({
                handle:        a.leftEl,
                getTotalWidth: f.getTotalWidth,
                orientation:   defs.orientation,
                domain:        defs.domain,

                getRange: function() {
                    return [ 0, f.getTotalWidth() - a.handleMetric * ( defs.range === true ? 2 : 1 ) ];
                }
            });

            a.rightSl = Slider({
                handle:        a.rightEl,
                getTotalWidth: f.getTotalWidth,
                orientation:   defs.orientation,
                domain:        defs.domain,

                getRange: function() {
                    return [ a.handleMetric, f.getTotalWidth() - a.handleMetric ];
                }
            });
        },

        setInitialData: function() {
            if ( defs.range === true ) {
                a.leftSl.setValue( defs.values[ 0 ] );
                a.rightSl.setValue( defs.values[ 1 ] );
            } else {
                a.leftSl.setValue( defs.value );
            }

            f.setPath();

            if ( defs.range !== true ) {
                a.rightEl.hide();
            }
        },

        getLeft: function() {
            return a.leftSl.getCoord();
        },

        getRight: function() {
            return a.rightSl.getCoord();
        },

        getWidth: function() {
            return f.getRight() - f.getLeft();
        },

        isLeftCrossing: function( x ) {
            return x + collisionOffset >= f.getRight();
        },

        isRightCrossing: function( x ) {
            return x <= f.getLeft() + collisionOffset;
        },

        onLeftMove: function( x ) {
            f.leftMoveHandler( x );
            defs.onSlide( defs.values[ 0 ], [ defs.values[ 0 ], defs.values[ 1 ] ], 'left' );
            console.log( defs.values[ 0 ] );
        },

        onRightMove: function( x ) {
            f.rightMoveHandler( x );
            defs.onSlide( defs.values[ 1 ], [ defs.values[ 0 ], defs.values[ 1 ] ], 'right' );
            console.log( defs.values[ 1 ] );
        },

        leftMoveHandler: function( x ) {
            x = parseInt( x, 10 );
            if ( defs.range === true && f.isLeftCrossing( x ) ) {
                x = f.getRight() - collisionOffset;
                defs.values[ 0 ] = defs.values[ 1 ];
            } else {
                defs.values[ 0 ] = a.leftSl.getValue( x );
            }
            f.moveToLeft( x );
            f.setPath();
        },

        rightMoveHandler: function( x ) {
            x = parseInt( x, 10 );
            if ( defs.range === true && f.isRightCrossing( x ) ) {
                x = f.getLeft() + collisionOffset;
                defs.values[ 1 ] = defs.values[ 0 ];
            } else {
                defs.values[ 1 ] = a.rightSl.getValue( x );
            }
            f.moveToRight( x );
            f.setPath();
        },

        setPath: function() {
            a.path[ 0 ].style[ metricType ] = ( f.getWidth() / f.getTotalWidth() ) * 100 + '%';
            a.path[ 0 ].style[ coordType ]  = ( f.getLeft() / f.getTotalWidth() ) * 100 + '%';
        },

        setMaxPath: function() {
            a.path[ 0 ].style[ metricType ] = 100 - ( ( f.getLeft() + a.handleMetric / 2 ) / f.getTotalWidth() ) * 100 + '%';
        },

        setMinPath: function() {
            a.path[ 0 ].style[ metricType ] = ( ( f.getLeft() + a.handleMetric / 2 ) / f.getTotalWidth() ) * 100 + '%';
        },

        moveToLeft: function( x ) {
            a.leftEl[ 0 ].style[ coordType ] = ( x / f.getTotalWidth() ) * 100 + '%';
        },

        moveToRight: function( x ) {
            a.rightEl[ 0 ].style[ coordType ] = ( x / f.getTotalWidth() ) * 100 + '%';
        },

        leftVal: function( val ) {
            a.leftSl.setValue( val );
            f.leftMoveHandler( a.leftSl.getCoord() );
        },

        rightVal: function( val ) {
            a.rightSl.setValue( val );
            f.rightMoveHandler( a.rightSl.getCoord() );
        },

        interface: function() {
            return {
                on:       f.on,
                reset:    f.setInitialData,
                leftVal:  f.leftVal,
                rightVal: f.rightVal
            };
        }
    };

    f.init();

    return f.interface();
}

function Slider( props ) {
    var a, event = {}, f, range;

    f = {
        cacheObjects: function() {
            a = { el: props.handle };
            f.moveHandler = props.orientation === 'vertical' ? f.moveVerticalHandler : f.moveHorizontalHandler;
            f.setCoord    = props.orientation === 'vertical' ? f.setY : f.setX;
            f.getCoord    = props.orientation === 'vertical' ? f.getY : f.getX;
        },

        reset: function() {
            var range = props.getRange();
            f.setRange( range );
            f.setScale( range, props.domain );
        },

        setRange: function( range ) {
            a.xMin = range[ 0 ];
            a.xMax = range[ 1 ];
        },

        setScale: function( range, domain ) {
            a.scaleValToCoord = f.scale( domain, range );
            a.scaleCoordToVal = f.scale( range, domain );
        },

        on: function( eventName, callback ) {
            event[ eventName ] = callback;
        },

        trigger: function( eventName, data ) {
            if ( event[ eventName ] ) { event[ eventName ].apply( null, data ); }
        },

        startSlide: function( e ) {
            f.reset();
            f.setMouseOffset( e );
            f.addDocumentEventHandlers();
            f.trigger( 'startSlide' );
        },

        scale: function( domain, range ) {
            var u = f.uninterpolateNumber( domain[ 0 ], domain[ 1 ] ),
                i = f.interpolateNumber( range[ 0 ], range[ 1 ] );

            return function( x ) {
                return i( u( x ) );
            };
        },

        uninterpolateNumber: function( a, b ) {
            b = b - ( a = + a ) ? 1 / ( b - a ) : 0;
            return function( x ) {
                return ( x - a ) * b;
            };
        },

        interpolateNumber: function( a, b ) {
            b -= a;
            return function( t ) {
                return a + b * t;
            };
        },

        addDocumentEventHandlers: function() {
            $( document.body ).bind({
                'mousemove.slider touchmove.slider': f.moveHandler,
                'mouseup.slider touchend.slider touchcancel.slider': f.removeDocumentEventHandlers
            });

            document.body.onselectstart = function() { return false; };
            document.ondragstart = function() { return false; };
        },

        moveVerticalHandler: function( e ) {
            var offset = f.getEventY( e ) - a.mouseOffset.y - a.sliderOffset.top,
                x = offset + a.tmpCoord;

            if ( a.xMin > x ) {
                x = a.xMin;
            } else if ( x > a.xMax ) {
                x = a.xMax;
            }

            f.trigger( 'move', [ x ] );
        },

        moveHorizontalHandler: function( e ) {
            var offset = f.getEventX( e ) - a.mouseOffset.x - a.sliderOffset.left,
                x = offset + a.tmpCoord;

            if ( a.xMin > x ) {
                x = a.xMin;
            } else if ( x > a.xMax ) {
                x = a.xMax;
            }

            f.trigger( 'move', [ x ] );
        },

        getEventX: function( e ) {
            if ( e.type && e.type.search( 'mouse' ) !== -1 ) {
                return e.pageX;
            } else {
                return ( e.originalEvent.changedTouches[ 0 ] || e.originalEventtargetTouches[ 0 ] ).pageX;
            }
        },

        getEventY: function( e ) {
            if ( e.type && e.type.search( 'mouse' ) !== -1 ) {
                return e.pageY;
            } else {
                return ( e.originalEvent.changedTouches[ 0 ] || e.originalEventtargetTouches[ 0 ] ).pageY;
            }
        },

        setValue: function( val ) {
            f.setCoord( a.scaleValToCoord( val ) );
        },

        getValue: function( x ) {
            return a.scaleCoordToVal( x ? x : f.getCoord() );
        },

        getX: function() {
            return a.el[ 0 ].offsetLeft;
        },

        getY: function() {
            return a.el[ 0 ].offsetTop;
        },

        setX: function( x ) {
            a.el[ 0 ].style.left = ( parseInt( x, 10 ) / props.getTotalWidth() ) * 100 + '%';
        },

        setY: function( y ) {
            a.el[ 0 ].style.top = ( parseInt( y, 10 ) / props.getTotalWidth() ) * 100 + '%';
        },

        setMouseOffset: function( e ) {
            a.sliderOffset = a.el.offset();
            a.tmpCoord     = f.getCoord();
            a.mouseOffset  = {
                x: f.getEventX( e ) - a.sliderOffset.left,
                y: f.getEventY( e ) - a.sliderOffset.top
            };
        },

        removeDocumentEventHandlers: function() {
            document.body.onselectstart = null;
            document.ondragstart = null;
            $( document.body ).unbind( 'mousemove.slider mouseup.slider touchmove.slider' );
            f.trigger( 'stopSlide' );
        }
    };

    f.cacheObjects();
    f.reset();

    return {
        el:         props.handle,
        on:         f.on,
        startSlide: f.startSlide,
        setValue:   f.setValue,
        getValue:   f.getValue,
        getCoord:   f.getCoord
    };
}

$.fn.islider = function( props ) {
    var item, instance;
    $( this ).each( function() {
        item = $( this );
        if ( item.data( 'islider' ) ) {
            console.log( 'islider already init', this );
        } else {
            instance = iSlider( item, props ? props : {} );
            item.data( 'islider', instance );
        }
    });

    return this;
};

})( jQuery, window, undefined );