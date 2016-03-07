'use strict';

/* eslint no-unused-vars: 0 */
/* global IsliderControl */
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

    var ns = 'islider';

    var Defaults = {
        islider: '' + ns,
        left: ns + '__left',
        right: ns + '__right',
        slider: ns + '__slider',
        path: ns + '__path',
        box: ns + '__box',
        hover: ns + '_hover',
        active: ns + '_active',
        focus: ns + '_focus',
        hasAnim: ns + '_has_anim',
        orientation: 'horizontal',
        range: 'min',
        step: 1,
        generate: true,
        value: 0,
        domain: [0, 1],
        values: [0, 0],
        onSlide: function onSlide(value, values) {}
    };

    /* global IsliderDrag:true Utils:true Defaults:true */
    function IsliderControl(element, properties) {
        this.element = element;
        this.properties = properties || {};
        this.freeRide = function () {};
        this.setPath = function () {};
        this.options = {};
        this.events = {};
        this.path = null;
        this.box = null;
        this.slider = null;
        this.leftElement = null;
        this.rightElement = null;
        this.elementWidth = null;
        this.handleMetric = null;
        this.metricType = null;
        this.coordType = null;
        this.interface = null;
        this.leftSlider = null;
        this.rightSlider = null;
        this.activeSlider = null;
        this.isVertical = false;
        this.isCrossing = false;

        this.init();
        return this.interface;
    }

    IsliderControl.prototype = {
        on: function on(eventName, callback) {
            this.events[eventName] = callback;
            return this.interface;
        },
        trigger: function trigger(eventName, data) {
            if (this.events[eventName]) {
                this.events[eventName].apply(null, data);
            }
        },
        init: function init() {
            this.interface = this.getInterface();
            this.extend();
            this.generate();
            this.cacheNodes();
            this.checkIsVertical();
            this.setVars();
            this.setSetPathHandler();
            this.setSliders();
            this.isRangeSingle();
            this.setInitialData();
            this.bindEvents();
        },
        bindEvents: function bindEvents() {
            this.element.on('mousedown', this.onElementClick.bind(this));
            this.leftSlider.on('move', this.onLeftMove.bind(this));
            this.leftSlider.on('stopSlide', this.onStopSlide.bind(this));
            this.rightSlider.on('move', this.onRightMove.bind(this));
            this.rightSlider.on('stopSlide', this.onStopSlide.bind(this));
            this.slider.on('mousedown', this.onStartSlide.bind(this));
            this.slider.on('touchstart', this.onStartSlide.bind(this));
            this.slider.on('mouseenter', this.onHoverElement.bind(this));
            this.slider.on('mouseleave', this.onUnhoverElement.bind(this));
        },
        onElementClick: function onElementClick(e) {
            if ($(e.target).hasClass(this.options.slider)) {
                return;
            }

            this.freeRide(e);
        },
        getFreeRideData: function getFreeRideData(e) {
            var width = this.getWidth();
            var elementOffset = this.element.offset();
            var mouseCoord = Utils.getPageCoords(e);

            mouseCoord = this.options.orientation === 'horizontal' ? mouseCoord.left - elementOffset.left : mouseCoord.top - elementOffset.top;

            return {
                width: width,
                mouseCoord: mouseCoord
            };
        },
        rangeFreeRide: function rangeFreeRide(e) {
            var hasMoved = false;
            var coord = void 0;
            var distance = void 0;

            this.cacheParams();

            var data = this.getFreeRideData(e);
            var width = data.width;
            var mouseCoord = data.mouseCoord;
            var sliderLeft = this.getLeft();
            var sliderRight = this.getRight();

            if (mouseCoord < sliderLeft) {
                coord = mouseCoord - this.handleMetric * 0.5;
                coord = coord < 0 ? 0 : coord;
                this.onLeftMove(coord);
                hasMoved = true;
            } else if (mouseCoord > sliderRight + this.handleMetric) {
                coord = mouseCoord - this.handleMetric * 1.5;
                coord = coord > width ? width : coord;
                this.onRightMove(coord);
                hasMoved = true;
            } else {
                distance = this.getDistance();
                if (sliderLeft + this.handleMetric < mouseCoord && mouseCoord < sliderLeft + this.handleMetric + distance / 2) {
                    coord = mouseCoord - this.handleMetric * 0.5;
                    if (coord > sliderRight) {
                        coord = sliderRight;
                    }
                    this.onLeftMove(coord);
                    hasMoved = true;
                } else {
                    coord = mouseCoord - this.handleMetric * 1.5;
                    if (coord < sliderLeft) {
                        coord = sliderLeft;
                    }
                    this.onRightMove(coord);
                    hasMoved = true;
                }
            }

            if (hasMoved) {
                this.triggerStopSlide();
            }
        },
        minMaxFreeRide: function minMaxFreeRide(e) {
            var data = this.getFreeRideData(e);
            var coord = data.mouseCoord - this.handleMetric * 0.5;

            coord = coord < 0 ? 0 : coord > data.width ? data.width : coord;

            this.onLeftMove(coord);
            this.triggerStopSlide();
        },
        onHoverElement: function onHoverElement(e) {
            $(e.target).addClass(this.options.hover);
        },
        onUnhoverElement: function onUnhoverElement(e) {
            $(e.target).removeClass(this.options.hover);
        },
        onStopSlide: function onStopSlide() {
            this.element.addClass(this.options.hasAnim);
            this.activeSlider.element.removeClass(this.options.active);
            this.triggerStopSlide();
        },
        onStartSlide: function onStartSlide(e) {
            if (e.target === this.leftSlider.element[0]) {
                this.activeSlider = this.leftSlider;
            } else if (e.target === this.rightSlider.element[0]) {
                this.activeSlider = this.rightSlider;
            }

            this.activeSlider.startSlide(e);
            this.element.removeClass(this.options.hasAnim);
            this.activeSlider.element.addClass(this.options.active);
            this.cacheParams();

            return false;
        },
        triggerStopSlide: function triggerStopSlide() {
            this.element.trigger('islider.stop-slide');
        },
        extend: function extend() {
            $.extend(true, this.options, Defaults, this.properties);
        },
        cacheParams: function cacheParams() {
            this.leftSlider.position = this.getLeft(true);
            this.rightSlider.position = this.getRight(true);
            this.elementWidth = this.getWidth(true);
        },
        cacheNodes: function cacheNodes() {
            this.element.addClass(this.options.islider);
            this.slider = this.element.find('.' + this.options.slider);
            this.leftElement = this.element.find('.' + this.options.left);
            this.rightElement = this.element.find('.' + this.options.right);
            this.path = this.element.find('.' + this.options.path);
            this.box = this.element.find('.' + this.options.box);

            setTimeout(function () {
                this.element.addClass(this.options.hasAnim);
            }.bind(this), 10);
        },
        setVars: function setVars() {
            this.isVertical = this.options.orientation === 'vertical';
            this.metricType = this.isVertical ? 'height' : 'width';
            this.coordType = this.isVertical ? 'top' : 'left';
            this.handleMetric = this.leftElement[this.metricType]() || this.rightElement[this.metricType]();
            this.elementWidth = this.getWidth(true);

            if (this.isVertical) {
                this.box.height(this.elementWidth);
            }
        },
        setSetPathHandler: function setSetPathHandler() {
            this.setPath = this.options.range === true ? this.setRangePath : this.options.range === 'min' ? this.setMinPath : this.setMaxPath;
        },
        getWidth: function getWidth(readEl) {
            if (!readEl) {
                return this.elementWidth;
            }

            var param = this.isVertical ? this.element[0].offsetHeight : this.element[0].offsetWidth;

            return param - this.handleMetric * (this.options.range === true ? 2 : 1);
        },
        checkIsVertical: function checkIsVertical() {
            if (this.options.orientation === 'vertical') {
                this.element.addClass('islider_vertical');
            } else {
                this.element.addClass('islider_horizontal');
            }
        },
        isRangeSingle: function isRangeSingle() {
            if (this.options.range === 'min') {
                this.options.values[1] = this.options.value;
                this.element.addClass('islider_min');
                this.freeRide = this.minMaxFreeRide;
            } else if (this.options.range === 'max') {
                this.element.addClass('islider_max');
                var hook = this.options.orientation === 'horizontal' ? 'right' : 'bottom';
                this.path[0].style[hook] = 0;
                this.options.values[0] = this.options.value;
                this.options.values[1] = this.options.domain[1];
                this.freeRide = this.minMaxFreeRide;
            } else {
                this.element.addClass('islider_range');
                this.freeRide = this.rangeFreeRide;
            }
        },
        generate: function generate() {
            if (!this.options.generate) {
                return;
            }

            var box = $('<div>').addClass(this.options.box).appendTo(this.element);
            $('<div>').addClass(this.options.left).addClass(this.options.slider).appendTo(box);
            $('<div>').addClass(this.options.right).addClass(this.options.slider).appendTo(box);
            $('<div>').addClass(this.options.path).appendTo(box);
        },
        setSliders: function setSliders() {
            var props = {
                orientation: this.options.orientation,
                domain: this.options.domain,
                step: this.options.step,
                getWidth: this.getWidth.bind(this)
            };

            this.leftSlider = new IsliderDrag(this.leftElement, props);
            this.rightSlider = new IsliderDrag(this.rightElement, props);
        },
        setInitialData: function setInitialData() {
            if (this.options.range === true) {
                this.leftSlider.setValue(this.options.values[0]);
                this.rightSlider.setValue(this.options.values[1]);
            } else {
                this.leftSlider.setValue(this.options.value);
            }

            this.cacheParams();
            this.setPath(this.getLeft(), this.getDistance());

            if (this.options.range !== true) {
                this.rightElement.hide();
            }
        },
        getLeft: function getLeft(readElement) {
            if (readElement) {
                return this.leftSlider.getCoord();
            } else {
                return this.leftSlider.position;
            }
        },
        getRight: function getRight(readElement) {
            if (readElement) {
                return this.rightSlider.getCoord();
            } else {
                return this.rightSlider.position;
            }
        },
        getDistance: function getDistance() {
            return this.getRight() - this.getLeft();
        },
        isLeftCrossing: function isLeftCrossing(x) {
            return x >= this.getRight();
        },
        isRightCrossing: function isRightCrossing(x) {
            return x <= this.getLeft();
        },
        onLeftMove: function onLeftMove(x) {
            this.leftMoveHandler(x);
            this.options.onSlide(this.options.values[0], this.options.values, 'left');
        },
        onRightMove: function onRightMove(x) {
            this.rightMoveHandler(x);
            this.options.onSlide(this.options.values[1], this.options.values, 'right');
        },
        leftMoveHandler: function leftMoveHandler(x) {
            var pathWidth = this.getRight() - x;
            this.options.values[0] = this.leftSlider.getValue(x);
            this.leftSlider.setCoord(x);
            this.setPath(x, pathWidth < 0 ? 0 : pathWidth);

            if (this.options.range === true) {
                if (this.isLeftCrossing(x)) {
                    this.isCrossing = true;
                    this.rightSlider.setCoord(x);
                    this.options.values[1] = this.options.values[0];
                } else if (this.isCrossing) {
                    this.isCrossing = false;
                    this.rightSlider.setCoord(this.rightSlider.position);
                    this.options.values[1] = this.rightSlider.getValue();
                }
            }
        },
        rightMoveHandler: function rightMoveHandler(x) {
            this.options.values[1] = this.rightSlider.getValue(x);
            this.rightSlider.setCoord(x);

            if (this.options.range === true) {
                if (this.isRightCrossing(x)) {
                    this.isCrossing = true;
                    this.leftSlider.setCoord(x);
                    this.options.values[0] = this.options.values[1];
                    this.setPath(x, 0);
                } else {
                    this.setPath(this.getLeft(), x - this.getLeft());
                    if (this.isCrossing) {
                        this.leftSlider.setCoord(this.leftSlider.position);
                        this.options.values[0] = this.leftSlider.getValue();
                    }
                }
            } else {
                this.setPath(this.getLeft(), x - this.getLeft());
            }
        },
        setRangePath: function setRangePath(left, width) {
            this.path[0].style[this.metricType] = width / this.getWidth() * 100 + '%';
            this.path[0].style[this.coordType] = left / this.getWidth() * 100 + '%';
        },
        setMaxPath: function setMaxPath(left) {
            this.path[0].style[this.metricType] = 100 - left / this.getWidth() * 100 + '%';
        },
        setMinPath: function setMinPath(left) {
            this.path[0].style[this.metricType] = (left + this.handleMetric / 2) / this.getWidth() * 100 + '%';
        },
        leftVal: function leftVal(val) {
            if (typeof val === 'number') {
                this.cacheParams();
                this.leftMoveHandler(this.leftSlider.scaleValToCoord(val));
            } else {
                return this.leftSlider.getValue();
            }
        },
        rightVal: function rightVal(val) {
            if (typeof val === 'number') {
                this.cacheParams();
                this.rightMoveHandler(this.rightSlider.scaleValToCoord(val));
            } else {
                return this.rightSlider.getValue();
            }
        },
        getInterface: function getInterface() {
            return {
                on: this.on.bind(this),
                getDist: this.getDistance.bind(this),
                reset: this.setInitialData.bind(this),
                leftVal: this.leftVal.bind(this),
                rightVal: this.rightVal.bind(this)
            };
        }
    };

    /* global Utils:true */
    function IsliderDrag(element, properties) {
        this.element = element;
        this.properties = properties;
        this.moveHandler = function () {};
        this.setCoord = function () {};
        this.events = {};
        this.position = null;
        this.range = null;
        this.xMin = null;
        this.xMax = null;
        this.sliderOffset = null;
        this.mouseOffset = null;
        this.tmpCoord = null;
        this.scaleValToCoord = function () {};
        this.scaleCoordToVal = function () {};

        this.init();
    };

    IsliderDrag.prototype = {
        getCoord: function getCoord(_getCoord) {
            var _this = this;

            if (this.properties.step > 1) {
                return function () {
                    return _this.trimMouseValue(_getCoord());
                };
            }

            return _getCoord;
        },
        init: function init() {
            this.cacheObjects();
            this.reset();
        },
        cacheObjects: function cacheObjects() {
            var isVertical = this.properties.orientation === 'vertical';
            this.moveHandler = isVertical ? this.moveVerticalHandler : this.moveHorizontalHandler;
            this.setCoord = isVertical ? this.setY : this.setX;
            this.getCoord = this.getCoord(isVertical ? this.getY : this.getX);
        },
        reset: function reset() {
            this.range = [0, this.properties.getWidth()];
            this.setRange(this.range);
            this.setScale(this.range, this.properties.domain);
        },
        setRange: function setRange(range) {
            this.xMin = range[0];
            this.xMax = range[1];
        },
        setScale: function setScale(range, domain) {
            this.scaleValToCoord = this.scale(domain, range);
            this.scaleCoordToVal = this.scale(range, domain);
        },
        on: function on(eventName, callback) {
            this.events[eventName] = callback;
        },
        trigger: function trigger(eventName, data) {
            if (this.events[eventName]) {
                this.events[eventName].apply(null, data);
            }
        },
        startSlide: function startSlide(e) {
            this.reset();
            this.setMouseOffset(e);
            this.addDocumentEventHandlers();
            this.trigger('startSlide');
        },
        scale: function scale(domain, range) {
            var u = this.uninterpolateNumber(domain[0], domain[1]);
            var i = this.interpolateNumber(range[0], range[1]);

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
            var that = this;

            $(document.body).on({
                'mousemove.slider touchmove.slider': function mousemoveSliderTouchmoveSlider() {
                    that.moveHandler.apply(that, arguments);
                },
                'mouseup.slider touchend.slider touchcancel.slider': function mouseupSliderTouchendSliderTouchcancelSlider() {
                    that.removeDocumentEventHandlers.apply(that, arguments);
                }
            });

            document.body.onselectstart = this.returnFalse;
            document.ondragstart = this.returnFalse;
        },
        returnFalse: function returnFalse() {
            return false;
        },
        trimMouseValue: function trimMouseValue(x) {
            var val = this.scaleCoordToVal(x);
            var step = this.properties.step > 0 ? this.properties.step : 1;
            var valModStep = (val - this.range[0]) % step;
            var alignValue = val - valModStep;

            if (Math.abs(valModStep) * 2 >= step) {
                alignValue += valModStep > 0 ? step : -step;
            }

            return this.scaleValToCoord(alignValue);
        },
        getPosision: function getPosision(offset) {
            var x = offset + this.tmpCoord;

            if (this.properties.step > 1) {
                x = this.trimMouseValue(x);
            }

            if (this.xMin > x) {
                x = this.xMin;
            } else if (x > this.xMax) {
                x = this.xMax;
            }

            return x;
        },
        moveVerticalHandler: function moveVerticalHandler(e) {
            var offset = Utils.getPageCoords(e).top - this.mouseOffset.y - this.sliderOffset.top;
            this.trigger('move', [this.getPosision(offset)]);
        },
        moveHorizontalHandler: function moveHorizontalHandler(e) {
            var offset = Utils.getPageCoords(e).left - this.mouseOffset.x - this.sliderOffset.left;
            this.trigger('move', [this.getPosision(offset)]);
        },
        setValue: function setValue(val) {
            this.setCoord(this.scaleValToCoord(val));
        },
        getValue: function getValue(x) {
            return this.scaleCoordToVal(typeof x === 'number' ? x : this.getCoord());
        },
        getX: function getX() {
            return this.element[0].offsetLeft - parseInt(this.element.css('marginLeft'), 10);
        },
        getY: function getY() {
            return this.element[0].offsetTop - parseInt(this.element.css('marginTop'), 10);
        },
        setX: function setX(x) {
            this.element[0].style.left = parseInt(x, 10) / this.properties.getWidth() * 100 + '%';
        },
        setY: function setY(y) {
            this.element[0].style.top = parseInt(y, 10) / this.properties.getWidth() * 100 + '%';
        },
        setMouseOffset: function setMouseOffset(e) {
            this.sliderOffset = this.element.offset();
            this.tmpCoord = this.getCoord();
            this.mouseOffset = {
                x: Utils.getPageCoords(e).left - this.sliderOffset.left,
                y: Utils.getPageCoords(e).top - this.sliderOffset.top
            };
        },
        removeDocumentEventHandlers: function removeDocumentEventHandlers() {
            document.body.onselectstart = null;
            document.ondragstart = null;
            $(document.body).off('mousemove.slider mouseup.slider touchmove.slider');
            this.trigger('stopSlide');
        }
    };

    $.fn.islider = function (props) {
        var item = void 0;
        var instance = void 0;

        $(this).each(function () {
            item = $(this);
            if (item.data('islider')) {
                console.log('islider already init', this);
            } else {
                instance = new IsliderControl(item, props);
                item.data('islider', instance);
            }
        });

        return this;
    };
})(jQuery, window, undefined); // eslint-disable-line