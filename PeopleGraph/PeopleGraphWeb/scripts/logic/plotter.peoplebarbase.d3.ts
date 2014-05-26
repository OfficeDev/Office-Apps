/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/chart.ts"/>
///<reference path="shared/decoration.ts"/>
///<reference path="data.convertor.peoplebar.ts"/>

declare var d3: any;
declare var $: any;

/**
  * This modules contains the implementations of the base class for People Bar plotters
  */
module DataViz.Chart.D3 {
    "use strict";

    /**
      * This is a helper class to calculate the optimal plotter parameters. Here "optimal" means the best/ideal plotter parameters to render the data onto the chart
      */
    export class OptimalPlotterParameter {
        private shapeWidth: number;
        private shapeHeight: number;
        private bandHeight: number;
        private bandCount: number;
        private basePlotterVariables: any;

        constructor(basePlotterVariables: any) {
            this.basePlotterVariables = basePlotterVariables;
        }

        /**
          * Gets the optimal shape width
          * @returns {number} The optimal shape width
          */
        public get ShapeWidth(): number {
            return this.shapeWidth;
        }

        /**
          * Gets the optimal shape height
          * @returns {number} The optimal shape height
          */
        public get ShapeHeight(): number {
            return this.shapeHeight;
        }

        /**
          * Gets the optimal band height. "Band" means the bar-like elements group (shape icons + text label + number label, etc.) representing a single value of the selected data.
          * @returns {number} The optimal band height
          */
        public get BandHeight(): number {
            return this.bandHeight;
        }

        /**
          * Gets the optimal count of bands that can be rendered in the visible canvas
          * @returns {number} The optimal band count
          */
        public get BandCount(): number {
            return this.bandCount;
        }

