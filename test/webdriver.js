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

describe('Функциональные тесты для Islider', () => {
    beforeEach(() => {
        client = webdriver.remote(options);

        client.addCommand('mouse', function(selector, eventType, offsetLeft, offsetTop) {
            return this.execute(function(selector, eventType, offsetLeft, offsetTop) {
                evt = document.createEvent('MouseEvents');
                evt.initMouseEvent(eventType, true, true, window, 0, 0, 0, offsetLeft, offsetTop, false, false, false, false, 0, null);
                $(selector)[0].dispatchEvent(evt);
            }, selector, eventType, offsetLeft, offsetTop);
        });

        return client.init();
    });

    afterEach(() => {
        return client.end();
    });

    it('Клик по правой стороне от правого ползунка сдвигает его вправо', function() {
        let offsetOld;
        let offsetNew;

        return client
            .url(URL)
            .execute(() => {
                var el = $('.example-1 .islider__right').eq(0);

                return {
                    x: el.offset().left,
                    width: el.width()
                };
            })
            .then(function(res) {
                offsetOld = res.value.x;
                return this.mouse('.example-1', 'mousedown', res.value.x + res.value.width + 50, 0);
            })
            .pause(300)
            .execute(() => {
                return $('.example-1 .islider__right').eq(0).offset().left;
            })
            .then(res => {
                offsetNew = res.value;
                expect(offsetNew > offsetOld).to.be.true;
            });
    });

    it('Клик по левой стороне от правого ползунка сдвигает его влево', function() {
        let offsetOld;
        let offsetNew;

        return client
            .url(URL)
            .execute(() => {
                var el = $('.example-1 .islider__right').eq(0);

                return {
                    x: el.offset().left,
                    width: el.width()
                };
            })
            .then(function(res) {
                offsetOld = res.value.x;
                return this.mouse('.example-1', 'mousedown', res.value.x - 50, 0);
            })
            .pause(300)
            .execute(() => {
                return $('.example-1 .islider__right').eq(0).offset().left;
            })
            .then(res => {
                offsetNew = res.value;
                expect(offsetNew < offsetOld).to.be.true;
            });
    });

    it('Перемещение правого слайдера в левый край двигает соседний слайдер', () => {
        let data;

        return client
            .url(URL)
            .execute(function() {
                var el = $('.islider:eq(1)');
                var rightHandle = el.find( '.islider__right' );
    
                return {
                    elOffset: el.offset(),
                    rightHanleOffset: rightHandle.offset()
                };
            })
            .then(res => {
                data = res.value;
            })
            .then(function() {
                return this.mouse('.islider:eq(1) .islider__right', 'mousedown',data.rightHanleOffset.left + 5, data.rightHanleOffset.top + 5);
            })
            .then(function() {
                return this.mouse('.islider:eq(1)', 'mousemove', data.elOffset.left, data.elOffset.top);
            })
            .then(function() {
                return this.mouse('.islider:eq(1) .islider__right', 'mouseup', data.elOffset.left, data.elOffset.top);
            })
            .pause(300)
            .execute(() => {
                return {
                    leftPos: $('.islider:eq(1) .islider__left').position().left,
                    rightPos: $('.islider:eq(1) .islider__right').position().left,
                    leftValue: $('.islider:eq(1)').data().islider.leftVal(),
                    rightValue: $('.islider:eq(1)').data().islider.rightVal(),
                }
            })
            .then((res) => {
                expect(res.value.leftPos).to.equal(res.value.rightPos);
                expect(res.value.leftValue).to.equal(res.value.rightValue);
            })
    });

    it('Перемещение левого слайдера в правый край двигает соседний слайдер', () => {
        let offset;

        return client
            .url(URL)
            .execute(() => {
                return $('.islider:eq(1) .islider__left').offset();
            })
            .then(res => {
                offset = res.value;
            })
            .then(function() {
                return this.mouse('.islider:eq(1) .islider__left', 'mousedown', offset.left + 5, offset.top + 5);
            })
            .then(function() {
                return this.mouse('.islider:eq(1)', 'mousemove', offset.left + 405, offset.top + 5);
            })
            .then(function() {
                return this.mouse('.islider:eq(1) .islider__left', 'mouseup', offset.left + 405, offset.top + 5);
            })
            .pause(300)
            .execute(() => {
                return {
                    leftSlider: $('.islider:eq(1) .islider__left').position().left,
                    rightSlider: $('.islider:eq(1) .islider__right').position().left
                };
            })
            .then(res => {
                expect(res.value.leftSlider).to.equal(res.value.rightSlider);
            });
    });

    it('Клик по треку сдвигает левый ползунок вправо', function() {
        let offsetOld;
        let offsetNew;

        return client
            .url(URL)
            .execute(() => {
                var el = $('.example-1 .islider__left').eq(0);

                return {
                    x: el.offset().left,
                    width: el.width()
                };
            })
            .then(function(res) {
                offsetOld = res.value.x;
                return this.mouse('.example-1', 'mousedown', res.value.x + res.value.width + 50, 0);
            })
            .pause(300)
            .execute(() => {
                return $('.example-1 .islider__left').eq(0).offset().left;
            })
            .then(res => {
                offsetNew = res.value;
                expect(offsetNew).to.not.equal(offsetOld);
            });
    });

    it('Клик по левому краю трека сдвигает левый ползунок влево', function() {
        return client
            .url(URL)
            .mouse('.example-2', 'mousedown', 0, 0)
            .pause(300)
            .execute(() => {
                return $('.example-2 .islider__left').eq(0).position().left;
            })
            .then(res => {
                expect(res.value).to.equal(0);
            });
    });
});