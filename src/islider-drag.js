/* global Utils:true */
function IsliderDrag(element, properties) {
    this.element = element;
    this.properties = properties;
    this.moveHandler = function() {};
    this.setCoord = function() {};
    this.events = {};
    this.position = null;
    this.range = null;
    this.xMin = null;
    this.xMax = null;
    this.sliderOffset = null;
    this.mouseOffset = null;
    this.tmpCoord = null;
    this.scaleValToCoord = function() {};
    this.scaleCoordToVal = function() {};

    this.init();
};

IsliderDrag.prototype = {
    getCoord(getCoord) {
        if (this.properties.step > 1) {
            return () => {
                return this.trimMouseValue(getCoord());
            };
        }

        return getCoord;
    },

    init() {
        this.cacheObjects();
        this.reset();
    },

    cacheObjects() {
        let isVertical = this.properties.orientation === 'vertical';
        this.moveHandler = isVertical ? this.moveVerticalHandler : this.moveHorizontalHandler;
        this.setCoord = isVertical ? this.setY : this.setX;
        this.getCoord = this.getCoord(isVertical ? this.getY : this.getX);
    },

    reset() {
        this.range = [0, this.properties.getWidth()];
        this.setRange(this.range);
        this.setScale(this.range, this.properties.domain);
    },

    setRange(range) {
        this.xMin = range[0];
        this.xMax = range[1];
    },

    setScale(range, domain) {
        this.scaleValToCoord = this.scale(domain, range);
        this.scaleCoordToVal = this.scale(range, domain);
    },

    on(eventName, callback) {
        this.events[eventName] = callback;
    },

    trigger(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].apply(null, data);
        }
    },

    startSlide(e) {
        this.reset();
        this.setMouseOffset(e);
        this.addDocumentEventHandlers();
        this.trigger('startSlide');
    },

    scale(domain, range) {
        let u = this.uninterpolateNumber(domain[0], domain[1]);
        let i = this.interpolateNumber(range[0], range[1]);

        return x => i(u(x));
    },

    uninterpolateNumber(a, b) {
        b = b - (a = +a) ? 1 / (b - a) : 0;
        return x => (x - a) * b;
    },

    interpolateNumber(a, b) {
        b -= a;
        return t => a + b * t;
    },

    addDocumentEventHandlers() {
        let that = this;

        $(document.body).on({
            'mousemove.slider touchmove.slider': function() {
                that.moveHandler.apply(that, arguments);
            },
            'mouseup.slider touchend.slider touchcancel.slider': function() {
                that.removeDocumentEventHandlers.apply(that, arguments);
            }
        });

        document.body.onselectstart = this.returnFalse;
        document.ondragstart = this.returnFalse;
    },

    returnFalse() {
        return false;
    },

    trimMouseValue(x) {
        let val = this.scaleCoordToVal(x);
        let step = (this.properties.step > 0) ? this.properties.step : 1;
        let valModStep = (val - this.range[0]) % step;
        let alignValue = val - valModStep;

        if (Math.abs(valModStep) * 2 >= step) {
            alignValue += (valModStep > 0) ? step : (-step);
        }

        return this.scaleValToCoord(alignValue);
    },

    getPosision(offset) {
        let x = offset + this.tmpCoord;

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

    moveVerticalHandler(e) {
        let offset = Utils.getPageCoords(e).top - this.mouseOffset.y - this.sliderOffset.top;
        this.trigger('move', [this.getPosision(offset)]);
    },

    moveHorizontalHandler(e) {
        let offset = Utils.getPageCoords(e).left - this.mouseOffset.x - this.sliderOffset.left;
        this.trigger('move', [this.getPosision(offset)]);
    },

    setValue(val) {
        this.setCoord(this.scaleValToCoord(val));
    },

    getValue(x) {
        return this.scaleCoordToVal(typeof x === 'number' ? x : this.getCoord());
    },

    getX() {
        return this.element[0].offsetLeft - parseInt(this.element.css('marginLeft'), 10);
    },

    getY() {
        return this.element[0].offsetTop - parseInt(this.element.css('marginTop'), 10);
    },

    setX(x) {
        this.element[0].style.left = (parseInt(x, 10) / this.properties.getWidth()) * 100 + '%';
    },

    setY(y) {
        this.element[0].style.top = (parseInt(y, 10) / this.properties.getWidth()) * 100 + '%';
    },

    setMouseOffset(e) {
        this.sliderOffset = this.element.offset();
        this.tmpCoord = this.getCoord();
        this.mouseOffset = {
            x: Utils.getPageCoords(e).left - this.sliderOffset.left,
            y: Utils.getPageCoords(e).top - this.sliderOffset.top
        };
    },

    removeDocumentEventHandlers() {
        document.body.onselectstart = null;
        document.ondragstart = null;
        $(document.body).off('mousemove.slider mouseup.slider touchmove.slider');
        this.trigger('stopSlide');
    }
};
