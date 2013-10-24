function iSlider( el, props ) {
    var a, f, defs = {}, event = {}, width, metricType, coordType, isVertical = false, handleMetric;

    f = {
        on: function( eventName, callback ) {
            event[ eventName ] = callback;
            return f.interface;
        },

        trigger: function( eventName, data ) {
            if ( event[ eventName ] ) { event[ eventName ].apply( null, data ); }
        },

        init: function() {
            f.interface = f.interface();
            f.extend();
            f.generate();
            f.cacheNodes();
            f.setVars();
            f.setSetPathHandler();
            f.isVertical();
            f.setSliders();
            f.isRangeSingle();
            f.setInitialData();
            f.bindEvents();
        },

        bindEvents: function() {
            a.el.on( 'click',          f.onElClick    );
            a.leftSl.on( 'move',       f.onLeftMove   );
            a.leftSl.on( 'stopSlide',  f.onStopSlide  );
            a.rightSl.on( 'move',      f.onRightMove  );
            a.rightSl.on( 'stopSlide', f.onStopSlide  );
            a.slider.on( 'mousedown',  f.onStartSlide );
            a.slider.on( 'touchstart', f.onStartSlide );
            a.slider.on( 'mouseenter', f.onHoverEl    );
            a.slider.on( 'mouseleave', f.onUnhoverEl  );
        },

        onElClick: function( e ) {
            if ( $( e.target ).hasClass( defs.slider ) ) {
                return;
            }

            f.freeRide( e );
        },

        getFreeRideData: function( e ) {
            var elOffset, mouseLeft, mouseTop, width, mouseCoord;

            width      = f.getWidth();
            elOffset   = a.el.offset();
            mouseLeft  = Utils.getEventX( e ) - elOffset.left;
            mouseTop   = Utils.getEventY( e ) - elOffset.top;
            mouseCoord = defs.orientation === 'horizontal' ? mouseLeft : mouseTop;

            return {
                width: width,
                mouseCoord: mouseCoord
            }
        },

        rangeFreeRide: function( e ) {
            var coord, width, mouseCoord, sliderLeft, sliderRight, distance, data;

            f.cacheParams();

            data        = f.getFreeRideData( e );
            width       = data.width;
            mouseCoord  = data.mouseCoord;
            sliderLeft  = f.getLeft();            
            sliderRight = f.getRight();
            
            if ( mouseCoord < sliderLeft ) {
                coord = mouseCoord - handleMetric * 0.5;
                coord = coord < 0 ? 0 : coord;
                f.onLeftMove( coord );
            } else if ( mouseCoord > sliderRight + handleMetric ) {
                coord = mouseCoord - handleMetric * 1.5;
                coord = coord > width ? width : coord;
                f.onRightMove( coord );
            } else {
                distance = f.getDistance();
                if ( sliderLeft + handleMetric < mouseCoord && mouseCoord < sliderLeft + handleMetric + distance / 2 ) {
                    coord = mouseCoord - handleMetric * 0.5;
                    f.onLeftMove( coord );
                } else {
                    coord = mouseCoord - handleMetric * 1.5;
                    f.onRightMove( coord );
                }
            }
        },

        minMaxFreeRide: function( e ) {
            var data, coord;

            data  = f.getFreeRideData( e );
            coord = data.mouseCoord - handleMetric * 0.5;

            coord = coord < 0 ? 0 : coord > data.width ? data.width : coord;
            f.onLeftMove( coord );
        },

        onHoverEl: function() {
            $( this ).addClass( defs.hover );
        },

        onUnhoverEl: function() {
            $( this ).removeClass( defs.hover );
        },

        onStopSlide: function() {
            a.el.addClass( defs.hasAnim );
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

            a.el.removeClass( defs.hasAnim );
            a.actSl.el.addClass( defs.active );
            f.cacheParams();

            return false;
        },

        extend: function() {
            $.extend( true, defs, Defaults, props );
        },

        cacheParams: function() {
            a.leftSl.pos  = f.getLeft( true );
            a.rightSl.pos = f.getRight( true );
            width         = f.getWidth( true );
        },

        cacheNodes: function() {
            el.addClass( defs.islider );

            a = {
                actSl:   null,
                el:      el,
                slider:  el.find( '.' + defs.slider ),
                leftEl:  el.find( '.' + defs.left ),
                rightEl: el.find( '.' + defs.right ),
                path:    el.find( '.' + defs.path ),
                box:     el.find( '.' + defs.box )
            };

            setTimeout( function() {
                el.addClass( defs.hasAnim );
            }, 10 );
        },

        setVars: function() {
            isVertical   = defs.orientation === 'vertical';
            metricType   = isVertical ? 'height' : 'width';
            coordType    = isVertical ? 'top' : 'left';
            handleMetric = a.leftEl[ metricType ]() || a.rightEl[ metricType ]();
            width        = f.getWidth( true );
        },

        setSetPathHandler: function() {
            f.setPath = defs.range === true ? f.setRangePath : defs.range === 'min' ? f.setMinPath : f.setMaxPath;
        },

        getWidth: function( readEl ) {       
            if ( !readEl ) {
                return width;
            }

            if ( defs.orientation === 'vertical' ) {
                var param = el[ 0 ].offsetHeight;
            } else {
                var param = el[ 0 ].offsetWidth;
            }

            return param - handleMetric * ( defs.range === true ? 2 : 1 );
        },

        isVertical: function() {
            if ( defs.orientation === 'vertical' ) {
                el.addClass( 'islider_vertical' );
                a.box.height( f.getWidth() );
            } else {
                el.addClass( 'islider_horizontal' );
            }
        },

        isRangeSingle: function() {
            if ( defs.range === 'min' ) {
                defs.values[ 1 ] = defs.value;
                el.addClass( 'islider_min' );
                f.freeRide = f.minMaxFreeRide;
            } else if ( defs.range === 'max' ) {
                el.addClass( 'islider_max' );
                var hook = defs.orientation === 'horizontal' ? 'right' : 'bottom';
                a.path[ 0 ].style[ hook ] = 0;
                defs.values[ 0 ] = defs.value;
                defs.values[ 1 ] = defs.domain[ 1 ];
                f.freeRide = f.minMaxFreeRide;
            } else {
                el.addClass( 'islider_range' );
                f.freeRide = f.rangeFreeRide;
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
                orientation: defs.orientation,
                domain:      defs.domain,
                step:        defs.step,
                getWidth:    f.getWidth
            });

            a.rightSl = Slider( a.rightEl, {
                orientation: defs.orientation,
                domain:      defs.domain,
                step:        defs.step,
                getWidth:    f.getWidth
            });
        },

        setInitialData: function() {
            if ( defs.range === true ) {
                a.leftSl.setValue( defs.values[ 0 ] );
                a.rightSl.setValue( defs.values[ 1 ] );
            } else {
                a.leftSl.setValue( defs.value );
            }

            f.cacheParams();
            f.setPath( f.getLeft(), f.getDistance() );

            if ( defs.range !== true ) {
                a.rightEl.hide();
            }
        },

        getLeft: function( readEl ) {
            if ( readEl ) {
                return a.leftSl.getCoord();
            } else {
                return a.leftSl.pos;
            }
        },

        getRight: function( readEl ) {
            if ( readEl ) {
                return a.rightSl.getCoord();
            } else {
                return a.rightSl.pos;
            }
        },

        getDistance: function() {
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
            defs.onSlide( defs.values[ 0 ], defs.values, 'left' );
        },

        onRightMove: function( x ) {
            f.rightMoveHandler( x );
            defs.onSlide( defs.values[ 1 ], defs.values, 'right' );
        },

        leftMoveHandler: function( x ) {
            if ( defs.range === true ) {
                if ( f.isLeftCrossing( x ) ) {
                    x = f.getRight();
                    defs.values[ 0 ] = defs.values[ 1 ];
                } else {
                    defs.values[ 0 ] = a.leftSl.getValue( x );
                }
            } else {
                defs.values[ 0 ] = a.leftSl.getValue( x );
            }

            a.leftSl.setCoord( x );
            f.setPath( x, f.getRight() - x );
        },

        rightMoveHandler: function( x ) {
            if ( defs.range === true ) {
                if ( f.isRightCrossing( x ) ) {
                    x = f.getLeft();
                    defs.values[ 1 ] = defs.values[ 0 ];
                } else {
                    defs.values[ 1 ] = a.rightSl.getValue( x );
                }
            } else {
                defs.values[ 1 ] = a.rightSl.getValue( x );
            }
            
            a.rightSl.setCoord( x );
            f.setPath( f.getLeft(), x - f.getLeft() );
        },

        setRangePath: function( left, width ) {
            a.path[ 0 ].style[ metricType ] = ( width / f.getWidth() ) * 100 + '%';
            a.path[ 0 ].style[ coordType ]  = ( left  / f.getWidth() ) * 100 + '%';
        },

        setMaxPath: function( left ) {
            a.path[ 0 ].style[ metricType ] = 100 - ( left / f.getWidth() ) * 100 + '%';
        },

        setMinPath: function( left ) {
            a.path[ 0 ].style[ metricType ] = ( ( left + handleMetric / 2 ) / f.getWidth() ) * 100 + '%';
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
                getDist:  f.getDistance,
                reset:    f.setInitialData,
                leftVal:  f.leftVal,
                rightVal: f.rightVal
            };
        }
    };

    f.init();

    return f.interface;
}
