(function( $, root, undefined ) {
    'use strict';

    function iSlider( el, props ) {
        var a, f, defs, event = {}, metricType, coordType, isVertical = false, handleMetric;

        defs = {
            islider:     'islider',
            left:        'islider__left',
            right:       'islider__right',
            slider:      'islider__slider',
            path:        'islider__path',
            box:         'islider__box',
            hover:       'islider_hover',
            active:      'islider_active',
            focus:       'islider_focus',
            orientation: 'horizontal',
            range:       'min',
            step:        1,
            generate:    true,
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
                f.generate();
                f.cache();
                f.setVars();
                f.setSetPathHandler();
                f.isVertical();
                f.setSliders();
                f.isRangeSingle();
                f.setInitialData();
                f.bindEvents();
            },

            bindEvents: function() {
                a.leftSl.on( 'move',       f.onLeftMove   );
                a.leftSl.on( 'stopSlide',  f.onStopSlide  );
                a.rightSl.on( 'move',      f.onRightMove  );
                a.rightSl.on( 'stopSlide', f.onStopSlide  );
                a.slider.on( 'mousedown',  f.onStartSlide );
                a.slider.on( 'touchstart', f.onStartSlide );
                a.slider.on( 'mouseenter', f.onHoverEl    );
                a.slider.on( 'mouseleave', f.onUnhoverEl  );
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
                if ( e.target === a.leftSl.el[ 0 ] ) {
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

                a = {
                    actSl:   null,
                    slider:  el.find( '.' + defs.slider ),
                    leftEl:  el.find( '.' + defs.left ),
                    rightEl: el.find( '.' + defs.right ),
                    path:    el.find( '.' + defs.path ),
                    box:     el.find( '.' + defs.box )
                };
            },

            setVars: function() {
                isVertical   = defs.orientation === 'vertical';
                metricType   = isVertical ? 'height' : 'width';
                coordType    = isVertical ? 'top' : 'left';
                handleMetric = a.leftEl[ metricType ]() || a.rightEl[ metricType ]();
            },

            setSetPathHandler: function() {
                f.setPath = defs.range === true ? f.setPath : defs.range === 'min' ? f.setMinPath : f.setMaxPath;
            },

            getTotalWidth: function() {
                if ( defs.orientation === 'vertical' ) {
                    return el[ 0 ].offsetHeight - handleMetric * ( defs.range === true ? 2 : 1 );
                } else {
                    return el[ 0 ].offsetWidth - handleMetric * ( defs.range === true ? 2 : 1 );
                }
            },

            isVertical: function() {
                if ( defs.orientation === 'vertical' ) {
                    el.addClass( 'islider_vertical' );
                    a.box.height( f.getTotalWidth() );
                } else {
                    el.addClass( 'islider_horizontal' );
                }
            },

            isRangeSingle: function() {
                if ( defs.range === 'min' ) {
                    defs.values[ 1 ] = defs.value;
                    el.addClass( 'islider_min' );
                } else if ( defs.range === 'max' ) {
                    el.addClass( 'islider_max' );
                    var hook = defs.orientation === 'horizontal' ? 'right' : 'bottom';
                    a.path[ 0 ].style[ hook ] = 0;
                    defs.values[ 0 ] = defs.value;
                    defs.values[ 1 ] = defs.domain[ 1 ];
                } else {
                    el.addClass( 'islider_range' );
                }
            },

            generate: function() {
                if ( !defs.generate ) { return; }

                var box = $( '<div>' ).addClass( defs.box ).appendTo( el );
                $( '<div>' ).addClass( defs.left ).addClass( defs.slider ).appendTo( box );
                $( '<div>' ).addClass( defs.right ).addClass( defs.slider ).appendTo( box );
                $( '<div>' ).addClass( defs.path ).appendTo( box );
            },

            setSliders: function() {
                a.leftSl = Slider( a.leftEl, {
                    orientation:   defs.orientation,
                    domain:        defs.domain,
                    step:          defs.step,
                    getTotalWidth: f.getTotalWidth,

                    getRange: function() {
                        return [ 0, f.getTotalWidth() ];
                    }
                });

                a.rightSl = Slider( a.rightEl, {
                    orientation:   defs.orientation,
                    domain:        defs.domain,
                    step:          defs.step,
                    getTotalWidth: f.getTotalWidth,

                    getRange: function() {
                        return [ 0, f.getTotalWidth() ];
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
                return x >= f.getRight();
            },

            isRightCrossing: function( x ) {
                return x <= f.getLeft();
            },

            onLeftMove: function( x ) {
                f.leftMoveHandler( x );
                defs.onSlide( defs.values[ 0 ], [ defs.values[ 0 ], defs.values[ 1 ] ], 'left' );
            },

            onRightMove: function( x ) {
                f.rightMoveHandler( x );
                defs.onSlide( defs.values[ 1 ], [ defs.values[ 0 ], defs.values[ 1 ] ], 'right' );
            },

            leftMoveHandler: function( x ) {
                if ( defs.range === true && f.isLeftCrossing( x ) ) {
                    x = f.getRight();
                    defs.values[ 0 ] = defs.values[ 1 ];
                } else {
                    defs.values[ 0 ] = a.leftSl.getValue( x );
                }
                a.leftSl.setCoord( x );
                f.setPath();
            },

            rightMoveHandler: function( x ) {
                if ( defs.range === true && f.isRightCrossing( x ) ) {
                    x = f.getLeft();
                    defs.values[ 1 ] = defs.values[ 0 ];
                } else {
                    defs.values[ 1 ] = a.rightSl.getValue( x );
                }
                a.rightSl.setCoord( x );
                f.setPath();
            },

            setPath: function() {
                a.path[ 0 ].style[ metricType ] = ( f.getWidth() / f.getTotalWidth() ) * 100 + '%';
                a.path[ 0 ].style[ coordType ]  = ( f.getLeft() / f.getTotalWidth() ) * 100 + '%';
            },

            setMaxPath: function() {
                a.path[ 0 ].style[ metricType ] = 100 - ( f.getLeft() / f.getTotalWidth() ) * 100 + '%';
            },

            setMinPath: function() {
                a.path[ 0 ].style[ metricType ] = ( ( f.getLeft() + handleMetric / 2 ) / f.getTotalWidth() ) * 100 + '%';
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
                range = props.getRange();
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
                var offset = f.getEventY( e ) - mouseOffset.y - sliderOffset.top,
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
                var offset = f.getEventX( e ) - mouseOffset.x - sliderOffset.left,
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
                el[ 0 ].style.left = ( parseInt( x, 10 ) / props.getTotalWidth() ) * 100 + '%';
            },

            setY: function( y ) {
                el[ 0 ].style.top = ( parseInt( y, 10 ) / props.getTotalWidth() ) * 100 + '%';
            },

            setMouseOffset: function( e ) {
                sliderOffset = el.offset();
                tmpCoord     = f.getCoord();
                mouseOffset  = {
                    x: f.getEventX( e ) - sliderOffset.left,
                    y: f.getEventY( e ) - sliderOffset.top
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
            on:         f.on,
            startSlide: f.startSlide,
            setValue:   f.setValue,
            getValue:   f.getValue,
            setCoord:   f.setCoord,
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