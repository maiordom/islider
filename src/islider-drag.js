function Slider( el, props ) {
    var events = {}, f, range, xMin, xMax, scaleValToCoord, scaleCoordToVal,
        sliderOffset, tmpCoord, mouseOffset, parent;

    f = {
        moveHandler: function() {},
        setCoord: function() {},
        getCoord: function() {},

        init: function() {
            f.cacheObjects();
            f.reset();
        },

        cacheObjects: function() {
            parent = el.parent();
            f.moveHandler = props.orientation === 'vertical' ? f.moveVerticalHandler : f.moveHorizontalHandler;
            f.setCoord    = props.orientation === 'vertical' ? f.setY : f.setX;
            f.getCoord    = props.orientation === 'vertical' ? f.getY : f.getX;
        },

        reset: function() {
            range = [ 0, props.getWidth() ];
            f.setRange( range );
            f.setScale( range, props.domain );
        },

        setRange: function( range ) {
            xMin = range[ 0 ];
            xMax = range[ 1 ];
        },

        setScale: function( range, domain ) {
            scaleValToCoord = f.scale( domain, range );
            scaleCoordToVal = f.scale( range, domain );
        },

        on: function( eventName, callback ) {
            events[ eventName ] = callback;
        },

        trigger: function( eventName, data ) {
            if ( events[ eventName ] ) { events[ eventName ].apply( null, data ); }
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
            $( document.body ).on({
                'mousemove.slider touchmove.slider': f.moveHandler,
                'mouseup.slider touchend.slider touchcancel.slider': f.removeDocumentEventHandlers
            });

            document.body.onselectstart = f.returnNull;
            document.ondragstart = f.returnNull;
        },

        returnNull: function() {
            return false;
        },

        trimMouseValue: function( x ) {
            var val        = scaleCoordToVal( x ),
                step       = ( props.step > 0 ) ? props.step : 1,
                valModStep = ( val - range[ 0 ] ) % step,
                alignValue = val - valModStep;

            if ( Math.abs( valModStep ) * 2 >= step ) {
                alignValue += ( valModStep > 0 ) ? step : ( - step );
            }

            return scaleValToCoord( alignValue );
        },

        moveVerticalHandler: function( e ) {
            var offset = Utils.getPageCoords( e ).top - mouseOffset.y - sliderOffset.top,
                x = offset + tmpCoord;

            if ( props.step > 1 ) {
                x = f.trimMouseValue( x );
            }

            if ( xMin > x ) {
                x = xMin;
            } else if ( x > xMax ) {
                x = xMax;
            }

            f.trigger( 'move', [ x ] );
        },

        moveHorizontalHandler: function( e ) {
            var offset = Utils.getPageCoords( e ).left - mouseOffset.x - sliderOffset.left,
                x = offset + tmpCoord;

            if ( props.step > 1 ) {
                x = f.trimMouseValue( x );
            }

            if ( xMin > x ) {
                x = xMin;
            } else if ( x > xMax ) {
                x = xMax;
            }

            f.trigger( 'move', [ x ] );
        },

        setValue: function( val ) {
            f.setCoord( scaleValToCoord( val ) );
        },

        getValue: function( x ) {
            return scaleCoordToVal( typeof x === 'number' ? x : f.getCoord() );
        },

        getX: function() {
            return el[ 0 ].offsetLeft - parseInt( el.css( 'marginLeft' ), 10 );
        },

        getY: function() {
            return el[ 0 ].offsetTop - parseInt( el.css( 'marginTop' ), 10 );
        },

        setX: function( x ) {
            el[ 0 ].style.left = ( parseInt( x, 10 ) / props.getWidth() ) * 100 + '%';
        },

        setY: function( y ) {
            el[ 0 ].style.top = ( parseInt( y, 10 ) / props.getWidth() ) * 100 + '%';
        },

        setMouseOffset: function( e ) {
            sliderOffset = el.offset();
            tmpCoord     = f.getCoord();
            mouseOffset  = {
                x: Utils.getPageCoords( e ).left - sliderOffset.left,
                y: Utils.getPageCoords( e ).top - sliderOffset.top
            };
        },

        removeDocumentEventHandlers: function() {
            document.body.onselectstart = null;
            document.ondragstart = null;
            $( document.body ).off( 'mousemove.slider mouseup.slider touchmove.slider' );
            f.trigger( 'stopSlide' );
        }
    };

    f.init();

    return {        
        el:         el,
        pos:        null,
        on:         f.on,
        startSlide: f.startSlide,
        setValue:   f.setValue,
        getValue:   f.getValue,
        setCoord:   f.setCoord,
        getCoord:   f.getCoord
    };
}
