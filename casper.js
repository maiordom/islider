var casper = require( 'casper' ).create(),
    url = 'index.html';

casper.test.begin( 'Islider', 2, function( test ) {

    casper.start( url );

    test1( test );
    test2( test );

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
                old: offsetEl.left,
                x: offsetEl.left,
                y: offsetEl.top
            }
        });

        offsetOld = data.old;
        this.page.sendEvent( 'click', data.x + data.elWidth + 50, data.y + data.elHeight / 2 );
    });

    casper.wait( 1000 );

    casper.then( function() {
        offsetNew = casper.evaluate( function() {
            return $( '.islider__left' ).eq( 0 ).offset().left;
        });
    });

    casper.then( function() {
        test.assert( offsetOld !== offsetNew, 'move left slider' );
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

        test.assert( pos === 0, 'move to start' );
    });
}