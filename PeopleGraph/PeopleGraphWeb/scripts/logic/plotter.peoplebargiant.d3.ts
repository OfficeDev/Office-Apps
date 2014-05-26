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
  * This module contains the implementation of the People Bar D3 plotter for the "giant" type
  */
module DataViz.Chart.D3 {
    "use strict";

    /**
      * The People Bar D3 plotter for the "giant" type
      */
    export class PeopleBarGiantPlotterD3 extends PeopleBarBasePlotter {
        private maxValueLabelWidth: number;
        private maxValueLabelHeight: number;
        private maxLabelHeight: number;
        private valueLabelWidths: number[];
        private plotterVariables: any;

        constructor() {
            super();
            var fixedPlotterVariables = {
                cxLabelGap: 20,
                cyLabelGap: 8,
                preferredLabelWidthPercentage: 0.2,
                maximalLabelWidthPercentage: 0.5,
            };

            this.volatileSpecificStatic = [
                {
                    cyBandGap: 24,
                    valueLabelFontSize: "42px",
                    labelFontSize: "18px",
                },
                {
                    cyBandGap: 14,
                    valueLabelFontSize: "32px",
                    labelFontSize: "16px",
                },
                {
                    cyBandGap: 10,
                    valueLabelFontSize: "32px",
                    labelFontSize: "11px",
                }
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
                    return Math.max(thisPlotter.maxValueLabelHeight, shapeHeight + thisPlotter.maxLabelHeight + thisPlotter.plotterVariables.cyLabelGap);
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
            var chartOffsetY = (thisPlotter.volatilePlotterVariables.BoardHeight - keysWithThreshold.length * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap) + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap) / 2;

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
                    .attr("width", thisPlotter.maxValueLabelWidth / thisPlotter.valueLabelWidths[index]);
            });

            var chartValueLabels = svgRoot
                .selectAll("text.chart-value-label")
                .data(formattedValuesWithThreshold);

            var chartValueLabelX = (value: number, index: number) => {
                return Math.max(0, thisPlotter.maxValueLabelWidth - thisPlotter.valueLabelWidths[index]) + thisPlotter.BasePlotterVariables.cxChartMargin;
            };

            var chartValueLabelY = (value: any, index: number) => {
                return index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                    + optimalPlotterParameter.ShapeHeight
                    + chartOffsetY
                    + thisPlotter.BasePlotterVariables.cyChartMargin;
            };

            var chartValueLabelClipPath = (value: number, index: number) => {
                return "url(#valueLabelClip" + index + ")";
            };

            var chartValueLabelText = (value: string, index: number) => {
                return DataViz.Utils.formatNumberWithThousandSeparators(value);
            };

            chartValueLabels.attr("class", "chart-value-label")
                .attr("x", chartValueLabelX)
                .attr("y", chartValueLabelY)
                .style("clip-path", chartValueLabelClipPath)
                .text(chartValueLabelText);

            chartValueLabels.enter()
                .append("text")
                .attr("class", "chart-value-label")
                .attr("x", chartValueLabelX)
                .attr("y", chartValueLabelY)
                .attr("text-anchor", "start")
                .style("clip-path", chartValueLabelClipPath)
                .text(chartValueLabelText)
                .style("font-size", thisPlotter.volatilePlotterVariablesSpecific.valueLabelFontSize)
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(750)
                .style("fill-opacity", 1);

            chartValueLabels.exit().remove();

            var chartLabels = svgRoot
                .selectAll("text.chart-label")
                .data(keysWithThreshold);

            var chartLabelX = (value: number, index: number) => {
                return thisPlotter.maxValueLabelWidth + thisPlotter.plotterVariables.cxLabelGap + thisPlotter.BasePlotterVariables.cxChartMargin;
            };

            var chartLabelY = (value: any, index: number) => {
                return index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                    + optimalPlotterParameter.ShapeHeight
                    + chartOffsetY
                    + thisPlotter.maxLabelHeight
                    + thisPlotter.BasePlotterVariables.cyChartMargin;
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
                .attr("text-anchor", "start")
                .text(String)
                .style("font-size", thisPlotter.volatilePlotterVariablesSpecific.labelFontSize)
                .style("fill-opacity", 1e-6)
                .transition()
                .duration(750)
                .style("fill-opacity", 1);

            chartLabels.exit().remove();

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

                var transform = (d1: any, i1: number) => {
                    var x = i1 * (optimalPlotterParameter.ShapeWidth + thisPlotter.BasePlotterVariables.cxShapeGap)
                        + thisPlotter.maxValueLabelWidth + thisPlotter.plotterVariables.cxLabelGap
                        + thisPlotter.BasePlotterVariables.cxChartMargin;
                    var y = index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                        + chartOffsetY
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
                        + thisPlotter.maxValueLabelWidth + thisPlotter.plotterVariables.cxLabelGap
                        + thisPlotter.BasePlotterVariables.cxChartMargin;
                    var y = index * (optimalPlotterParameter.BandHeight + thisPlotter.volatilePlotterVariablesSpecific.cyBandGap)
                        + chartOffsetY
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
                .each(eachFunction);

            groups.exit().remove();
        }

        /**
          * Overriding {@link PeopleBarBasePlotter#calculateBandWidth}
          */
        public calculateBandWidth(data: Data.PeopleBar.KeyValueData, boardWidth: number): number {
            this.valueLabelWidths = [];
            this.refreshFontSizeAndGap(data.Keys.length);

            var svgRoot = d3.select(DataViz.Chart.defaultChartRootId);
            var values: string[] = data.FormattedValueSeries;
            var labels: string[] = data.Keys;
            this.maxValueLabelWidth = boardWidth * this.plotterVariables.preferredLabelWidthPercentage;
            this.maxValueLabelHeight = 0;
            this.maxLabelHeight = 0;

            var thisPlotter = this;

            var calculationTextNode = svgRoot.append("text")
                .attr("id", "temp-calculating-text-width")
                .attr("class", "chart-value-label")
                .attr("x", -100)
                .attr("y", -100)
                .attr("text-anchor", "start")
                .style("fill-opacity", 0)
                .style("font-size", thisPlotter.volatilePlotterVariablesSpecific.valueLabelFontSize);

            values.forEach(function (value: string, index: number, array: string[]) {
                calculationTextNode.text(DataViz.Utils.formatNumberWithThousandSeparators(value));
                thisPlotter.valueLabelWidths[index] = calculationTextNode.node().getBBox().width;
                thisPlotter.maxValueLabelWidth = Math.max(thisPlotter.maxValueLabelWidth, thisPlotter.valueLabelWidths[index]);
                thisPlotter.maxValueLabelHeight = Math.max(thisPlotter.maxValueLabelHeight, calculationTextNode.node().getBBox().height);
            });

            this.maxValueLabelWidth = Math.min(boardWidth * this.plotterVariables.maximalLabelWidthPercentage, this.maxValueLabelWidth);

            calculationTextNode.attr("class", "chart-label")
                               .style("font-size", this.volatilePlotterVariablesSpecific.labelFontSize);
            labels.forEach(function (label: string, index: number, array: string[]) {
                calculationTextNode.text(label);
                thisPlotter.maxLabelHeight = Math.max(thisPlotter.maxLabelHeight, calculationTextNode.node().getBBox().height);
            });

            calculationTextNode.remove();

            return boardWidth - this.maxValueLabelWidth - this.plotterVariables.cxLabelGap;
        }
    }
}