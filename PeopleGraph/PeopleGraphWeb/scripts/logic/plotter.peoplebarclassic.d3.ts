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
  * This module contains the implementation of the People Bar D3 plotter for the "classic" type
  */
module DataViz.Chart.D3 {
    "use strict";

    /**
      * The People Bar D3 plotter for the "classic" type
      */
    export class PeopleBarClassicPlotterD3 extends PeopleBarBasePlotter {
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
                cyLabelGap: 2,
                preferredLabelWidthPercentage: 0.2,
                maximalLabelWidthPercentage: 0.3,
            };

            this.volatileSpecificStatic = [
                {
                    cyBandGap: 24,
                    valueLabelFontSize: "34px",
                    labelFontSize: "16px",
                },
                {
                    cyBandGap: 14,
                    valueLabelFontSize: "26px",
                    labelFontSize: "14px",
                },
                {
                    cyBandGap: 10,
                    valueLabelFontSize: "24px",
                    labelFontSize: "11px",
                },
            ];

            this.plotterVariables = {
                cxLabelGap: fixedPlotterVariables.cxLabelGap / this.ZoomRatio,
                cyLabelGap: fixedPlotterVariables.cyLabelGap / this.ZoomRatio,
                preferredLabelWidthPercentage: fixedPlotterVariables.preferredLabelWidthPercentage,
                maximalLabelWidthPercentage: fixedPlotterVariables.maximalLabelWidthPercentage,
            };
        }

        /**
          * Overriding {@link PeopleBarBasePlotter#plotWithMagnitude}
          */
        public plotWithMagnitude(data: Data.PeopleBar.KeyValueData, maxValue: number, magnitude: number, shape: Decoration.Shape) {
            var svgRoot = d3.select(DataViz.Chart.defaultChartRootId);
            var thisPlotter = this;

            this.refreshFontSizeAndGap(data.Keys.length);
            var classicPreferedShapeHeight = this.maxValueLabelHeight + this.maxLabelHeight + this.plotterVariables.cyLabelGap;
            var optimalPlotterParameter = new OptimalPlotterParameter(thisPlotter.BasePlotterVariables);
            optimalPlotterParameter.optimize(
                Math.ceil(maxValue / magnitude),
                this.volatilePlotterVariables.BandWidth,
                this.volatilePlotterVariables.BoardHeight,
                shape.width,
                shape.height,
                classicPreferedShapeHeight,
                this.BasePlotterVariables.minimalShapeHeight,
                (shapeHeight: number): number => {
                    return Math.max(thisPlotter.maxLabelHeight + thisPlotter.maxValueLabelHeight + thisPlotter.plotterVariables.cyLabelGap, shapeHeight);
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
            var formattedValuesWithThreshold = dataWithThreshold.FormattedValueSeries;
            var normalizedValuesWithThreshold = dataWithThreshold.NormalizedValueSeries;
            var keysWithThreshold = dataWithThreshold.Keys;

            // Use this to vertically center-align the chart area 
            var chartOffsetY = (this.volatilePlotterVariables.BoardHeight - keysWithThreshold.length * (optimalPlotterParameter.BandHeight + this.volatilePlotterVariablesSpecific.cyBandGap) + this.volatilePlotterVariablesSpecific.cyBandGap) / 2;

            var defs = d3.select(DataViz.Chart.defaultChartRootId)
                .select("defs");

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

                defs.append("clipPath")
                    .attr("id", "labelClip" + index)
                    .attr("clipPathUnits", "objectBoundingBox")
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("height", 1)
                    .attr("width", thisPlotter.maxLabelWidth / thisPlotter.labelWidths[index]);
            });

            var chartValueLabels = svgRoot
                .selectAll("text.chart-value-label")
                .data(formattedValuesWithThreshold);

            var chartValueLabelX = (value: number, index: number) => {
                return Math.max(0, thisPlotter.maxLabelWidth - thisPlotter.valueLabelWidths[index]) + thisPlotter.BasePlotterVariables.cxChartMargin;
            };

            var labelOffsetY = (optimalPlotterParameter.BandHeight - thisPlotter.volatilePlotterVariablesSpecific.cyBandGap - thisPlotter.maxValueLabelHeight - thisPlotter.maxLabelHeight - thisPlotter.plotterVariables.cyLabelGap) / 2;
            var chartValueLabelY = (value: any, index: number) => {
                return index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                    + labelOffsetY
                    + thisPlotter.maxValueLabelHeight
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
                .style("clip-path", chartValueLabelClipPath)
                .attr("text-anchor", "start")
                .style("font-size", thisPlotter.volatilePlotterVariablesSpecific.valueLabelFontSize)
                .text(String)
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(750)
                .style("fill-opacity", 1);

            chartValueLabels.exit().remove();

            var chartLabels = svgRoot
                .selectAll("text.chart-label")
                .data(keysWithThreshold);

            var chartLabelX = (value: number, index: number) => {
                return Math.max(0, thisPlotter.maxLabelWidth - thisPlotter.labelWidths[index]) + thisPlotter.BasePlotterVariables.cxChartMargin;
            };

            var chartLabelY = (value: any, index: number) => {
                return index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                    + labelOffsetY
                    + thisPlotter.maxValueLabelHeight
                    + thisPlotter.maxLabelHeight
                    + thisPlotter.plotterVariables.cyLabelGap
                    + chartOffsetY
                    + thisPlotter.BasePlotterVariables.cyChartMargin;
            };

            var chartLabelClipPath = (value: number, index: number) => {
                return "url(#labelClip" + index + ")";
            };

            chartLabels.attr("class", "chart-label")
                .attr("x", chartLabelX)
                .attr("y", chartLabelY)
                .style("clip-path", chartLabelClipPath)
                .text(String);

            chartLabels.enter()
                .append("text")
                .attr("class", "chart-label")
                .attr("x", chartLabelX)
                .attr("y", chartLabelY)
                .style("clip-path", chartLabelClipPath)
                .attr("text-anchor", "start")
                .text(String)
                .style("font-size", this.volatilePlotterVariablesSpecific.labelFontSize)
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(750)
                .style("fill-opacity", 1);

            chartLabels.exit().remove();

            var thisPlotter = this;
            var groups = svgRoot.selectAll("g").data(normalizedValuesWithThreshold);
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

                var xCalculation = (idx: number) => {
                    return idx * (optimalPlotterParameter.ShapeWidth + thisPlotter.BasePlotterVariables.cxShapeGap)
                        + thisPlotter.maxLabelWidth + thisPlotter.plotterVariables.cxLabelGap
                        + thisPlotter.BasePlotterVariables.cxChartMargin;
                };

                var yCalculation = index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                        + (optimalPlotterParameter.BandHeight - optimalPlotterParameter.ShapeHeight) / 2
                        + chartOffsetY
                        + thisPlotter.BasePlotterVariables.cyChartMargin;

                var transform = (d1: any, i1: number) => {
                    var x = xCalculation(i1);
                    var y = yCalculation;
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
                    var x = xCalculation(flooredValue);
                    var y = yCalculation;

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
                maxWidth = Math.max(maxWidth, thisPlotter.labelWidths[index]);
                thisPlotter.maxLabelHeight = Math.max(thisPlotter.maxLabelHeight, calculationTextNode.node().getBBox().height);
            });

            calculationTextNode.remove();

            this.maxLabelWidth = Math.min(boardWidth * this.plotterVariables.maximalLabelWidthPercentage, maxWidth);
            return boardWidth - this.maxLabelWidth - this.plotterVariables.cxLabelGap - this.BasePlotterVariables.cxChartMargin;
        }
    }
}