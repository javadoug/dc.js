dc.bubbleChart = function(parent, chartGroup) {
    var _chart = dc.abstractBubbleChart(dc.coordinateGridChart({}));

    var _elasticRadius = false;

    _chart.renderLabel(true);
    _chart.renderTitle(false);

    _chart.transitionDuration(750);

    var bubbleLocator = function(d) {
        return "translate(" + (bubbleX(d)) + "," + (bubbleY(d)) + ")";
    };

    _chart.elasticRadius = function(_){
        if(!arguments.length) return _elasticRadius;
        _elasticRadius = _;
        return _chart;
    };

    _chart.plotData = function() {
        if(_elasticRadius)
            _chart.r().domain([_chart.rMin(), _chart.rMax()]);

        _chart.r().range([_chart.MIN_RADIUS, _chart.xAxisLength() * _chart.maxBubbleRelativeSize()]);

        var bubbleG = _chart.g().selectAll("g." + _chart.BUBBLE_NODE_CLASS)
            .data(_chart.group().all());

        renderNodes(bubbleG);

        updateNodes(bubbleG);

        removeNodes(bubbleG);

        _chart.fadeDeselectedArea();
    };

    function renderNodes(bubbleG) {
        var bubbleGEnter = bubbleG.enter().append("g");
        bubbleGEnter
            .attr("class", _chart.BUBBLE_NODE_CLASS)
            .attr("transform", bubbleLocator)
            .append("circle").attr("class", function(d, i) {
                return _chart.BUBBLE_CLASS + " " + i;
            })
            .on("click", _chart.onClick)
            .attr("fill", function(d, i) {
                this[dc.constants.NODE_INDEX_NAME] = i;
                return _chart.getColor(d, i);
            })
            .attr("r", 0);
        dc.transition(bubbleG, _chart.transitionDuration())
            .attr("r", function(d) {
                return _chart.bubbleR(d);
            });

        _chart.doRenderLabel(bubbleGEnter);

        _chart.doRenderTitles(bubbleGEnter);
    }

    function updateNodes(bubbleG) {
        dc.transition(bubbleG, _chart.transitionDuration())
            .attr("transform", bubbleLocator)
            .selectAll("circle." + _chart.BUBBLE_CLASS)
            .attr("fill", function(d, i) {
                // a work around to get correct node index since
                // d3 does not send i correctly here
                return _chart.getColor(d, this[dc.constants.NODE_INDEX_NAME]);
            })
            .attr("r", function(d) {
                return _chart.bubbleR(d);
            });
        _chart.updateLabels(bubbleG);
        _chart.updateTitles(bubbleG);
    }

    function removeNodes(bubbleG) {
        bubbleG.exit().remove();
    }

    function bubbleX(d) {
        var x = _chart.x()(_chart.keyAccessor()(d)) + _chart.margins().left;
        if (isNaN(x))
            x = 0;
        return x;
    }

    function bubbleY(d) {
        var y = _chart.margins().top + _chart.y()(_chart.valueAccessor()(d));
        if (isNaN(y))
            y = 0;
        return y;
    }

    _chart.renderBrush = function(g) {
        // override default x axis brush from parent chart
    };

    _chart.redrawBrush = function(g) {
        // override default x axis brush from parent chart
        _chart.fadeDeselectedArea();
    };

    _chart.fadeDeselectedArea = function() {
        if (_chart.hasFilter()) {
            _chart.selectAll("g." + _chart.BUBBLE_NODE_CLASS).each(function(d) {
                if (_chart.isSelectedNode(d)) {
                    _chart.highlightSelected(this);
                } else {
                    _chart.fadeDeselected(this);
                }
            });
        } else {
            _chart.selectAll("g." + _chart.BUBBLE_NODE_CLASS).each(function(d) {
                _chart.resetHighlight(this);
            });
        }
    };

    _chart.isSelectedNode = function(d) {
        return _chart.filter() == d.key;
    };

    return _chart.anchor(parent, chartGroup);
};
