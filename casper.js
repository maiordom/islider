var casper = require( 'casper' ).create();

casper.test.begin( 'Islider simple move', 1, function( test ) {
    var offsetOld, offsetNew;

    casper.start( 'index.html' );

    casper.then( function() {
        var data = casper.evaluate( function() {
            var el = $( '.islider__left' ).eq( 0 ),
                elWidth = el.width(),
                elHeight = el.height(),
                offsetEl = el.offset();

            return {
                left: offsetEl.left,
                x: offsetEl.left + elWidth + 50,
                y: offsetEl.top + elHeight / 2
            }
        });

        offsetOld = data.left;
        this.page.sendEvent( 'click', data.x, data.y );
    });

    casper.wait( 1000 );

    casper.then( function() {
        offsetNew = casper.evaluate( function() {
            return $( '.islider__left' ).eq( 0 ).offset().left;
        });
    });

    casper.then( function() {
        test.assert( offsetOld !== offsetNew );
        test.done();
    });

    casper.run();
});