        /**
          * Optimizes the plotter parameters
          * @param {number} maxValue The maximum value among the all the values in the bound data
          * @param {number} bandwidth The width of the band area (chart area excluding the spaces used up by labels, etc. - That is, the space used to render shape icons)
          * @param {number} boardHeight The height of the board used to render the chart
          * @param {number} originalShapeWidth The original width of the shape
          * @param {number} originalShapeHeight The original height of the shape
          * @param {number} preferredShapeHeight The preferred height of the shape
          * @param {number} minimalShapeHeight The minimal height of the shape
          * @param {(shapeHeight: number) => number} bandHeightCalculatingFunction The chart-type-specific function to calculate the band height
          * @param {(bandHeight: number) => number} totalHeightCalculatingFunction The chart-type-specific function to calculate the total height
          * @param {(bandHeight: number) => number} bandCountCalculatingFunction The chart-type-specific function to calculate the band count
          */
        public optimize(
            maxValue: number,
            bandWidth: number,
            boardHeight: number,
            originalShapeWidth: number,
            originalShapeHeight: number,
            preferredShapeHeight: number,
            minimalShapeHeight: number,
            bandHeightCalculatingFunction: (shapeHeight: number) => number,
            totalHeightCalculatingFunction: (bandHeight: number) => number,
            bandCountCalculatingFunction: (bandHeight: number) => number) {
            var preferredShapeWidth = originalShapeWidth * preferredShapeHeight / originalShapeHeight;
            var minimalShapeWidth = originalShapeWidth * minimalShapeHeight / originalShapeHeight;
            var maximalShapeWidth = (maxValue > 0) ? Math.max(minimalShapeWidth, Math.floor(bandWidth / maxValue)) : minimalShapeWidth;
            maximalShapeWidth = Math.min(maximalShapeWidth, preferredShapeWidth * 1.3);

            var canFitInAllWithPreferredSize: boolean = this.canAllDataFitInOneCanvasWithGivenIconSize(
                maxValue,
                bandWidth,
                boardHeight,
                preferredShapeWidth,
                preferredShapeHeight,
                bandHeightCalculatingFunction,
                totalHeightCalculatingFunction);

            var canFitInAllWithMinimalSize: boolean = this.canAllDataFitInOneCanvasWithGivenIconSize(
                maxValue,
                bandWidth,
                boardHeight,
                minimalShapeWidth,
                minimalShapeHeight,
                bandHeightCalculatingFunction,
                totalHeightCalculatingFunction);

            var optimalShapeWidth = maximalShapeWidth;
            var optimalShapeHeight = originalShapeHeight * optimalShapeWidth / originalShapeWidth;
            var start = minimalShapeWidth;
            var end = maximalShapeWidth;

            if (canFitInAllWithPreferredSize) {
                optimalShapeWidth = preferredShapeWidth;
                optimalShapeHeight = preferredShapeHeight;
            } else if (!canFitInAllWithMinimalSize) {
                optimalShapeWidth = minimalShapeWidth;
                optimalShapeHeight = minimalShapeHeight;
            } 
            else {
                var shapesPerRowInBand = Math.max(1, Math.floor(bandWidth / (preferredShapeWidth + this.basePlotterVariables.cxShapeGap)));
                var rowsPerBand = (maxValue > 0) ? Math.ceil(maxValue / shapesPerRowInBand) : 1;
                if (rowsPerBand === 1) {
                    optimalShapeWidth = minimalShapeWidth;
                    optimalShapeHeight = minimalShapeHeight;
                }
                else {
                    var lastFitInAllShapeWidth = optimalShapeWidth;
                    var lastFitInAllShapeHeight = optimalShapeHeight;
                    var canFitInAllAtLeastOnce = false;

                    while (optimalShapeWidth > start) {
                        if (this.canAllDataFitInOneCanvasWithGivenIconSize(
                            maxValue,
                            bandWidth,
                            boardHeight,
                            optimalShapeWidth,
                            optimalShapeHeight,
                            bandHeightCalculatingFunction,
                            totalHeightCalculatingFunction)) {
                            canFitInAllAtLeastOnce = true;
                            lastFitInAllShapeWidth = optimalShapeWidth;
                            lastFitInAllShapeHeight = optimalShapeHeight;

                            if (optimalShapeWidth >= end) {
                                break;
                            }
                            else {
                                var temp = optimalShapeWidth;
                                optimalShapeWidth = Math.ceil((optimalShapeWidth + end) / 2);
                                start = temp;
                            }
                        }
                        else {
                            var temp = optimalShapeWidth;
                            optimalShapeWidth = Math.floor((optimalShapeWidth + start) / 2);
                            end = temp;
                        }

                        optimalShapeHeight = originalShapeHeight * optimalShapeWidth / originalShapeWidth;
                    }
                }
            }

            this.shapeWidth = optimalShapeWidth;
            this.shapeHeight = optimalShapeHeight;
            var theShapesPerRowInBand = Math.max(1, Math.floor(bandWidth / (optimalShapeWidth + this.basePlotterVariables.cxShapeGap)));
            this.bandHeight = bandHeightCalculatingFunction(this.shapeHeight);
            this.bandCount = bandCountCalculatingFunction(this.bandHeight);
        }

        private canAllDataFitInOneCanvasWithGivenIconSize(
            maxValue: number,
            bandWidth: number,
            boardHeight: number,
            shapeWidth: number,
            shapeHeight: number,
            bandHeightCalculatingFunction: (shapeHeight: number) => number,
            totalHeightCalculatingFunction: (bandHeight: number) => number): boolean {
            var shapesPerRowInBand = Math.max(1, Math.floor(bandWidth / (shapeWidth + this.basePlotterVariables.cxShapeGap)));
            var rowsPerBand = (maxValue > 0) ? Math.ceil(maxValue / shapesPerRowInBand) : 1;

            if (rowsPerBand > 1) {
                return false;
            }

            var bandHeight = bandHeightCalculatingFunction(shapeHeight);
            var totalHeight = totalHeightCalculatingFunction(bandHeight);
            return totalHeight <= boardHeight;
        }
    }

    /**
      * This class contains some plotter variables that are may change due to factors like canvas size, shape size, etc.
      */
    export class PeopleBarPlottertVolatileVariables {
        private boardWidth: number;
        private boardHeight: number;
        private bandWidth: number;
        private maximalShapesPerBand: number;
        private basePlotterVariables: any;

        constructor(basePlotterVariables: any) {
            this.basePlotterVariables = basePlotterVariables;
        }

