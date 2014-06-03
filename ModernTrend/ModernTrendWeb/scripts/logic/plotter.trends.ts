/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

///<reference path="shared/data.ts" />
///<reference path="shared/chart.ts"/>
///<reference path="data.convertor.agave.ts" />
///<reference path="../app.ts" />

declare var d3: any;
declare var $: any;

module Trends.Chart {
    export interface ChangedDataSet {
        beDeletedIds: number[];
        beRevisedIds: number[];
        reviseIds: number[];
        beAddedIds: number[];
    }

    export class LineChartPlotter extends DataViz.Tools.Pausable implements DataViz.Chart.IPlotter {
        private static durationTime = 300;
        // Different radiuses of the bubble after user clicks a point, which depends on the text length in it
        private static radius = [13, 16, 20, 25, 29, 29, 29, 29, 29];
        // Different font sizes of the bubble text, which depends on the text length in it
        private static fontSize = [17, 17, 17, 17, 17, 15, 13, 12, 11];
        private static defaultYLableFontSize = 18;
        private static defaultXLableFontSize = 10;
        private static legendFontSize = 17;
        private static checkBoxLength = 15;
        private static xAxisPaddingBottm = 15;
        private static xTickWidth = 5;
        private static marginRight: number = 40;
        private static marginTop: number = 40;
        private static marginBottom: number = 45;
        private static maxTextLength = 9;
        private static defaultYTickNumber: number = 2;
        private static pointRadio: number = 6;
        private static pointRadioForMore: number = 4;
        private static pointHoverRadio: number = 9;
        private static pointHoverRadioForMore: number = 7;
        private static lineWidth: number = 5;
        private static lineWidthForMore: number = 3;
        private static beSmallerLeastPointNumber: number = 21;
        private static resetAction: any = {
            deleteColumn: "deleteColumn",
            addColumn: "addColumn",
            revise: "revise"
        };

        private zoomRatio: ZoomRatio;
        private configuration: DataViz.Config.Configuration;
        private bindingData: Trends.Data.BindingData;
        private lineChartHeight: number;
        private lineChartWidth: number;
        private max: number;
        private min: number;
        private linePlotter: any;
        private xAxis: any;
        private yAxis: any;
        private clickedPointIdArray: string[];
        private lineOrder: number[];
        private lineDisplay: boolean[];
        private lineTitleArray: string[];
        private lineChart: any;
        private legendGroup: any;
        private lineNumber: number;
        private columnNumber: number;
        private delayPlotTimeoutId: number;
        private xAxisWidth: number;
        private currentXTickNumber: number;
        private currentYTickNumber: number;
        private isLegendEdited: boolean;

        constructor() {
            super();
            this.delayPlotTimeoutId = null;
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            this.resume();
        }

        /**
          * Implementing {@link IPlotter#delayPlot}
          */
        public delayPlot(data: Trends.Data.BindingData, delay: number = 300) {
            if (this.delayPlotTimeoutId !== null) {
                clearTimeout(this.delayPlotTimeoutId);
            }

            this.delayPlotTimeoutId = setTimeout(() => {
                    this.plot(data);
                    this.delayPlotTimeoutId = null;
                }, delay);
        }

        /**
          * Implementing {@link IPlotter#plot}
          */
        public plot(data: Trends.Data.BindingData) {
            if (data && data.xData.length > 0 && data.yData.length > 0) {
                this.onDataChanged(data);
                this.initData(data);
                this.drawLineChart();
            }
        }

        public setWidth(width: number) {
            this.lineChartWidth = width;
        }

        public setHeight(height: number) {
            this.lineChartHeight = height;
        }

        private onDataChanged(newData: Trends.Data.BindingData) {
            if (!this.bindingData || !newData) {
                return;
            }

            if (newData.xData.length !== this.bindingData.xData.length) {
                DataViz.Config.Trends.resetClickedPointIdArrays();
            }

            if (newData.yData.length !== this.bindingData.yData.length) {
                DataViz.Config.Trends.resetClickedPointIdArrays();
                DataViz.Config.Trends.resetLineOrder();
                DataViz.Config.Trends.resetLineDisplay();
                DataViz.Config.Trends.resetLineTitleArray();
            }
        }

