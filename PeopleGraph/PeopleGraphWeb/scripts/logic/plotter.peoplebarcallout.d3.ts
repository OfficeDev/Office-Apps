/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/chart.ts"/>
///<reference path="shared/decoration.ts"/>
///<reference path="data.convertor.peoplebar.ts"/>
///<reference path="plotter.peoplebarbase.d3.ts"/>

declare var d3: any;
declare var $: any;

/**
  * This module contains the implementation of the People Bar D3 plotter for the "callout" type
  */
module DataViz.Chart.D3 {
    "use strict";

    /**
      * The People Bar D3 plotter for the "callout" type
      */
    export class PeopleBarCalloutPlotterD3 extends PeopleBarBasePlotter {
        private maxLabelWidth: number;
        private maxValueLabelHeight: number;
        private maxLabelHeight: number;
        private valueLabelWidths: number[];
        private labelWidths: number[];
        private plotterVariables: any;

        constructor() {
            super();
            var fixedPlotterVariables = {
                cxLabelGap: 20,
                preferredLabelWidthPercentage: 0.2,
                maximalLabelWidthPercentage: 0.3,

                calloutPadding: 2,
                calloutSkewWidth: 5,
                calloutArrowHeight: 8,
                calloutArrowWidth: 6,
                calloutBoxOffset: 8,
            };

            this.volatileSpecificStatic = [
                {
                    cyBandGap: 24,
                    valueLabelFontSize: "34px",
                    labelFontSize: "14px",
                },
                {
                    cyBandGap: 24,
                    valueLabelFontSize: "26px",
                    labelFontSize: "14px",
                },
                {
                    cyBandGap: 12,
                    valueLabelFontSize: "26px",
                    labelFontSize: "11px",
                }
            ];

            this.plotterVariables = {
                cxLabelGap: fixedPlotterVariables.cxLabelGap / this.ZoomRatio,
                preferredLabelWidthPercentage: fixedPlotterVariables.preferredLabelWidthPercentage,
                maximalLabelWidthPercentage: fixedPlotterVariables.maximalLabelWidthPercentage,
                calloutPadding: fixedPlotterVariables.calloutPadding / this.ZoomRatio,
                calloutSkewWidth: fixedPlotterVariables.calloutSkewWidth / this.ZoomRatio,
                calloutArrowHeight: fixedPlotterVariables.calloutArrowHeight / this.ZoomRatio,
                calloutArrowWidth: fixedPlotterVariables.calloutArrowWidth / this.ZoomRatio,
                calloutBoxOffset: fixedPlotterVariables.calloutBoxOffset / this.ZoomRatio,
            };
        }

