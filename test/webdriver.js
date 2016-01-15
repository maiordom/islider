'use strict';

const webdriver = require('webdriverio');
const expect = require('chai').expect;
const URL = 'http://localhost:3001/demo/';

const options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

let client;

describe('', function() {
    beforeEach(function() {
        client = webdriver.remote(options);
        return client.init();
    });

    afterEach(function() {
        return client.end();
    });

    it('', function() {
        return client
            .url(URL);
    });
});