        private initData(convertedData: Trends.Data.BindingData) {
            if (!convertedData.xData || !convertedData.yData) {
                return;
            }

            this.bindingData = convertedData;
            this.configuration = DataViz.mainApp.Configuration;
            this.isLegendEdited = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.isLegendEdited);
            if (this.isLegendEdited === null || this.isLegendEdited === undefined) {
                this.isLegendEdited = false;
                this.configuration.set(DataViz.Config.Trends.wellKnownKeys.isLegendEdited, this.isLegendEdited);
            }

            if (!this.isLegendEdited && this.bindingData.header.length) {
                this.configuration.set(DataViz.Config.Trends.wellKnownKeys.lineTitleArray, this.bindingData.header);
            }

            var savedClickedPointIdArrays = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.clickedPointIdArray);
            if (!savedClickedPointIdArrays) {
                DataViz.Config.Trends.resetClickedPointIdArrays();
            }

            var savedLineOrder = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.lineOrder);
            if (!savedLineOrder) {
                DataViz.Config.Trends.resetLineOrder();
            }

            var savedLineDisplay = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.lineDisplay);
            if (!savedLineDisplay) {
                DataViz.Config.Trends.resetLineDisplay();
            }

            var savedLineTitleArray = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.lineTitleArray);
            if (!savedLineTitleArray) {
                DataViz.Config.Trends.resetLineTitleArray();
            }

            this.clickedPointIdArray = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.clickedPointIdArray);
            this.lineOrder = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.lineOrder);
            this.lineDisplay = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.lineDisplay);
            this.lineTitleArray = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.lineTitleArray);

            this.zoomRatio = Layouter.getZoomRatioRelativeOrigin();
            this.lineNumber = this.bindingData.yData.length;
            this.columnNumber = this.bindingData.xData.length;
            this.lineOrder.length = this.lineNumber;
            this.lineDisplay.length = this.lineNumber;
            this.setMaxAndMin();
            this.lineChartHeight = $("#line-chart").height();
            this.lineChartWidth = $("#line-chart").width();
        }

        private drawLineChart() {
            if (!this.bindingData) {
                return;
            }

            var _this = this;
            if (!d3.select("#svg-line-chart").empty()) {
                d3.select("#svg-line-chart").remove();
            }

            if (!d3.select("#div-legend").empty()) {
                d3.select("#div-legend").remove();
            }

            this.lineChart = d3.select("#line-chart")
                .append("svg:svg")
                .attr("id", "svg-line-chart")
                .attr("width", this.lineChartWidth)
                .attr("height", this.lineChartHeight);

            this.legendGroup = d3.select("#legend")
                .append("div")
                .attr("id", "div-legend")
                .style("width", "100%")
                .style("height", "100%")
                .style("margin-top", "25px");

            this.yAxis = d3.scale.linear().domain([this.min, this.max]).range([this.lineChartHeight - LineChartPlotter.marginBottom / this.zoomRatio.heightRatio, LineChartPlotter.marginTop / this.zoomRatio.heightRatio]);
            var yTicks = this.drawYLabelAndTicks();
            var marginLeft = this.getMaxYLabelWidth(yTicks) + this.getFirstMaxRadius();
            var marginRight = LineChartPlotter.marginRight / this.zoomRatio.widthRatio;
            var isLineChartMinimum = (this.lineChartWidth - marginLeft - marginRight) < this.lineChartWidth / 2;
            this.xAxisWidth = isLineChartMinimum ? this.lineChartWidth / 2 : this.lineChartWidth - marginLeft - marginRight;
            this.xAxis = d3.scale.linear().domain([0, this.columnNumber - 1])
                            .range([isLineChartMinimum ? this.lineChartWidth - marginRight - this.xAxisWidth : marginLeft, this.lineChartWidth - marginRight]);

            this.linePlotter = d3.svg.line()
                                        .x(function (data: Trends.Data.PointDataOnLine, index: number) {
                                            return _this.xAxis(data.originalIndex);
                                        })
                                        .y(function (data: Trends.Data.PointDataOnLine, index: number) {
                                            return _this.yAxis(data.unformatted);
                                        })
                                        .interpolate("monotone");

            this.drawXLabelAndTicks();
            this.drawLegend();

            for (var i = 0; i < this.lineOrder.length; i++) {
                var lineId = this.lineOrder[i];
                this.lineChart.append("svg:g").attr("id", "line-group" + lineId).style("display", this.lineDisplay[lineId] ? "inline" : "none");
                this.drawLine(lineId);
            }
        }

        private getMaxYLabelWidth(yTicks: any): number {
            var maxLength = 0;
            for (var i = 0; i < yTicks.length; ++i) {
                var yLableWidth = this.getSvgElementWidth("y-label" + i);
                if (yLableWidth > maxLength) {
                    maxLength = yLableWidth;
                }
            }

            return maxLength;
        }

        private getFirstMaxRadius(): number {
            var firstMaxRadius: number = 0;
            var textLength: number = 0;

            for (var i = 0; i < this.lineNumber; i++) {
                var data = this.bindingData.yData[i].data;
                if (data && data[0]) {
                    textLength = Math.min(data[0].formatted.length, LineChartPlotter.maxTextLength);
                    firstMaxRadius = Math.max(LineChartPlotter.radius[textLength - 1], firstMaxRadius);
                }
            }

            return firstMaxRadius / this.zoomRatio.heightRatio;
        }

        private drawXLabelAndTicks() {
            var _this = this;
            this.currentXTickNumber = this.columnNumber;
            var xTicks: number[] = (this.currentXTickNumber === 1) ? [0] : this.xAxis.ticks(this.currentXTickNumber);
            while (xTicks.length > this.bindingData.xData.length) {
                this.currentXTickNumber--;
                if (this.currentXTickNumber === 1) {
                    xTicks = [0];
                    break;
                }

                xTicks = this.xAxis.ticks(this.currentXTickNumber);
            }

            this.drawXLabel(xTicks);

            var maxWidth = 0;
            for (var i = 0; i < xTicks.length; i++) {
                var xLableWidth = this.getSvgElementWidth("x-label" + xTicks[i]);
                if (xLableWidth > maxWidth) {
                    maxWidth = xLableWidth;
                }
            }

            var maxTickNumber = Math.floor(this.xAxisWidth / maxWidth) + 1;
            if (xTicks.length > maxTickNumber) {
                d3.select("#x-label-group").remove();

                this.currentXTickNumber = maxTickNumber;
                if (this.currentXTickNumber > 1) {
                    xTicks = this.xAxis.ticks(this.currentXTickNumber);
                    var isFitFinal = ((this.xAxis(xTicks[xTicks.length - 1]) - this.xAxis(xTicks[0])) / (xTicks.length - 1)) >= maxWidth;
                    while ((maxTickNumber < xTicks.length) || !isFitFinal || xTicks.length > this.bindingData.xData.length) {
                        this.currentXTickNumber--;
                        if (this.currentXTickNumber === 1) {
                            xTicks = [0];
                            break;
                        }

                        xTicks = this.xAxis.ticks(this.currentXTickNumber);
                        isFitFinal = ((this.xAxis(xTicks[xTicks.length - 1]) - this.xAxis(xTicks[0])) / (xTicks.length - 1)) >= maxWidth;
                    }
                }
                else {
                    xTicks = [0];
                }

               this.drawXLabel(xTicks);
            }

            var lastButOneId = xTicks[xTicks.length - 1];
            var fontSize = LineChartPlotter.defaultXLableFontSize / this.zoomRatio.heightRatio;
            if (lastButOneId !== this.columnNumber - 1) {
                var xLabelGroup = d3.select("#x-label-group");
                xLabelGroup.append("svg:line")
                    .attr("id", "x-tick-last")
                    .attr("class", "theme-chart-ticks")
                    .attr("x1", this.xAxis(this.columnNumber - 1))
                    .attr("y1", this.lineChartHeight - LineChartPlotter.xAxisPaddingBottm / this.zoomRatio.heightRatio - fontSize / 2)
                    .attr("x2", this.xAxis(this.columnNumber - 1))
                    .attr("y2", this.lineChartHeight - (LineChartPlotter.xAxisPaddingBottm + LineChartPlotter.xTickWidth) / this.zoomRatio.heightRatio - fontSize / 2)

                xLabelGroup.append("svg:text")
                    .attr("id", "x-label-last")
                    .attr("class", "layout-chart-x-label theme-chart-label")
                    .attr("x", this.xAxis(this.columnNumber - 1))
                    .attr("y", this.lineChartHeight - fontSize / 2)
                    .style("font-size", fontSize + "px")
                    .text(this.bindingData.xData[this.columnNumber - 1]);

                var lastTwoTicksWidth = this.xAxis(this.columnNumber - 1) - this.xAxis(lastButOneId);
                var lastLabelWidth = this.getSvgElementWidth("x-label-last");;
                var lastButOneLabelWidth = this.getSvgElementWidth("x-label" + lastButOneId);
                if (lastTwoTicksWidth < (lastLabelWidth + lastButOneLabelWidth) / 2) {
                    if (!lastButOneId) {
                        d3.select("#x-tick-last").remove();
                        d3.select("#x-label-last").remove();
                    }
                    else {
                        d3.select("#x-label" + lastButOneId).remove();
                        d3.select("#x-tick" + lastButOneId).remove();
                    }
                }
            }

            this.lineChart.append("svg:line")
                        .attr("class", "theme-chart-ticks")
                        .attr("x1", 0)
                        .attr("y1", this.lineChartHeight - LineChartPlotter.xAxisPaddingBottm / this.zoomRatio.heightRatio - fontSize / 2)
                        .attr("x2", this.lineChartWidth)
                        .attr("y2", this.lineChartHeight - LineChartPlotter.xAxisPaddingBottm / this.zoomRatio.heightRatio - fontSize / 2);
        }

        private drawYLabelAndTicks(): any {
            var _this = this;
            this.currentYTickNumber = LineChartPlotter.defaultYTickNumber;
            var yTicks = this.yAxis.ticks(this.currentYTickNumber);
            var retry = 0;
            while (yTicks.length < LineChartPlotter.defaultYTickNumber) {              
                this.currentYTickNumber++;
                yTicks = this.yAxis.ticks(this.currentYTickNumber);
                retry++;
                if (retry > 9) {
                    break;
                } // The max retry time is 10;
            }

            var yLabelId = 0;
            var isPercentageFormat = this.isPercentageFormat();
            this.lineChart.selectAll(".yLabel")
                        .data(yTicks)
                        .enter()
                        .append("svg:text")
                        .attr("id", function (data: number) {
                            return "y-label" + yLabelId++;
                        })
                        .attr("class", "layout-chart-y-label theme-chart-label")
                        .attr("x", 0)
                        .attr("y", function (data: number) {
                            return _this.yAxis(data) - 6;
                        }) //"6" is the padding bottom from the yTicks.
                        .style("font-size", LineChartPlotter.defaultYLableFontSize / this.zoomRatio.heightRatio + "px")
                        .text(function (data: number): any {
                            var str = data.toString();
                            var n = str.indexOf(".");
                            if (n !== -1) {
                                if (str.substr(n).length > 10) {
                                    data = d3.round(data, 10);
                                } //Show at most 10 digits after the decimal point
                            }

                            if (_this.bindingData && _this.bindingData.yData && isPercentageFormat) {
                                return data * 100 + "%";
                            }
                            else {
                                return data;
                            }
                        });

            this.lineChart.selectAll(".yTicks")
                        .data(yTicks)
                        .enter()
                        .append("svg:line")
                        .attr("class", "theme-chart-ticks")
                        .attr("x1", 0)
                        .attr("y1", function (data: number) {
                            return _this.yAxis(data);
                        })
                        .attr("x2", this.lineChartWidth)
                        .attr("y2", function (data: number) {
                            return _this.yAxis(data);
                        })
                        .style("stroke-dasharray", ("5, 3")); //"5" is the dash width and "3" is the width between two dash.


            return yTicks;
        }

        private drawXLabel(xTicks: number[]) {
            var _this = this;
            var xLabelGroup = this.lineChart.append("svg:g")
                            .attr("id", "x-label-group");
            var fontSize = LineChartPlotter.defaultXLableFontSize / this.zoomRatio.heightRatio;
            xLabelGroup.selectAll(".xLabels")
                        .data(xTicks)
                        .enter()
                        .append("svg:text")
                        .attr("id", function (index: number) {
                            return "x-label" + index;
                        })
                        .attr("class", "layout-chart-x-label theme-chart-label")
                        .attr("x", function (index: number) {
                            return _this.xAxis(index);
                        })
                        .attr("y", this.lineChartHeight - fontSize / 2)
                        .style("font-size", fontSize + "px")
                        .text(function (index: number) {
                            return _this.bindingData.xData[index];
                        });

            xLabelGroup.selectAll(".xTicks")
                        .data(xTicks)
                        .enter()
                        .append("svg:line")
                        .attr("id", function (index: number) {
                            return "x-tick" + index;
                        })
                        .attr("class", "theme-chart-ticks")
                        .attr("x1", function (index: number) {
                            return _this.xAxis(index);
                        })
                        .attr("y1", this.lineChartHeight - LineChartPlotter.xAxisPaddingBottm / this.zoomRatio.heightRatio - fontSize / 2)
                        .attr("x2", function (index: number) {
                            return _this.xAxis(index);
                        })
                        .attr("y2", this.lineChartHeight - (LineChartPlotter.xAxisPaddingBottm + LineChartPlotter.xTickWidth) / this.zoomRatio.heightRatio - fontSize / 2);
        }

        private drawLegend() {
            var _this = this;
            for (var i = 0; i < this.lineNumber; i++) {
                var legendRow = this.legendGroup.append("div")
                                    .attr("id", "legend-row-" + i)
                                    .attr("class", "legend-row-style");

                legendRow.append("div")
                         .attr("id", "checkbox" + i + "end")
                         .attr("class", function () {
                             var checkboxTheme = _this.lineDisplay[i] ? "theme-checkbox-line-" + i + "-checked" : "theme-checkbox-line-" + i + "-unchecked";
                             return "layout-checkbox " + checkboxTheme;
                         })
                         .attr("opacity", function () {
                             return _this.lineDisplay[i] ? 1 : 0.85;
                         })
                         .on("click", function () {
                             var checkboxId = $(this).attr("id");
                             var lineId = _this.getLineIdFromCheckboxId(checkboxId);
                             var isOpacity: boolean = ($(this).attr("opacity") === "1");
                             $(this).attr("opacity", isOpacity ? "0.85" : "1");
                             $(this).removeClass(isOpacity ? "theme-checkbox-line-" + lineId + "-checked" : "theme-checkbox-line-" + lineId + "-unchecked");
                             $(this).addClass(isOpacity ? "theme-checkbox-line-" + lineId + "-unchecked" : "theme-checkbox-line-" + lineId + "-checked");
                             $("#line-group" + lineId).css("display", isOpacity ? "none" : "inline");
                             _this.lineDisplay[lineId] = !isOpacity;
                             _this.configuration.set(DataViz.Config.Trends.wellKnownKeys.lineDisplay, _this.lineDisplay);
                         });

                $("#checkbox" + i + "end").width(LineChartPlotter.checkBoxLength / this.zoomRatio.heightRatio);
                $("#checkbox" + i + "end").height(LineChartPlotter.checkBoxLength / this.zoomRatio.heightRatio);

                legendRow.append("textarea")
                    .attr("id", "line-title" + i + "end")
                    .attr("class", "element-style layout-chart-legend-textarea" + " theme-legend-textarea-" + i)
                    .style("font-size", LineChartPlotter.legendFontSize / this.zoomRatio.heightRatio + "px")
                    .on("input", function () {
                        var lineId = _this.getLineIdFromLineTitleId($(this).attr("id"));
                        _this.lineTitleArray[lineId] = (<HTMLTextAreaElement>$(this)[0]).value;
                        _this.configuration.delaySet(DataViz.Config.Trends.wellKnownKeys.lineTitleArray, _this.lineTitleArray, 300);
                        if (!_this.isLegendEdited) {
                            _this.isLegendEdited = true;
                            _this.configuration.delaySet(DataViz.Config.Trends.wellKnownKeys.isLegendEdited, true, 300);
                        }
                    })
                    .on("keypress", function () {
                        if (d3.event.keyCode === 13 || d3.event.keyCode === 10) {
                            d3.event.preventDefault();
                            return false;
                        }
                    });

                $("#line-title" + i + "end").height(22 / this.zoomRatio.heightRatio); //"22" is the line title textarea's height
                // In TypeScript, jQuery prototype doesn't support to set outerWidth.
                (<any>$("#line-title" + i + "end")).outerWidth($("#div-legend").width() - LineChartPlotter.checkBoxLength / this.zoomRatio.heightRatio);
                (<HTMLTextAreaElement>$("#line-title" + i + "end")[0]).value = this.lineTitleArray[i];
            }
        }

        private drawLine(lineId: number) {
            if (!this.bindingData || !this.bindingData.yData[lineId]) {
                return;
            }

            var _this = this;
            var line = d3.select("#line-group" + lineId)
                            .append("svg:path")
                            .attr("id", "line" + lineId)
                            .attr("class", "theme-chart-line-" + lineId)
                            .style("stroke-width", function () {
                                return _this.bindingData.xData.length < LineChartPlotter.beSmallerLeastPointNumber ? LineChartPlotter.lineWidth / _this.zoomRatio.heightRatio
                                                                        : LineChartPlotter.lineWidthForMore / _this.zoomRatio.heightRatio;
                            })
                            .style("fill", "none")
                            .attr("d", this.linePlotter(this.bindingData.yData[lineId].data));

            var pointGroup = d3.select("#line-group" + lineId)
                                .append("svg:g")
                                .attr("id", "point-group" + lineId)
                                .style("display", "inline");

            var point = pointGroup.selectAll(".point")
                                    .data(this.bindingData.yData[lineId].data)
                                    .enter().append("svg:circle")
                                    .attr("id", (data: Trends.Data.PointDataOnLine, index: number) => {
                                        return "#point" + "line" + lineId + "column" + data.originalIndex + "end";
                                    })
                                    .attr("class", "theme-chart-line-" + lineId)
                                    .attr("cursor", "pointer")
                                    .attr("r", function () {
                                        return _this.bindingData.xData.length < LineChartPlotter.beSmallerLeastPointNumber ? LineChartPlotter.pointRadio / _this.zoomRatio.heightRatio
                                                                                : LineChartPlotter.pointRadioForMore / _this.zoomRatio.heightRatio;
                                    })
                                    .attr("cx", function (data: Trends.Data.PointDataOnLine, index: number) { return _this.xAxis(data.originalIndex); })
                                    .attr("cy", function (data: Trends.Data.PointDataOnLine, index: number) { return _this.yAxis(data.unformatted); })
                                    .on("mouseover", function () {
                                        d3.select(this).attr("r", function () {
                                            return _this.bindingData.xData.length < LineChartPlotter.beSmallerLeastPointNumber ? LineChartPlotter.pointHoverRadio / _this.zoomRatio.heightRatio
                                                                                    : LineChartPlotter.pointHoverRadioForMore / _this.zoomRatio.heightRatio;
                                        });
                                    })
                                    .on("mouseout", function () {
                                        d3.select(this).attr("r", function () {
                                            return _this.bindingData.xData.length < LineChartPlotter.beSmallerLeastPointNumber ? LineChartPlotter.pointRadio / _this.zoomRatio.heightRatio
                                                                                    : LineChartPlotter.pointRadioForMore / _this.zoomRatio.heightRatio;
                                        });
                                    })
                                    .on("click", function () {
                                        var pointId = d3.select(this).attr("id");
                                        var lineId = _this.getLineIdFromPointId(pointId);
                                        _this.promoteLineToTop(lineId);
                                        _this.drawCircleGroup(pointId, true);
                                        _this.clickedPointIdArray.push(pointId);
                                        _this.configuration.delaySet(DataViz.Config.Trends.wellKnownKeys.clickedPointIdArray, _this.clickedPointIdArray, 300);
                                    });

            for (var i = 0; i < this.clickedPointIdArray.length; i++) {
                var index = this.clickedPointIdArray[i].indexOf("line" + lineId);
                if (index > -1) {
                    this.drawCircleGroup(this.clickedPointIdArray[i], false);
                }
            }
        }

        private drawCircleGroup(pointId: string, beAnimated: boolean) {
            var lineId = this.getLineIdFromPointId(pointId);
            var column = this.getColumnFromPointId(pointId);
            var unformattedData: number = null;
            var formattedData: string = null;
            if (!this.bindingData.yData[lineId]) {
                return;
            }

            for (var i = 0; i < this.bindingData.yData[lineId].data.length; i++) {
                if (this.bindingData.yData[lineId].data[i].originalIndex === column) {
                    unformattedData = this.bindingData.yData[lineId].data[i].unformatted;
                    formattedData = this.bindingData.yData[lineId].data[i].formatted;
                    break;
                }
            }

            if (formattedData === null || unformattedData === null) {
                return;
            }

            var _this = this;
            var circleGroup = d3.select("#point-group" + lineId).append("svg:g")
                                .style("display", "inline")
                                .attr("opacity", 1)
                                .attr("cursor", "pointer")
                                .on("click", function () {
                                    d3.select(this).remove();
                                    var index = _this.clickedPointIdArray.indexOf("#point" + "line" + lineId + "column" + column + "end");
                                    _this.clickedPointIdArray.splice(index, 1);
                                    _this.configuration.delaySet(DataViz.Config.Trends.wellKnownKeys.clickedPointIdArray, _this.clickedPointIdArray, 300);
                                });

            circleGroup.append("svg:circle")
                        .attr("class", "theme-chart-line-" + lineId)
                        .attr("opacity", 1)
                        .attr("cx", Math.round(this.xAxis(column) * 100) / 100)
                        .attr("cy", this.yAxis(unformattedData))
                        .attr("r", 0)
                        .transition()
                        .duration(function () {
                            if (beAnimated) {
                                return LineChartPlotter.durationTime;
                            }
                            else {
                                return 0;
                            }
                        })
                        .attr("r", (formattedData.length > LineChartPlotter.maxTextLength)
                                    ? LineChartPlotter.radius[LineChartPlotter.maxTextLength - 1] / this.zoomRatio.heightRatio
                                    : LineChartPlotter.radius[formattedData.length - 1] / this.zoomRatio.heightRatio);

            var fontSize = (formattedData.length > LineChartPlotter.maxTextLength)
                                                ? LineChartPlotter.fontSize[LineChartPlotter.maxTextLength - 1]
                                                : LineChartPlotter.fontSize[formattedData.length - 1];
            circleGroup.append("svg:text")
                        .attr("class", "theme-chart-value layout-chart-value")
                        .attr("x", Math.round(this.xAxis(column) * 100) / 100)
                        .attr("y", this.yAxis(unformattedData))
                        .attr("dy", ".36em")
                        .attr("font-size", fontSize / this.zoomRatio.heightRatio)
                        .text((formattedData.length > LineChartPlotter.maxTextLength) ? formattedData.substring(0, 8) + "..." : formattedData)
                        .attr("opacity", 0)
                        .transition()
                        .duration(function () {
                            if (beAnimated) {
                                return LineChartPlotter.durationTime;
                            }
                            else {
                                return 0;
                            }
                        })
                        .attr("opacity", 1);
        }

        private getLineIdFromLineTitleId(lineTitleId: string): number {
            return this.getNumberFromString(lineTitleId, "line-title", "end");
        }

        private getLineIdFromCheckboxId(checkboxId: string): number {
            return this.getNumberFromString(checkboxId, "checkbox", "end");
        }

        private getLineIdFromPointId(pointId: string): number {
            return this.getNumberFromString(pointId, "line", "column");
        }

        private getColumnFromPointId(pointId: string): number {
            return this.getNumberFromString(pointId, "column", "end");
        }

        private getNumberFromString(orgString: string, startString: string, endString: string): number {
            var endIndex = orgString.indexOf(endString);
            var startIndex = orgString.indexOf(startString) + startString.length;
            var num = orgString.substring(startIndex, endIndex);
            return parseInt(num);
        }

        private promoteLineToTop(lineId: number) {
            if (lineId !== this.lineOrder[this.lineOrder.length - 1]) {
                if (d3.select("#line-group" + lineId)) {
                    d3.select("#line-group" + lineId).remove();
                    this.lineChart.append("svg:g")
                        .attr("id", "line-group" + lineId);
                }

                this.drawLine(lineId);

                //reset line order
                var index = this.lineOrder.indexOf(lineId);
                this.lineOrder.splice(index, 1);
                this.lineOrder.push(lineId);
                this.configuration.set(DataViz.Config.Trends.wellKnownKeys.lineOrder, this.lineOrder);
            }
        }

        private setMaxAndMin() {
            var isFirstNumber: boolean = true;
            var temp: number;
            for (var i = 0; i < this.lineNumber; i++) {
                if (this.bindingData.yData[i]) {
                    for (var j = 0; j < this.bindingData.yData[i].validDataCount; j++) {
                        temp = this.bindingData.yData[i].data[j].unformatted;

                        if (isFirstNumber) {
                            this.max = temp;
                            this.min = temp;
                            isFirstNumber = false;
                        }

                        this.max = Math.max(this.max, temp);
                        this.min = Math.min(this.min, temp);
                    }
                }
            }

            // There's no valid data
            if (isFirstNumber || this.max === null || this.max === undefined || this.min === null || this.min === undefined) {
                this.min = 0;
                this.max = 1;
            }
            else if (this.min === this.max) {
                if (this.min > 0) {
                    this.min = 0;
                }
                else if (this.min < 0) {
                    this.max = 0;
                }
                else {
                    this.min = -1;
                }
            }
        }

        private isPercentageFormat(): boolean {
            var count: number;
            for (var i = 0; i < this.lineNumber; i++) {
                if (this.bindingData.yData[i]) {
                    count = 0;
                    for (var j = 0; j < this.bindingData.yData[i].validDataCount; j++) {
                        if (this.bindingData.yData[i].data[j].formatted.lastIndexOf("%") !== -1) {
                            count++;
                        }
                    }

                    if (count < j / 2 || count === 0) {
                        return false;
                    }
                }
            }

            return true;
        }

        private getSvgElementWidth(elementId: string): number {
            var element = $("#" + elementId);
            if (element.get(0)) {
                return (<SVGTextElement>element.get(0)).getBBox().width;
            }

            return 0;
        }
    }
}