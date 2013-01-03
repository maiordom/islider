(function( $, root ) {

function iSlider( el, props ) {
    var a, f, defs, event = {};

    defs = {
        islider:  "islider",
        empty:    "islider__empty",
        left:     "islider__left",
        right:    "islider__right",
        path:     "islider__path",
        generate: true,
        domain:   [ 0, 1 ],
        min: 0,
        max: 1
    };

    f = {
        on: function( event_name, callback ) {
            event[ event_name ] = callback;
        },

        trigger: function( event_name, data ) {
            event[ event_name ] ? event[ event_name ].apply( null, data ) : null;
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
            el.addClass( defs.islider );

            a = {
                leftEl:  el.find( defs.left ),
                rightEl: el.find( defs.right ),
                path:    el.find( defs.path )
            };

            a.leftElWidth  = a.leftEl.width();
            a.rightElWidth = a.rightEl.width();
        },

        generate: function() {
            el.addClass( defs.islider );

            a = {
                leftEl:  $( "<div>" ).addClass( defs.left ).appendTo( el ),
                rightEl: $( "<div>" ).addClass( defs.right ).appendTo( el ),
                path:    $( "<div>" ).addClass( defs.path ).appendTo( el )
            };

            a.leftElWidth  = a.leftEl.width();
            a.rightElWidth = a.rightEl.width();
        },

        setSliders: function() {
            a.leftSl  = Slider( a.leftEl,  el, defs.domain, [ - a.leftElWidth + 1, el.width() - a.leftElWidth ] );
            a.rightSl = Slider( a.rightEl, el, defs.domain, [ 0, el.width() - 1 ] );
        },

        setFirstlyData: function() {
            a.leftSl.setValue( defs.min );
            a.rightSl.setValue( defs.max );
            a.path[ 0 ].style.left = f.getLeft() + "px";
            a.path[ 0 ].style.width = f.getWidth() + "px";
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
            a.leftSl.on( "moveEnd", f.onLeftSlMoveEnd );
            a.rightSl.on( "move", f.onRightMove );
            a.rightSl.on( "moveEnd", f.onRightSlMoveEnd );
        },

        isLeftCrossing: function( x ) {
            return x + Math.abs( a.leftSl.range[ 0 ] ) >= f.getRight();
        },

        isRightCrossing: function( x ) {
            return f.getLeft() >= x;
        },

        onLeftSlMoveEnd: function() {
            f.trigger( "leftMoveEnd" );
        },

        onRightSlMoveEnd: function() {
            f.trigger( "rightMoveEnd" );
        },

        onLeftMove: function( val, x ) {
            x = parseInt( x );

            if ( !f.isLeftCrossing( x ) ) {
                a.leftEl[ 0 ].style.left = x + "px";
                a.path[ 0 ].style.left = f.getLeft() + "px";
                a.path[ 0 ].style.width = f.getWidth() + "px";
            } else {
                x = a.rightSl.getX() - a.rightElWidth + 1;
                a.leftEl[ 0 ].style.left = x + "px";
                a.path[ 0 ].style.width = "0px";
            }

            f.trigger( "setLeftValue", [ a.leftSl.getValue( x ), x ] );
        },

        onRightMove: function( val, x ) {
            x = parseInt( x );

            if ( !f.isRightCrossing( x ) ) {
                a.rightEl[ 0 ].style.left = x + "px";
                a.path[ 0 ].style.left = f.getLeft() + "px";
                a.path[ 0 ].style.width = f.getWidth() + "px";
            } else {
                x = a.leftSl.getX() + a.leftElWidth - 1;
                a.rightEl[ 0 ].style.left = x + "px";
                a.path[ 0 ].style.width = "0px";
            }

            f.trigger( "setRightValue", [ a.rightSl.getValue( x ), x ] );
        }
    };

    f.init();

    return {
        on: f.on,
        reset: f.setFirstlyData
    };
}

function Slider( el, ctx, domain, range ) {
    var a, event = {}, f;

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
            el[ 0 ].style.top = - el.height() + 1 + "px";
        },

        on: function( event_name, callback ) {
            event[ event_name ] = callback;
        },

        trigger: function( event_name, data ) {
            event[ event_name ] ? event[ event_name ].apply( null, data ) : null;
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

            f.trigger( "move", [ f.getValue(), moveX ] );
        },

        setValue: function( val ) {
            f.setPosition( a.scaleValToX( val ) );
        },

        getX: function() {
            return a.el[ 0 ].offsetLeft;
        },

        getValue: function( x ) {
            return a.scaleXToVal( x ? x : f.getX() );
        },

        setPosition: function( x ) {
            a.el[ 0 ].style.left = parseInt( x ) + "px";
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
            f.trigger( "moveEnd" );

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
    };
}

$.fn.islider = function( props ) {
    var item, instance;
    $( this ).each( function() {
        item = $( this );
        if ( item.data( "islider") ) {
            console.log( "islider already init", this );
        } else {
            instance = iSlider( $( this ), props ? props : {} );
            item.data( "islider", instance );
        }
    });

    return this;
};

})( jQuery, window );