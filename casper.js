var casper = require( 'casper' ).create(),
    url = 'examples/index.html';

casper.options.viewportSize = { width: 1024, height: 768 };

casper.test.begin( 'Islider', 4, function( test ) {

    casper.start( url );

    test1( test );
    test2( test );
    test3( test );
    test4( test );

    casper.then( function() {
        test.done();
    });

    casper.run();
});

function test1( test ) {
    var offsetOld, offsetNew;

    casper.then( function() {
        var data = casper.evaluate( function() {
            var el       = $( '.islider__left' ).eq( 0 ),
                elWidth  = el.width(),
                elHeight = el.height(),
                offsetEl = el.offset();

            return {
                startX: $( '.islider' ).eq( 0 ).offset().left,
                elWidth: elWidth,
                elHeight: elHeight,
                x: offsetEl.left,
                y: offsetEl.top
            };
        });

        offsetOld = data.x;
        this.page.sendEvent( 'click', data.x + data.elWidth + 50, data.y + data.elHeight / 2 );
    });

    casper.wait( 1000 );

    casper.then( function() {
        offsetNew = casper.evaluate( function() {
            return $( '.islider__left' ).eq( 0 ).offset().left;
        });
    });

    casper.then( function() {
        test.assert( offsetOld !== offsetNew, 'move left handler to right' );
    });
}

function test2( test ) {
    var pos;

    casper.then( function() {
        var data = this.evaluate( function() {
            var el       = $( '.islider' ).eq( 1 ),
                elWidth  = el.width(),
                elHeight = el.height(),
                offsetEl = el.offset();

            return {
                startX: el.offset().left,
                elWidth: elWidth,
                elHeight: elHeight,
                x: offsetEl.left,
                y: offsetEl.top
            };
        });

        this.page.sendEvent( 'click', data.startX + 1, data.y );
    });

    casper.wait( 1000 );

    casper.then( function() {
        var pos = this.evaluate( function() {
            return $( '.islider__left' ).eq( 1 ).position().left;
        });

        test.assert( pos === 0, 'move left handler to start point' );
    });
}

function test3( test ) {
    var posNew;
    casper.then( function() {
        var offset = this.evaluate( function() {
            return $( '.islider' ).eq( 1 ).find( '.islider__left' ).offset();
        });

        this.mouse.down( offset.left + 5, offset.top + 5 );
        this.mouse.move( offset.left + 400, offset.top );
        this.mouse.up( offset.left + 400, offset.top );

        var posLeft = this.evaluate( function() {
            return $( '.islider' ).eq( 1 ).find( '.islider__left' ).position().left;
        });

        var posRight = this.evaluate( function() {
            return $( '.islider' ).eq( 1 ).find( '.islider__right' ).position().left;
        });

        test.assert( posLeft === posRight, 'move left handler to max right position' );
    });
}

function test4( test ) {
    casper.then( function() {
        var data = this.evaluate( function() {
            var el = $( '.islider' ).eq( 1 ),
                rightHandle = el.find( '.islider__right' );

            return {
                elOffset: el.offset(),
                rightHanleOffset: rightHandle.offset()
            };
        });

        this.mouse.down( data.rightHanleOffset.left + 5, data.rightHanleOffset.top + 5 );
        this.mouse.move( data.elOffset.left, data.elOffset.top );
        this.mouse.up( data.elOffset.left, data.elOffset.top );

        var posLeft = this.evaluate( function() {
            return $( '.islider' ).eq( 1 ).find( '.islider__left' ).position().left;
        });

        var posRight = this.evaluate( function() {
            return $( '.islider' ).eq( 1 ).find( '.islider__right' ).position().left;
        });

        test.assert( posLeft === posRight, 'move right handler to max left position' );
    });
}