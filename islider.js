(function( $, root ) {

function iSlider( el, props ) {
    var a, f, defs, event = {}, metricType, coordType;

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
        coords:      [ 0, 0 ]
    };

    f = {
        on: function( event_name, callback ) {
            event[ event_name ] = callback;
            return f.interface();
        },

        trigger: function( event_name, data ) {
            event[ event_name ] ? event[ event_name ].apply( null, data ) : null;
        },

        init: function() {
            f.extend();
            f.cache();
            f.setSliders();
            f.isRangeSingle();
            f.setInitialData();
            f.bindEvents();
        },

        bindEvents: function() {            
            a.leftSl.on( 'move', f.onLeftMove );
            a.leftSl.on( 'stopSlide', f.onStopSlide );
            a.rightSl.on( 'move', f.onRightMove );
            a.rightSl.on( 'stopSlide', f.onStopSlide );

            a.slider.mousedown( f.onStartSlide );
            a.slider.mouseenter( f.onHoverEl );
            a.slider.mouseleave( f.onUnhoverEl );
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
        },

        extend: function() {
            $.extend( defs, props );
        },

        cache: function() {
            el.addClass( defs.islider );

            if ( defs.generate ) { f.generate() }

            a = {
                actSl:   null,
                slider:  el.find( '.' + defs.slider ),
                leftEl:  el.find( '.' + defs.left ),
                rightEl: el.find( '.' + defs.right ),
                path:    el.find( '.' + defs.path )
            };

            metricType      = defs.orientation === 'vertical' ? 'height' : 'width';
            coordType       = defs.orientation === 'vertical' ? 'top' : 'left';

            a.elOffset      = a.leftEl[ metricType ]() / 2;
            a.leftElMetric  = a.leftEl[ metricType ]();
            a.rightElMetric = a.rightEl[ metricType ]();

            f.setPath = defs.range !== true ? f.setRangeMinMaxPath : f.setPath;
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
            a.leftSl  = Slider( a.leftEl,  defs.orientation, defs.domain, [ 0, el[ metricType ]() - a.leftElMetric ] );
            a.rightSl = Slider( a.rightEl, defs.orientation, defs.domain, [ 0, el[ metricType ]() - a.rightElMetric ] );
        },

        setInitialData: function() {
            a.leftSl.setValue( defs.values[ 0 ] );
            a.rightSl.setValue( defs.values[ 1 ] );
            defs.coords[ 0 ] = a.leftSl.getCoord();
            defs.coords[ 1 ] = a.rightSl.getCoord();
            f.setPath();
            defs.range === 'min' ? a.leftEl.hide() : defs.range === 'max' ? a.rightEl.hide() : null;
        },

        getLeft: function() {
            return defs.coords[ 0 ];
        },

        getRight: function() {
            return defs.coords[ 1 ];
        },

        getWidth: function() {
            return f.getRight() - f.getLeft();
        },

        isLeftCrossing: function( x ) {
            return x >= defs.coords[ 1 ];
        },

        isRightCrossing: function( x ) {
            return x <= defs.coords[ 0 ];
        },

        onLeftMove: function( e, x ) {
            f.LeftMoveHandler( x );
            f.trigger( 'slide', [ defs.values[ 0 ], [ defs.values[ 0 ], defs.values[ 1 ] ] ] );
        },

        onRightMove: function( e, x ) {
            f.rightMoveHandler( x );
            f.trigger( 'slide', [ defs.values[ 1 ], [ defs.values[ 0 ], defs.values[ 1 ] ] ] );
        },

        LeftMoveHandler: function( x ) {
            x = parseInt( x );
            x = f.isLeftCrossing( x ) ? f.getRight() : x;
            defs.coords[ 0 ] = x;
            defs.values[ 0 ] = a.leftSl.getValue( x );
            f.moveToLeft( x );
            f.setPath();
        },

        rightMoveHandler: function( x ) {
            x = parseInt( x );
            x = f.isRightCrossing( x ) ? f.getLeft() : x;
            defs.coords[ 1 ] = x;
            defs.values[ 1 ] = a.rightSl.getValue( x );
            f.moveToRight( x );
            f.setPath();
        },

        setPath: function() {
            a.path[ 0 ].style[ metricType ] = f.getWidth() + 'px';
            a.path[ 0 ].style[ coordType ]  = f.getLeft()  + a.elOffset + 'px';
        },

        setRangeMinMaxPath: function() {
            a.path[ 0 ].style[ metricType ] = f.getWidth() + a.elOffset + 'px';
        },

        moveToLeft: function( x ) {
            a.leftEl[ 0 ].style[ coordType ] = x + 'px';
        },

        moveToRight: function( x ) {            
            a.rightEl[ 0 ].style[ coordType ] = x + 'px';
        },

        leftVal: function( val ) {
            a.leftSl.setValue( val );
            f.LeftMoveHandler( a.leftSl.getCoord() );
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

function Slider( el, orientation, domain, range ) {
    var a, event = $( {} ), f;

    f = {
        cacheObjects: function() {
            a = {
                el: el,
                xMin: range[ 0 ],
                xMax: range[ 1 ],
            };

            a.scaleValToCoord = f.scale( domain, range );
            a.scaleCoordToVal = f.scale( range, domain );
        },

        on: function( event_name, callback ) {
            event.on( event_name, callback );
        },

        trigger: function( event_name, data ) {
            event.trigger( event_name, data );
        },

        startSlide: function( e ) {
            f.setMouseOffset( e );
            f.addDocumentEventHandlers();
            f.trigger( 'startSlide' );
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
            }
        },

        scale: function( domain, range ) {
            var u = f.uninterpolateNumber( domain[ 0 ], domain[ 1 ] ),
                i = f.interpolateNumber( range[ 0 ], range[ 1 ] );

            return function( x ) {
                return i( u( x ) );
            };
        },

        addDocumentEventHandlers: function() {
            $( document.body ).bind({
                'mousemove.slider': f.moveHandler,
                'mouseup.slider': f.removeDocumentEventHandlers
            });

            document.body.onselectstart = function() { return false; };
            document.ondragstart = function() { return false; };
        },

        moveVerticalHandler: function( e ) {
            var offset = e.pageY - a.mouseOffset.y - a.sliderOffset.top,
                x = offset + a.tmpCoord;

            if ( a.xMin > x ) {
                x = a.xMin;
            } else if ( x > a.xMax ) {
                x = a.xMax;
            }

            f.trigger( 'move', [ x ] );
        },

        moveHorizontalHandler: function( e ) {
            var offset = e.pageX - a.mouseOffset.x - a.sliderOffset.left,
                x = offset + a.tmpCoord;

            if ( a.xMin > x ) {
                x = a.xMin;
            } else if ( x > a.xMax ) {
                x = a.xMax;
            }

            f.trigger( 'move', [ x ] );
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
            a.el[ 0 ].style.left = parseInt( x ) + 'px';
        },

        setY: function( y ) {
            a.el[ 0 ].style.top = parseInt( y ) + 'px';
        },

        setMouseOffset: function( e ) {
            a.sliderOffset = a.el.offset();
            a.tmpCoord = f.getCoord();

            a.mouseOffset = {
                x: e.pageX - a.sliderOffset.left,
                y: e.pageY - a.sliderOffset.top
            };
        },

        removeDocumentEventHandlers: function() {
            document.body.onselectstart = null;
            document.ondragstart = null;
            $( document.body ).unbind( 'mousemove.slider mouseup.slider' );
            f.trigger( 'stopSlide' );
        }
    };

    f.cacheObjects();
    f.moveHandler = orientation === 'vertical' ? f.moveVerticalHandler : f.moveHorizontalHandler;
    f.setCoord    = orientation === 'vertical' ? f.setY : f.setX;
    f.getCoord    = orientation === 'vertical' ? f.getY : f.getX;

    return {
        el: el,
        on: f.on,
        range: range,
        startSlide: f.startSlide,
        setValue: f.setValue,
        getValue: f.getValue,
        getCoord: f.getCoord
    };
}

$.fn.islider = function( props ) {
    var item, instance;
    $( this ).each( function() {
        item = $( this );
        if ( item.data( 'islider' ) ) {
            console.log( 'islider already init', this );
        } else {
            instance = iSlider( $( this ), props ? props : {} );
            item.data( 'islider', instance );
        }
    });

    return this;
};

})( jQuery, window );