        /**
          * Gets the board width
          * @returns {number} The board width
          */
        public get BoardWidth(): number {
            return this.boardWidth;
        }

        /**
          * Gets the board height
          * @returns {number} The board height
          */
        public get BoardHeight(): number {
            return this.boardHeight;
        }

        /**
          * Gets the band width, which is the width of the band (board width excluding label widths etc., if any)
          * @returns {number} The band width
          */
        public get BandWidth(): number {
            return this.bandWidth;
        }

        /**
          * Gets the maximal count of shapes per band
          * @returns {number} The maximal count of shapes per band
          */
        public get MaximalShapesPerBand(): number {
            return this.maximalShapesPerBand;
        }

        /**
          * Refreshes the variables given external factors
          * @param {SVGRect} svgViewport The viewport information of the chart root SVG
          * @param {KeyValueData} data The data to be plotted
          * @param {(data: Data.PeopleBar.KeyValueData, boardWidth: number) => number} bandWidthCalculatingCallback The function to calculate band width
          */
        public refresh(svgElement: SVGSVGElement, data: Data.PeopleBar.KeyValueData, bandWidthCalculatingCallback: (data: Data.PeopleBar.KeyValueData, boardWidth: number) => number) {
            this.boardHeight = svgElement.height.animVal.value - this.basePlotterVariables.cyChartMargin * 2;
            this.boardWidth = svgElement.width.animVal.value - this.basePlotterVariables.cxChartMargin * 2;
            this.bandWidth = bandWidthCalculatingCallback(data, this.boardWidth);

            var shape = Decoration.ShapeProvider.Instance.CurrentShape;
            var minimalShapeWidth = shape.width * this.basePlotterVariables.minimalShapeHeight / shape.height;
            var maximalShapesPerBandRow = Math.max(1, Math.floor(this.bandWidth / (minimalShapeWidth + this.basePlotterVariables.cxShapeGap)));
            var maximalBoardWidth = maximalShapesPerBandRow * (minimalShapeWidth + this.basePlotterVariables.cxShapeGap);
            this.maximalShapesPerBand = maximalShapesPerBandRow;
        }
    }

    /**
      * This is the base class of all other People Bar plotters
      */
    export class PeopleBarBasePlotter extends DataViz.Tools.Pausable implements IPlotter {
        /**
          * The volatile plotter variables
          */
        public volatilePlotterVariables: PeopleBarPlottertVolatileVariables;
        public volatilePlotterVariablesSpecific: any;
        public volatileSpecificStatic: any;

        private zoomRatio: number;
        private basePlotterVariables: any;
        private timeoutId: number = null;

        constructor() {
            super();
            var fixedBasePlotterVariables = {
                minimalShapeHeight: 24,
                preferredShapeHeight: 42,
                cxLabelGap: 20,
                cyLabelGap: 2,
                cxShapeGap: 2,
                cyShapeGap: 2,
                cyBandGap: 30,
                cxChartMargin: 10,
                cyChartMargin: 15,
                minimalShapeFraction: 0.2
            };

            this.zoomRatio = DataViz.Utils.getZoomRatioForApp();

            this.basePlotterVariables = {
                minimalShapeHeight: fixedBasePlotterVariables.minimalShapeHeight / this.zoomRatio,
                preferredShapeHeight: fixedBasePlotterVariables.preferredShapeHeight / this.zoomRatio,
                cxLabelGap: fixedBasePlotterVariables.cxLabelGap / this.zoomRatio,
                cyLabelGap: fixedBasePlotterVariables.cyLabelGap / this.zoomRatio,
                cxShapeGap: fixedBasePlotterVariables.cxShapeGap / this.zoomRatio,
                cyShapeGap: fixedBasePlotterVariables.cyShapeGap / this.zoomRatio,
                cyBandGap: fixedBasePlotterVariables.cyBandGap / this.zoomRatio,
                cxChartMargin: fixedBasePlotterVariables.cxChartMargin / this.zoomRatio,
                cyChartMargin: fixedBasePlotterVariables.cyChartMargin / this.zoomRatio,
                minimalShapeFraction: fixedBasePlotterVariables.minimalShapeFraction,
            };

            this.volatilePlotterVariables = new PeopleBarPlottertVolatileVariables(this.basePlotterVariables);
        }

