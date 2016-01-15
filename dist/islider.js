'use strict';

(function ($, root, undefined) {
    // eslint-disable-line
    'use strict';

    var Utils = {
        getPageCoords: function getPageCoords(e) {
            if (e.originalEvent.changedTouches || e.originalEventtargetTouches) {
                var page = e.originalEvent.changedTouches[0] || e.originalEventtargetTouches[0];
                return {
                    left: page.pageX,
                    top: page.pageY
                };
            } else {
                return {
                    left: e.pageX,
                    top: e.pageY
                };
            }
        }
    };

    var Defaults = {
        islider: 'islider',
        left: 'islider__left',
        right: 'islider__right',
        slider: 'islider__slider',
        path: 'islider__path',
        box: 'islider__box',
        hover: 'islider_hover',
        active: 'islider_active',
        focus: 'islider_focus',
        hasAnim: 'islider_has_anim',
        orientation: 'horizontal',
        range: 'min',
        step: 1,
        generate: true,
        value: 0,
        domain: [0, 1],
        values: [0, 0],
        onSlide: function onSlide(value, values) {}
    };

    /* global Slider:true Utils:true Defaults:true */
    function iSlider(el, props) {
        //eslint-disable-line
        var a;
        var f;
        var defs = {};
        var event = {};
        var width;
        var metricType;
        var coordType;
        var isVertical = false;
        var isCrossing = false;
        var handleMetric;

        f = {
            on: function on(eventName, callback) {
                event[eventName] = callback;
                return f.interface;
            },

            trigger: function trigger(eventName, data) {
                if (event[eventName]) {
                    event[eventName].apply(null, data);
                }
            },

            init: function init() {
                f.interface = f.interface();
                f.extend();
                f.generate();
                f.cacheNodes();
                f.isVertical();
                f.setVars();
                f.setSetPathHandler();
                f.setSliders();
                f.isRangeSingle();
                f.setInitialData();
                f.bindEvents();
            },

            bindEvents: function bindEvents() {
                a.el.on('mousedown', f.onElClick);
                a.leftSl.on('move', f.onLeftMove);
                a.leftSl.on('stopSlide', f.onStopSlide);
                a.rightSl.on('move', f.onRightMove);
                a.rightSl.on('stopSlide', f.onStopSlide);
                a.slider.on('mousedown', f.onStartSlide);
                a.slider.on('touchstart', f.onStartSlide);
                a.slider.on('mouseenter', f.onHoverEl);
                a.slider.on('mouseleave', f.onUnhoverEl);
            },

            onElClick: function onElClick(e) {
                if ($(e.target).hasClass(defs.slider)) {
                    return;
                }

                f.freeRide(e);
            },

            getFreeRideData: function getFreeRideData(e) {
                var elOffset;
                var width;
                var mouseCoord;

                width = f.getWidth();
                elOffset = a.el.offset();
                mouseCoord = Utils.getPageCoords(e);
                mouseCoord = defs.orientation === 'horizontal' ? mouseCoord.left - elOffset.left : mouseCoord.top - elOffset.top;

                return {
                    width: width,
                    mouseCoord: mouseCoord
                };
            },

            rangeFreeRide: function rangeFreeRide(e) {
                var hasMoved = false;
                var coord;
                var width;
                var mouseCoord;
                var sliderLeft;
                var sliderRight;
                var distance;
                var data;

                f.cacheParams();

                data = f.getFreeRideData(e);
                width = data.width;
                mouseCoord = data.mouseCoord;
                sliderLeft = f.getLeft();
                sliderRight = f.getRight();

                if (mouseCoord < sliderLeft) {
                    coord = mouseCoord - handleMetric * 0.5;
                    coord = coord < 0 ? 0 : coord;
                    f.onLeftMove(coord);
                    hasMoved = true;
                } else if (mouseCoord > sliderRight + handleMetric) {
                    coord = mouseCoord - handleMetric * 1.5;
                    coord = coord > width ? width : coord;
                    f.onRightMove(coord);
                    hasMoved = true;
                } else {
                    distance = f.getDistance();
                    if (sliderLeft + handleMetric < mouseCoord && mouseCoord < sliderLeft + handleMetric + distance / 2) {
                        coord = mouseCoord - handleMetric * 0.5;
                        if (coord > sliderRight) {
                            coord = sliderRight;
                        }
                        f.onLeftMove(coord);
                        hasMoved = true;
                    } else {
                        coord = mouseCoord - handleMetric * 1.5;
                        if (coord < sliderLeft) {
                            coord = sliderLeft;
                        }
                        f.onRightMove(coord);
                        hasMoved = true;
                    }
                }

                if (hasMoved) {
                    f.triggerStopSlide();
                }
            },

            minMaxFreeRide: function minMaxFreeRide(e) {
                var data = f.getFreeRideData(e);
                var coord = data.mouseCoord - handleMetric * 0.5;

                coord = coord < 0 ? 0 : coord > data.width ? data.width : coord;
                f.onLeftMove(coord);
                f.triggerStopSlide();
            },

            onHoverEl: function onHoverEl() {
                $(this).addClass(defs.hover);
            },

            onUnhoverEl: function onUnhoverEl() {
                $(this).removeClass(defs.hover);
            },

            onStopSlide: function onStopSlide() {
                a.el.addClass(defs.hasAnim);
                a.actSl.el.removeClass(defs.active);
                f.triggerStopSlide();
            },

            onStartSlide: function onStartSlide(e) {
                if (e.target === a.leftSl.el[0]) {
                    a.actSl = a.leftSl;
                } else if (e.target === a.rightSl.el[0]) {
                    a.actSl = a.rightSl;
                }

                a.actSl.startSlide(e);
                a.el.removeClass(defs.hasAnim);
                a.actSl.el.addClass(defs.active);
                f.cacheParams();

                return false;
            },

            triggerStopSlide: function triggerStopSlide() {
                el.trigger('islider.stop-slide');
            },

            extend: function extend() {
                $.extend(true, defs, Defaults, props);
            },

            cacheParams: function cacheParams() {
                a.leftSl.pos = f.getLeft(true);
                a.rightSl.pos = f.getRight(true);
                width = f.getWidth(true);
            },

            cacheNodes: function cacheNodes() {
                el.addClass(defs.islider);

                a = {
                    actSl: null,
                    el: el,
                    slider: el.find('.' + defs.slider),
                    leftEl: el.find('.' + defs.left),
                    rightEl: el.find('.' + defs.right),
                    path: el.find('.' + defs.path),
                    box: el.find('.' + defs.box)
                };

                setTimeout(function () {
                    el.addClass(defs.hasAnim);
                }, 10);
            },

            setVars: function setVars() {
                isVertical = defs.orientation === 'vertical';
                metricType = isVertical ? 'height' : 'width';
                coordType = isVertical ? 'top' : 'left';
                handleMetric = a.leftEl[metricType]() || a.rightEl[metricType]();
                width = f.getWidth(true);

                if (isVertical) {
                    a.box.height(width);
                }
            },

            setSetPathHandler: function setSetPathHandler() {
                f.setPath = defs.range === true ? f.setRangePath : defs.range === 'min' ? f.setMinPath : f.setMaxPath;
            },

            getWidth: function getWidth(readEl) {
                if (!readEl) {
                    return width;
                }

                var param = isVertical ? el[0].offsetHeight : el[0].offsetWidth;

                return param - handleMetric * (defs.range === true ? 2 : 1);
            },

            isVertical: function isVertical() {
                if (defs.orientation === 'vertical') {
                    el.addClass('islider_vertical');
                } else {
                    el.addClass('islider_horizontal');
                }
            },

            isRangeSingle: function isRangeSingle() {
                if (defs.range === 'min') {
                    defs.values[1] = defs.value;
                    el.addClass('islider_min');
                    f.freeRide = f.minMaxFreeRide;
                } else if (defs.range === 'max') {
                    el.addClass('islider_max');
                    var hook = defs.orientation === 'horizontal' ? 'right' : 'bottom';
                    a.path[0].style[hook] = 0;
                    defs.values[0] = defs.value;
                    defs.values[1] = defs.domain[1];
                    f.freeRide = f.minMaxFreeRide;
                } else {
                    el.addClass('islider_range');
                    f.freeRide = f.rangeFreeRide;
                }
            },

            generate: function generate() {
                if (!defs.generate) {
                    return;
                }

                var box = $('<div>').addClass(defs.box).appendTo(el);
                $('<div>').addClass(defs.left).addClass(defs.slider).appendTo(box);
                $('<div>').addClass(defs.right).addClass(defs.slider).appendTo(box);
                $('<div>').addClass(defs.path).appendTo(box);
            },

            setSliders: function setSliders() {
                var props = {
                    orientation: defs.orientation,
                    domain: defs.domain,
                    step: defs.step,
                    getWidth: f.getWidth
                };

                a.leftSl = Slider(a.leftEl, props);
                a.rightSl = Slider(a.rightEl, props);
            },

            setInitialData: function setInitialData() {
                if (defs.range === true) {
                    a.leftSl.setValue(defs.values[0]);
                    a.rightSl.setValue(defs.values[1]);
                } else {
                    a.leftSl.setValue(defs.value);
                }

                f.cacheParams();
                f.setPath(f.getLeft(), f.getDistance());

                if (defs.range !== true) {
                    a.rightEl.hide();
                }
            },

            getLeft: function getLeft(readEl) {
                if (readEl) {
                    return a.leftSl.getCoord();
                } else {
                    return a.leftSl.pos;
                }
            },

            getRight: function getRight(readEl) {
                if (readEl) {
                    return a.rightSl.getCoord();
                } else {
                    return a.rightSl.pos;
                }
            },

            getDistance: function getDistance() {
                return f.getRight() - f.getLeft();
            },

            isLeftCrossing: function isLeftCrossing(x) {
                return x >= f.getRight();
            },

            isRightCrossing: function isRightCrossing(x) {
                return x <= f.getLeft();
            },

            onLeftMove: function onLeftMove(x) {
                f.leftMoveHandler(x);
                defs.onSlide(defs.values[0], defs.values, 'left');
            },

            onRightMove: function onRightMove(x) {
                f.rightMoveHandler(x);
                defs.onSlide(defs.values[1], defs.values, 'right');
            },

            leftMoveHandler: function leftMoveHandler(x) {
                var pathWidth = f.getRight() - x;
                defs.values[0] = a.leftSl.getValue(x);
                a.leftSl.setCoord(x);
                f.setPath(x, pathWidth < 0 ? 0 : pathWidth);

                if (defs.range === true) {
                    if (f.isLeftCrossing(x)) {
                        isCrossing = true;
                        a.rightSl.setCoord(x);
                        defs.values[1] = defs.values[0];
                    } else if (isCrossing) {
                        isCrossing = false;
                        a.rightSl.setCoord(a.rightSl.pos);
                        defs.values[1] = a.rightSl.getValue();
                    }
                }
            },

            rightMoveHandler: function rightMoveHandler(x) {
                defs.values[1] = a.rightSl.getValue(x);
                a.rightSl.setCoord(x);

                if (defs.range === true) {
                    if (f.isRightCrossing(x)) {
                        isCrossing = true;
                        a.leftSl.setCoord(x);
                        defs.values[0] = defs.values[1];
                        f.setPath(x, 0);
                    } else {
                        f.setPath(f.getLeft(), x - f.getLeft());
                        if (isCrossing) {
                            a.leftSl.setCoord(a.leftSl.pos);
                            defs.values[0] = a.leftSl.getValue();
                        }
                    }
                } else {
                    f.setPath(f.getLeft(), x - f.getLeft());
                }
            },

            setRangePath: function setRangePath(left, width) {
                a.path[0].style[metricType] = width / f.getWidth() * 100 + '%';
                a.path[0].style[coordType] = left / f.getWidth() * 100 + '%';
            },

            setMaxPath: function setMaxPath(left) {
                a.path[0].style[metricType] = 100 - left / f.getWidth() * 100 + '%';
            },

            setMinPath: function setMinPath(left) {
                a.path[0].style[metricType] = (left + handleMetric / 2) / f.getWidth() * 100 + '%';
            },

            leftVal: function leftVal(val) {
                if (typeof val === 'number') {
                    f.cacheParams();
                    f.leftMoveHandler(a.leftSl.scaleValToCoord(val));
                } else {
                    return a.leftSl.getValue();
                }
            },

            rightVal: function rightVal(val) {
                if (typeof val === 'number') {
                    f.cacheParams();
                    f.rightMoveHandler(a.rightSl.scaleValToCoord(val));
                } else {
                    return a.rightSl.getValue();
                }
            },

            interface: function _interface() {
                return {
                    on: f.on,
                    getDist: f.getDistance,
                    reset: f.setInitialData,
                    leftVal: f.leftVal,
                    rightVal: f.rightVal
                };
            }
        };

        f.init();

        return f.interface;
    }

    /* global Utils:true */
    function Slider(el, props) {
        //eslint-disable-line
        var events = {};
        var f;
        var range;
        var xMin;
        var xMax;
        var _scaleValToCoord;
        var _scaleCoordToVal;
        var sliderOffset;
        var tmpCoord;
        var mouseOffset;

        f = {
            moveHandler: function moveHandler() {},
            setCoord: function setCoord() {},

            getCoord: function getCoord(_getCoord) {
                if (props.step > 1) {
                    return function () {
                        return f.trimMouseValue(_getCoord());
                    };
                }

                return _getCoord;
            },

            init: function init() {
                f.cacheObjects();
                f.reset();
            },

            cacheObjects: function cacheObjects() {
                var isVertical = props.orientation === 'vertical';
                f.moveHandler = isVertical ? f.moveVerticalHandler : f.moveHorizontalHandler;
                f.setCoord = isVertical ? f.setY : f.setX;
                f.getCoord = f.getCoord(isVertical ? f.getY : f.getX);
            },

            reset: function reset() {
                range = [0, props.getWidth()];
                f.setRange(range);
                f.setScale(range, props.domain);
            },

            setRange: function setRange(range) {
                xMin = range[0];
                xMax = range[1];
            },

            setScale: function setScale(range, domain) {
                _scaleValToCoord = f.scale(domain, range);
                _scaleCoordToVal = f.scale(range, domain);
            },

            on: function on(eventName, callback) {
                events[eventName] = callback;
            },

            trigger: function trigger(eventName, data) {
                if (events[eventName]) {
                    events[eventName].apply(null, data);
                }
            },

            startSlide: function startSlide(e) {
                f.reset();
                f.setMouseOffset(e);
                f.addDocumentEventHandlers();
                f.trigger('startSlide');
            },

            scale: function scale(domain, range) {
                var u = f.uninterpolateNumber(domain[0], domain[1]);
                var i = f.interpolateNumber(range[0], range[1]);

                return function (x) {
                    return i(u(x));
                };
            },

            uninterpolateNumber: function uninterpolateNumber(a, b) {
                b = b - (a = +a) ? 1 / (b - a) : 0;
                return function (x) {
                    return (x - a) * b;
                };
            },

            interpolateNumber: function interpolateNumber(a, b) {
                b -= a;
                return function (t) {
                    return a + b * t;
                };
            },

            addDocumentEventHandlers: function addDocumentEventHandlers() {
                $(document.body).on({
                    'mousemove.slider touchmove.slider': f.moveHandler,
                    'mouseup.slider touchend.slider touchcancel.slider': f.removeDocumentEventHandlers
                });

                document.body.onselectstart = f.returnFalse;
                document.ondragstart = f.returnFalse;
            },

            returnFalse: function returnFalse() {
                return false;
            },

            trimMouseValue: function trimMouseValue(x) {
                var val = _scaleCoordToVal(x);
                var step = props.step > 0 ? props.step : 1;
                var valModStep = (val - range[0]) % step;
                var alignValue = val - valModStep;

                if (Math.abs(valModStep) * 2 >= step) {
                    alignValue += valModStep > 0 ? step : -step;
                }

                return _scaleValToCoord(alignValue);
            },

            getPosision: function getPosision(offset) {
                var x = offset + tmpCoord;

                if (props.step > 1) {
                    x = f.trimMouseValue(x);
                }

                if (xMin > x) {
                    x = xMin;
                } else if (x > xMax) {
                    x = xMax;
                }

                return x;
            },

            moveVerticalHandler: function moveVerticalHandler(e) {
                var offset = Utils.getPageCoords(e).top - mouseOffset.y - sliderOffset.top;
                f.trigger('move', [f.getPosision(offset)]);
            },

            moveHorizontalHandler: function moveHorizontalHandler(e) {
                var offset = Utils.getPageCoords(e).left - mouseOffset.x - sliderOffset.left;
                f.trigger('move', [f.getPosision(offset)]);
            },

            setValue: function setValue(val) {
                f.setCoord(_scaleValToCoord(val));
            },

            getValue: function getValue(x) {
                return _scaleCoordToVal(typeof x === 'number' ? x : f.getCoord());
            },

            getX: function getX() {
                return el[0].offsetLeft - parseInt(el.css('marginLeft'), 10);
            },

            getY: function getY() {
                return el[0].offsetTop - parseInt(el.css('marginTop'), 10);
            },

            setX: function setX(x) {
                el[0].style.left = parseInt(x, 10) / props.getWidth() * 100 + '%';
            },

            setY: function setY(y) {
                el[0].style.top = parseInt(y, 10) / props.getWidth() * 100 + '%';
            },

            setMouseOffset: function setMouseOffset(e) {
                sliderOffset = el.offset();
                tmpCoord = f.getCoord();
                mouseOffset = {
                    x: Utils.getPageCoords(e).left - sliderOffset.left,
                    y: Utils.getPageCoords(e).top - sliderOffset.top
                };
            },

            removeDocumentEventHandlers: function removeDocumentEventHandlers() {
                document.body.onselectstart = null;
                document.ondragstart = null;
                $(document.body).off('mousemove.slider mouseup.slider touchmove.slider');
                f.trigger('stopSlide');
            },

            scaleValToCoord: function scaleValToCoord(val) {
                return _scaleValToCoord(val);
            },

            scaleCoordToVal: function scaleCoordToVal(x) {
                return _scaleCoordToVal(x);
            }
        };

        f.init();

        return {
            el: el,
            pos: null,
            on: f.on,
            startSlide: f.startSlide,
            setValue: f.setValue,
            getValue: f.getValue,
            setCoord: f.setCoord,
            getCoord: f.getCoord,
            scaleValToCoord: f.scaleValToCoord,
            scaleCoordToVal: f.scaleCoordToVal
        };
    }

    $.fn.islider = function (props) {
        var item, instance;
        $(this).each(function () {
            item = $(this);
            if (item.data('islider')) {
                console.log('islider already init', this);
            } else {
                instance = iSlider(item, props ? props : {});
                item.data('islider', instance);
            }
        });

        return this;
    };
})(jQuery, window, undefined);