        /**
          * Overriding {@link PeopleBarBasePlotter#plotWithMagnitude}
          */
        public plotWithMagnitude(data: Data.PeopleBar.KeyValueData, maxValue: number, magnitude: number, shape: Decoration.Shape) {
            var svgRoot = d3.select(DataViz.Chart.defaultChartRootId);
            var thisPlotter = this;

            thisPlotter.refreshFontSizeAndGap(data.Keys.length);
            var optimalPlotterParameter = new OptimalPlotterParameter(thisPlotter.BasePlotterVariables);
            optimalPlotterParameter.optimize(
                Math.ceil(maxValue / magnitude),
                thisPlotter.volatilePlotterVariables.BandWidth,
                thisPlotter.volatilePlotterVariables.BoardHeight,
                shape.width,
                shape.height,
                thisPlotter.BasePlotterVariables.preferredShapeHeight,
                thisPlotter.BasePlotterVariables.minimalShapeHeight,
                (shapeHeight: number): number => {
                    return shapeHeight + thisPlotter.maxLabelHeight + thisPlotter.plotterVariables.calloutPadding * 2 + thisPlotter.plotterVariables.calloutArrowHeight;
                },
                (bandHeight: number): number => {
                    return (bandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap) * data.NormalizedValueSeries.length - thisPlotter.volatilePlotterVariablesSpecific.cyBandGap;
                },
                (bandHeight: number): number => {
                    return Math.max(1, Math.floor((thisPlotter.volatilePlotterVariables.BoardHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap) / (bandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)));
                });

            this.notifyResizeWindow(optimalPlotterParameter, data);
            var scale = optimalPlotterParameter.ShapeHeight / shape.height;
            var dataWithThreshold = data.withThreshold(optimalPlotterParameter.BandCount);
            var formattedValuesWithThreshold: string[] = dataWithThreshold.FormattedValueSeries;
            var normalizedValuesWithThreshold: number[] = dataWithThreshold.NormalizedValueSeries;
            var keysWithThreshold = dataWithThreshold.Keys;

            // Use this to vertically center-align the chart area 
            var chartOffsetY = (this.volatilePlotterVariables.BoardHeight - keysWithThreshold.length * (optimalPlotterParameter.BandHeight + this.volatilePlotterVariablesSpecific.cyBandGap) + this.volatilePlotterVariablesSpecific.cyBandGap) / 2;

            var defs = svgRoot.select("defs");

            if (defs.empty()) {
                defs = svgRoot.append("defs");
            }

            defs.selectAll("path#shape").remove();
            defs.selectAll("path#shapePercentage").remove();

            defs.append("path")
                .attr("id", "shape")
                .attr("d", shape.path)
                .attr("class", "chart-shape")
                .attr("transform", "scale(" + scale + ")");

            defs.append("path")
                .attr("id", "shapePercentage")
                .attr("d", shape.path)
                .attr("class", "chart-shape-percentage")
                .attr("transform", "scale(" + scale + ")");

            defs.selectAll("clipPath")
                .remove();

            normalizedValuesWithThreshold.forEach((originalValue: number, index: number, array: number[]) => {
                var value = originalValue / magnitude;
                var fraction = Math.max(value - Math.floor(value), thisPlotter.BasePlotterVariables.minimalShapeFraction);

                if (fraction > 0) {
                    defs.append("clipPath")
                        .attr("id", "shapeClip" + index)
                        .attr("clipPathUnits", "objectBoundingBox")
                        .append("rect")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("height", 1)
                        .attr("width", fraction);
                }

                defs.append("clipPath")
                    .attr("id", "valueLabelClip" + index)
                    .attr("clipPathUnits", "objectBoundingBox")
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("height", 1)
                    .attr("width", thisPlotter.maxLabelWidth / thisPlotter.valueLabelWidths[index]);
            });

            var chartValueLabels = svgRoot
                .selectAll("text.chart-value-label")
                .data(formattedValuesWithThreshold);

            var chartValueLabelX = (value: number, index: number) => {
                return Math.max(0, thisPlotter.maxLabelWidth - thisPlotter.valueLabelWidths[index]) + thisPlotter.BasePlotterVariables.cxChartMargin;
            };

            var chartValueLabelY = (value: number, index: number) => {
                return (index + 1) * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                    - thisPlotter.volatilePlotterVariablesSpecific.cyBandGap
                    - thisPlotter.BasePlotterVariables.cyShapeGap
                    + chartOffsetY
                    + thisPlotter.BasePlotterVariables.cyChartMargin;
            };

            var chartValueLabelClipPath = (value: number, index: number) => {
                return "url(#valueLabelClip" + index + ")";
            };

            chartValueLabels.attr("class", "chart-value-label")
                .attr("x", chartValueLabelX)
                .attr("y", chartValueLabelY)
                .style("clip-path", chartValueLabelClipPath)
                .text(String);

            chartValueLabels.enter()
                .append("text")
                .attr("class", "chart-value-label")
                .attr("x", chartValueLabelX)
                .attr("y", chartValueLabelY)
                .attr("text-anchor", "start")
                .style("clip-path", chartValueLabelClipPath)
                .text(String)
                .style("font-size", this.volatilePlotterVariablesSpecific.valueLabelFontSize)
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(750)
                .style("fill-opacity", 1);

            chartValueLabels.exit().remove();

            var labelCallouts = svgRoot
                .selectAll("polygon.chart-label-callout")
                .data(keysWithThreshold);

            // Calculate and generate the series of points that compose the callout box and arrow
            var points = (label: string, index: number): string => {
                if (label.trim().length === 0) {
                    return "";
                }

                var boxLeft = thisPlotter.maxLabelWidth
                    + thisPlotter.plotterVariables.cxLabelGap;
                    + thisPlotter.BasePlotterVariables.cxChartMargin
                    - thisPlotter.plotterVariables.calloutBoxOffset;
                var boxRight = Math.max(
                    boxLeft + thisPlotter.labelWidths[index] + thisPlotter.plotterVariables.calloutPadding * 2,
                    thisPlotter.maxLabelWidth + thisPlotter.BasePlotterVariables.cxChartMargin + thisPlotter.plotterVariables.cxLabelGap + optimalPlotterParameter.ShapeWidth);
                var boxBottom = index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                    + thisPlotter.maxLabelHeight
                    + thisPlotter.plotterVariables.calloutPadding * 2
                    + chartOffsetY
                    + thisPlotter.BasePlotterVariables.cyChartMargin;
                var boxTop = boxBottom - thisPlotter.maxLabelHeight - thisPlotter.plotterVariables.calloutPadding * 2;
                var arrowBottom = boxBottom + thisPlotter.plotterVariables.calloutArrowHeight;
                var arrowCenter = thisPlotter.maxLabelWidth
                    + thisPlotter.BasePlotterVariables.cxChartMargin
                    + thisPlotter.plotterVariables.cxLabelGap
                    + optimalPlotterParameter.ShapeWidth / 2;
                return (boxLeft - thisPlotter.plotterVariables.calloutSkewWidth) + "," + boxBottom + " "
                    + boxLeft + "," + boxTop + " "
                    + (boxRight + thisPlotter.plotterVariables.calloutSkewWidth) + "," + boxTop + " "
                    + boxRight + "," + boxBottom + " "
                    + arrowCenter + "," + boxBottom + " "
                    + arrowCenter + "," + arrowBottom + " "
                    + (arrowCenter - thisPlotter.plotterVariables.calloutArrowWidth) + "," + boxBottom + " "
                    + (boxLeft - thisPlotter.plotterVariables.calloutSkewWidth) + "," + boxBottom;
            };

            labelCallouts.attr("class", "chart-label-callout")
                .attr("points", points);

            labelCallouts.enter()
                .append("polygon")
                .attr("class", "chart-label-callout")
                .attr("points", points)
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(750)
                .style("fill-opacity", 1);

            labelCallouts.exit().remove();

            var chartLabels = svgRoot
                .selectAll("text.chart-label")
                .data(keysWithThreshold);

            var chartLabelX = (value: number, index: number) => {
                return thisPlotter.maxLabelWidth
                    + thisPlotter.plotterVariables.calloutPadding
                    + thisPlotter.BasePlotterVariables.cxChartMargin
                    + thisPlotter.plotterVariables.cxLabelGap - thisPlotter.plotterVariables.calloutBoxOffset;
            };

            var chartLabelY = (label: string, index: number) => {
                return index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                    + thisPlotter.maxLabelHeight
                    + chartOffsetY
                    + thisPlotter.BasePlotterVariables.cyChartMargin
                    - thisPlotter.plotterVariables.calloutPadding;
            };

            chartLabels.attr("class", "chart-label")
                .attr("x", chartLabelX)
                .attr("y", chartLabelY)
                .text(String);

            chartLabels.enter()
                .append("text")
                .attr("class", "chart-label")
                .attr("x", chartLabelX)
                .attr("y", chartLabelY)
                .text(String)
                .style("font-size", this.volatilePlotterVariablesSpecific.labelFontSize)
                .attr("text-anchor", "start")
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(750)
                .style("fill-opacity", 1)

            chartLabels.exit().remove();

            var thisPlotter = this;
            var groups = svgRoot.selectAll("g.shapes").data(normalizedValuesWithThreshold);
            var eachFunction = function (originalValue: number, index: number) {
                var value = originalValue / magnitude;
                var flooredValue = Math.floor(value);
                var fraction = value - flooredValue;

                var band: number[] = [];
                for (var i = 0; i < flooredValue; i++) {
                    band.push(i);
                }

                var uses = d3.select(this)
                    .selectAll("use.shape")
                    .data(band);

                var transform = (d1: any, i1: number): string => {
                    var x = i1 * (optimalPlotterParameter.ShapeWidth + thisPlotter.BasePlotterVariables.cxShapeGap)
                        + thisPlotter.maxLabelWidth + thisPlotter.plotterVariables.cxLabelGap
                        + thisPlotter.BasePlotterVariables.cxChartMargin;
                    var y = index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                        + chartOffsetY
                        + thisPlotter.maxLabelHeight
                        + thisPlotter.plotterVariables.calloutPadding * 2
                        + thisPlotter.plotterVariables.calloutArrowHeight
                        + thisPlotter.BasePlotterVariables.cyChartMargin;
                    return "translate(" + x + ", " + y + ")";
                };

                uses.attr("xlink:href", "#shape")
                    .attr("transform", transform)
                    .style("clip-path", null);

                uses.enter()
                    .append("use")
                    .attr("xlink:href", "#shape")
                    .attr("class", "shape chart-shape")
                    .attr("transform", transform)
                    .style("clip-path", null)
                    .style("fill-opacity", 1e-6)
                    .transition()
                    .duration(750)
                    .style("fill-opacity", 1);

                uses.exit().remove();

                d3.select(this).selectAll("use.shapePercentage").remove();
                d3.select(this).selectAll("use.shapeFraction").remove();

                if (fraction > 0) {
                    var x = flooredValue * (optimalPlotterParameter.ShapeWidth + thisPlotter.BasePlotterVariables.cxShapeGap)
                        + thisPlotter.maxLabelWidth + thisPlotter.plotterVariables.cxLabelGap
                        + thisPlotter.BasePlotterVariables.cxChartMargin;
                    var y = index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                        + chartOffsetY
                        + thisPlotter.maxLabelHeight
                        + thisPlotter.plotterVariables.calloutPadding * 2
                        + thisPlotter.plotterVariables.calloutArrowHeight
                        + thisPlotter.BasePlotterVariables.cyChartMargin;

                    d3.select(this)
                        .append("use")
                        .attr("xlink:href", "#shapePercentage")
                        .attr("class", "shapePercentage chart-shape")
                        .attr("transform", "translate(" + x + ", " + y + ")")
                        .style("fill-opacity", 0.4);

                    d3.select(this)
                        .append("use")
                        .attr("xlink:href", "#shape")
                        .attr("class", "shapeFraction chart-shape")
                        .attr("transform", "translate(" + x + ", " + y + ")")
                        .style("clip-path", "url(#shapeClip" + index + ")")
                        .style("fill-opacity", 1);
                }
            };

            groups.each(eachFunction);

            groups.enter()
                .append("g")
                .attr("class", "shapes")
                .each(eachFunction);

            groups.exit().remove();
        }