        public get ZoomRatio(): number {
            return this.zoomRatio;
        }

        public get BasePlotterVariables(): any {
            return this.basePlotterVariables;
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            this.resume();

            $(DataViz.Chart.defaultChartRootId).empty();
        }

        /**
          * Implementing {@link IPlotter#plot}
          */
        public plot(data: Data.PeopleBar.KeyValueData) {
            data.resetThreshold();

            if (!this.calculateLayout(data)) {
                return;
            }

            var maxValue = d3.max(data.NormalizedValueSeries);
            var magnitude = 1;
            var boundary = this.volatilePlotterVariables.MaximalShapesPerBand;
            while ((maxValue / magnitude) > boundary) {
                magnitude *= 10;
            }

            $(DataViz.Chart.defaultChartRootId).empty();
            this.plotWithMagnitude(data, maxValue, magnitude, Decoration.ShapeProvider.Instance.CurrentShape);
        }

        /**
          * This is a overridable method. Subclasses might override it to add their own plotter code
          * This ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * @param {KeyValueData} data The data to render
          * @param {number} maxValue The max value among all the values in the data
          * @param {number} magnitude The magnitude applied to the values
          * @param {Shape} shape The currently selected shape definition
          */
        public plotWithMagnitude(data: Data.PeopleBar.KeyValueData, maxValue: number, magnitude: number, shape: Decoration.Shape) {
            // Subclasses might override if needed
        }

        /**
          * This is a overridable method. Subclasses might override it to add their own calculation logic
          * This ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * @param {KeyValueData} data The data to be plotted
          * @param {number} boardWidth The width of the board that will be used to render the whole chart (area including label widths, if any)
          * @returns {number} The width of the band that will be used to render the shape icons (area excluding label widths, if any)
          */
        public calculateBandWidth(data: Data.PeopleBar.KeyValueData, boardWidth: number): number {
            // Subclasses might override if needed
            return boardWidth;
        }

        /**
          * This ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * @param {opt} The optimal parameter for plotter.
          * @param {data} data The data to be plotted.
          */
        public notifyResizeWindow(opt: OptimalPlotterParameter, data: Data.PeopleBar.KeyValueData) {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }

            this.timeoutId = setTimeout( () => {
                    if (opt.BandCount < data.Keys.length) {
                        DataViz.UX.NotificationWithNeverShowBtn.getInstance().setKey("ResizeWindow").setText(DataViz.Resources.Notification.extendAppToShowMore).show();
                    }

                    this.timeoutId = null;
                }, 100);
        }

        public refreshFontSizeAndGap(rowCount: number) {
            if (rowCount <= 3) {
                this.handleVolatilePlotterVariablesInHDPI(this.volatileSpecificStatic[0]);
            }
            else if (rowCount === 4) {
                this.handleVolatilePlotterVariablesInHDPI(this.volatileSpecificStatic[1]);
            }
            else {
                this.handleVolatilePlotterVariablesInHDPI(this.volatileSpecificStatic[2]);
            }
        }

        public handleVolatilePlotterVariablesInHDPI(volatilePlotterVariables: any) {
            this.volatilePlotterVariablesSpecific = {
                cyBandGap: volatilePlotterVariables.cyBandGap / this.ZoomRatio,
                valueLabelFontSize: parseFloat(volatilePlotterVariables.valueLabelFontSize) / this.ZoomRatio + "px",
                labelFontSize: parseFloat(volatilePlotterVariables.labelFontSize) / this.ZoomRatio + "px",
            };
        }

        private calculateLayout(data: Data.PeopleBar.KeyValueData): boolean {
            this.volatilePlotterVariables.refresh(
                <SVGSVGElement>($(DataViz.Chart.defaultChartRootId).get(0)), data,
                (data: Data.PeopleBar.KeyValueData, boardWidth: number): number => {
                    return this.calculateBandWidth(data, boardWidth);
                });
            return ((this.volatilePlotterVariables.BandWidth > 0) && (this.volatilePlotterVariables.BoardHeight > 0));
        }
    }
}