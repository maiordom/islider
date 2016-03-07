/* global IsliderDrag:true Utils:true Defaults:true */
function IsliderControl(element, properties) {
    this.element = element;
    this.properties = properties || {};
    this.freeRide = function() {};
    this.setPath = function() {};
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
    on(eventName, callback) {
        this.events[eventName] = callback;
        return this.interface;
    },

    trigger(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].apply(null, data);
        }
    },

    init() {
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

    bindEvents() {
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

    onElementClick(e) {
        if ($(e.target).hasClass(this.options.slider)) {
            return;
        }

        this.freeRide(e);
    },

    getFreeRideData(e) {
        let width = this.getWidth();
        let elementOffset = this.element.offset();
        let mouseCoord = Utils.getPageCoords(e);

        mouseCoord = this.options.orientation === 'horizontal'
            ? mouseCoord.left - elementOffset.left
            : mouseCoord.top - elementOffset.top;

        return {
            width: width,
            mouseCoord: mouseCoord
        };
    },

    rangeFreeRide(e) {
        let hasMoved = false;
        let coord;
        let distance;

        this.cacheParams();

        let data = this.getFreeRideData(e);
        let width = data.width;
        let mouseCoord = data.mouseCoord;
        let sliderLeft = this.getLeft();
        let sliderRight = this.getRight();

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

    minMaxFreeRide(e) {
        let data = this.getFreeRideData(e);
        let coord = data.mouseCoord - this.handleMetric * 0.5;

        coord = coord < 0
            ? 0
            : coord > data.width
                ? data.width
                : coord;

        this.onLeftMove(coord);
        this.triggerStopSlide();
    },

    onHoverElement(e) {
        $(e.target).addClass(this.options.hover);
    },

    onUnhoverElement(e) {
        $(e.target).removeClass(this.options.hover);
    },

    onStopSlide() {
        this.element.addClass(this.options.hasAnim);
        this.activeSlider.element.removeClass(this.options.active);
        this.triggerStopSlide();
    },

    onStartSlide(e) {
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

    triggerStopSlide() {
        this.element.trigger('islider.stop-slide');
    },

    extend() {
        $.extend(true, this.options, Defaults, this.properties);
    },

    cacheParams() {
        this.leftSlider.position = this.getLeft(true);
        this.rightSlider.position = this.getRight(true);
        this.elementWidth = this.getWidth(true);
    },

    cacheNodes() {
        this.element.addClass(this.options.islider);
        this.slider = this.element.find('.' + this.options.slider);
        this.leftElement = this.element.find('.' + this.options.left);
        this.rightElement = this.element.find('.' + this.options.right);
        this.path = this.element.find('.' + this.options.path);
        this.box = this.element.find('.' + this.options.box);

        setTimeout(function() {
            this.element.addClass(this.options.hasAnim);
        }.bind(this), 10);
    },

    setVars() {
        this.isVertical = this.options.orientation === 'vertical';
        this.metricType = this.isVertical ? 'height' : 'width';
        this.coordType = this.isVertical ? 'top' : 'left';
        this.handleMetric = this.leftElement[this.metricType]() || this.rightElement[this.metricType]();
        this.elementWidth = this.getWidth(true);

        if (this.isVertical) {
            this.box.height(this.elementWidth);
        }
    },

    setSetPathHandler() {
        this.setPath = this.options.range === true
            ? this.setRangePath
            : this.options.range === 'min'
                ? this.setMinPath
                : this.setMaxPath;
    },

    getWidth(readEl) {
        if (!readEl) {
            return this.elementWidth;
        }

        let param = this.isVertical
            ? this.element[0].offsetHeight
            : this.element[0].offsetWidth;

        return param - this.handleMetric * (this.options.range === true ? 2 : 1);
    },

    checkIsVertical() {
        if (this.options.orientation === 'vertical') {
            this.element.addClass('islider_vertical');
        } else {
            this.element.addClass('islider_horizontal');
        }
    },

    isRangeSingle() {
        if (this.options.range === 'min') {
            this.options.values[1] = this.options.value;
            this.element.addClass('islider_min');
            this.freeRide = this.minMaxFreeRide;
        } else if (this.options.range === 'max') {
            this.element.addClass('islider_max');
            let hook = this.options.orientation === 'horizontal' ? 'right' : 'bottom';
            this.path[0].style[hook] = 0;
            this.options.values[0] = this.options.value;
            this.options.values[1] = this.options.domain[1];
            this.freeRide = this.minMaxFreeRide;
        } else {
            this.element.addClass('islider_range');
            this.freeRide = this.rangeFreeRide;
        }
    },

    generate() {
        if (!this.options.generate) {
            return;
        }

        let box = $('<div>').addClass(this.options.box).appendTo(this.element);
        $('<div>').addClass(this.options.left).addClass(this.options.slider).appendTo(box);
        $('<div>').addClass(this.options.right).addClass(this.options.slider).appendTo(box);
        $('<div>').addClass(this.options.path).appendTo(box);
    },

    setSliders() {
        let props = {
            orientation: this.options.orientation,
            domain: this.options.domain,
            step: this.options.step,
            getWidth: this.getWidth.bind(this)
        };

        this.leftSlider = new IsliderDrag(this.leftElement, props);
        this.rightSlider = new IsliderDrag(this.rightElement, props);
    },

    setInitialData() {
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

    getLeft(readElement) {
        if (readElement) {
            return this.leftSlider.getCoord();
        } else {
            return this.leftSlider.position;
        }
    },

    getRight(readElement) {
        if (readElement) {
            return this.rightSlider.getCoord();
        } else {
            return this.rightSlider.position;
        }
    },

    getDistance() {
        return this.getRight() - this.getLeft();
    },

    isLeftCrossing(x) {
        return x >= this.getRight();
    },

    isRightCrossing(x) {
        return x <= this.getLeft();
    },

    onLeftMove(x) {
        this.leftMoveHandler(x);
        this.options.onSlide(this.options.values[0], this.options.values, 'left');
    },

    onRightMove(x) {
        this.rightMoveHandler(x);
        this.options.onSlide(this.options.values[1], this.options.values, 'right');
    },

    leftMoveHandler(x) {
        let pathWidth = this.getRight() - x;
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

    rightMoveHandler(x) {
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

    setRangePath(left, width) {
        this.path[0].style[this.metricType] = (width / this.getWidth()) * 100 + '%';
        this.path[0].style[this.coordType] = (left / this.getWidth()) * 100 + '%';
    },

    setMaxPath(left) {
        this.path[0].style[this.metricType] = 100 - (left / this.getWidth()) * 100 + '%';
    },

    setMinPath(left) {
        this.path[0].style[this.metricType] = ((left + this.handleMetric / 2) / this.getWidth()) * 100 + '%';
    },

    leftVal(val) {
        if (typeof val === 'number') {
            this.cacheParams();
            this.leftMoveHandler(this.leftSlider.scaleValToCoord(val));
        } else {
            return this.leftSlider.getValue();
        }
    },

    rightVal(val) {
        if (typeof val === 'number') {
            this.cacheParams();
            this.rightMoveHandler(this.rightSlider.scaleValToCoord(val));
        } else {
            return this.rightSlider.getValue();
        }
    },

    getInterface() {
        return {
            on: this.on.bind(this),
            getDist: this.getDistance.bind(this),
            reset: this.setInitialData.bind(this),
            leftVal: this.leftVal.bind(this),
            rightVal: this.rightVal.bind(this)
        };
    }
};
