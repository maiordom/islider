(function( $, root ) {

function Tracker( el, props ) {
    var a, f, defs, event = $( {} );

    defs = {
        tracker:  "tracker",
        empty:    "tracker__empty",
        left:     "tracker__left",
        right:    "tracker__right",
        path:     "tracker__path",
        generate: true,
        domain:   [ 0, 1 ],
        min: 0,
        max: 1
    };

    f = {
        on: function( event_name, callback, ctx ) {
            event.bind( event_name, function() {
                callback.apply( ctx || callback, arguments );
            });
        },

        init: function() {
            f.extend();
            defs.generate ? f.generate() : f.cache();
            f.setSliders();
            f.setFirstlyData();
            f.bindEvents();
        },

        extend: function() {
            $.extend( defs, props );
        },

        cache: function() {
            el.addClass( defs.tracker );

            a = {
                leftEl:  el.find( defs.left ),
                rightEl: el.find( defs.right ),
                path:    el.find( defs.path )
            };
        },

        generate: function() {
            el.addClass( defs.tracker );

            a = {
                leftEl:  $( "<div>" ).addClass( defs.left ).appendTo( el ),
                rightEl: $( "<div>" ).addClass( defs.right ).appendTo( el ),
                path:    $( "<div>" ).addClass( defs.path ).appendTo( el )
            };
        },

        setSliders: function() {
            a.leftSl  = Slider( a.leftEl,  el, defs.domain, [ - a.leftEl.width() + 1, el.width() - a.leftEl.width() ] );
            a.rightSl = Slider( a.rightEl, el, defs.domain, [ 0, el.width() - 1 ] );
        },

        setFirstlyData: function() {
            a.leftSl.setValue( defs.min );
            a.rightSl.setValue( defs.max );
            a.path.css( "left", f.getLeft() );
            a.path.width( f.getWidth() )
        },

        getLeft: function() {
            return a.leftSl.getX() + Math.abs( a.leftSl.range[ 0 ] );
        },

        getRight: function() {
            return a.rightSl.getX();
        },

        getWidth: function() {
            return f.getRight() - f.getLeft() + 1;
        },
        
        bindEvents: function() {
            a.leftSl.on( "move", f.onLeftMove );
            a.rightSl.on( "move", f.onRightMove );
        },

        isLeftCrossing: function( x ) {
            return x + Math.abs( a.leftSl.range[ 0 ] ) >= f.getRight();
        },

        isRightCrossing: function( x ) {
            return f.getLeft() >= x;
        },

        onLeftMove: function( e, val, x ) {
            x = parseInt( x );

            if ( !f.isLeftCrossing( x ) ) {
                a.leftEl.css( "left", x );
                a.path.css( "left", f.getLeft() );
                a.path.width( f.getWidth() );
            } else {
                x = a.rightSl.getX() - a.rightEl.width() + 1;
                a.leftEl.css( "left", x );
                a.path.width( 0 );
            }

            event.trigger( "setLeftValue", [ a.leftSl.getValue( x ), x ] );
        },

        onRightMove: function( e, val, x ) {
            x = parseInt( x );

            if ( !f.isRightCrossing( x ) ) {
                a.rightEl.css( "left", x );
                a.path.width( f.getWidth() );
            } else {
                x = a.leftSl.getX() + a.leftEl.width() - 1;
                a.rightEl.css( "left", x );
                a.path.width( 0 );
            }

            event.trigger( "setRightValue", [ a.rightSl.getValue( x ), x ] );
        }
    };

    f.init();

    return {
        on: f.on
    };
}

function Slider( el, ctx, domain, range ) {
    var a, event = $( {} ), f;

    f = {
        cacheObjects: function() {
            a = {
                el: el,
                xMin: range[ 0 ],
                xMax: range[ 1 ],
                isActive: false
            };

            a.scaleValToX = f.scale( domain, range );
            a.scaleXToVal = f.scale( range, domain );
            a.moveOffsetX = a.xMin;
            el.css( { top: - el.height() + 1 } );
        },

        on: function( event_name, callback, ctx ) {
            event.bind( event_name, function() {
                callback.apply( ctx || callback, arguments );
            });
        },

        bindEvents: function() {
            a.el.mousedown( f.onStartSlide );
        },

        onStartSlide: function( e ) {
            f.setMouseOffset( e );
            f.addDocumentEventHandlers();
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

        addDocumentEventHandlers: function()
        {
            $( document.body ).bind({
                "mousemove.slider": f.moveHandler,
                "mouseup.slider": f.removeDocumentEventHandlers
            });

            a.isActive = true;
            document.body.onselectstart = function() { return false; };
            document.ondragstart = function() { return false; };
        },

        moveHandler: function( e ) {
            var moveOffsetX = e.pageX - a.mouseOffset.x - a.sliderOffset.left,
                moveX = moveOffsetX + a.tmpX;

            if ( a.xMin > moveX ) {
                moveX = a.xMin;
            } else if ( moveX > a.xMax ) {
                moveX = a.xMax;
            }

            event.trigger( "move", [ f.getValue(), moveX ] );
        },

        setValue: function( val ) {
            f.setPosition( a.scaleValToX( val ) );
        },

        getX: function() {
            return a.el.position().left;
        },

        getValue: function( x ) {
            return a.scaleXToVal( x ? x : f.getX() );
        },

        setPosition: function( x ) {
            a.el.css( "left", parseInt( x ) );
        },

        setMouseOffset: function( e ) {
            a.sliderOffset = a.el.offset();
            a.tmpX = f.getX();

            a.mouseOffset = {
                x: e.pageX - a.sliderOffset.left,
                y: e.pageY - a.sliderOffset.top
            };
        },

        removeDocumentEventHandlers: function() {
            a.isActive = false;
            document.body.onselectstart = null;
            document.ondragstart = null;

            $( document.body ).unbind( "mousemove.slider mouseup.slider" );
        }
    };

    f.cacheObjects();
    f.bindEvents();

    return {
        on: f.on,
        setValue: f.setValue,
        getValue: f.getValue,
        getX: f.getX,
        range: range
    }
};

$.fn.tracker = function( props ) {
    var item, instance;
    $( this ).each( function() {
        item = $( this );
        if ( item.data( "tracker") ) {
            console.log( "tracker already init", this );
        } else {
            instance = Tracker( $( this ), props ? props : {} );
            item.data( "tracker", instance );
        }
    });

    return this;
};

})( jQuery, window );