        /**
          * Overriding {@link PeopleBarBasePlotter#calculateBandWidth}
          */
        public calculateBandWidth(data: Data.PeopleBar.KeyValueData, boardWidth: number): number {
            this.valueLabelWidths = [];
            this.labelWidths = [];
            this.refreshFontSizeAndGap(data.Keys.length);

            var svgRoot = d3.select(DataViz.Chart.defaultChartRootId);
            var values: string[] = data.FormattedValueSeries;
            var labels: string[] = data.Keys;
            var maxWidth = boardWidth * this.plotterVariables.preferredLabelWidthPercentage;
            this.maxValueLabelHeight = 0;

            var thisPlotter = this;

            var calculationTextNode = svgRoot.append("text")
                .attr("id", "temp-calculating-text-width")
                .attr("class", "chart-value-label")
                .attr("x", -100)
                .attr("y", -100)
                .attr("text-anchor", "start")
                .style("fill-opacity", 0)
                .style("font-size", this.volatilePlotterVariablesSpecific.valueLabelFontSize);

            values.forEach(function (value: string, index: number, array: string[]) {
                calculationTextNode.text(value);
                thisPlotter.valueLabelWidths[index] = calculationTextNode.node().getBBox().width;
                maxWidth = Math.max(maxWidth, thisPlotter.valueLabelWidths[index]);
                thisPlotter.maxValueLabelHeight = Math.max(thisPlotter.maxValueLabelHeight, calculationTextNode.node().getBBox().height);
            });

            this.maxLabelHeight = 0;

            calculationTextNode.attr("class", "chart-label")
                               .style("font-size", this.volatilePlotterVariablesSpecific.labelFontSize);
            labels.forEach(function (label: string, index: number, array: string[]) {
                calculationTextNode.text(label);
                thisPlotter.labelWidths[index] = calculationTextNode.node().getBBox().width;
                thisPlotter.maxLabelHeight = Math.max(thisPlotter.maxLabelHeight, calculationTextNode.node().getBBox().height);
            });

            calculationTextNode.remove();

            this.maxLabelWidth = Math.min(boardWidth * this.plotterVariables.maximalLabelWidthPercentage, maxWidth);
            return boardWidth - this.maxLabelWidth - this.plotterVariables.cxLabelGap - this.BasePlotterVariables.cxChartMargin;
        }
    }
}