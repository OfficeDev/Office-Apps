/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/chart.ts"/>
///<reference path="shared/layout.ts"/>
///<reference path="shared/decoration.ts"/>
///<reference path="../app.ts"/>

declare var d3: any;
declare var $: any;

/**
  * This module contains the implementation of the base layouter
  */
module Trends.Chart {
    "use strict";

    /**
      * The base class of all layouters based on D3
      */
    export class Layouter extends DataViz.Tools.Pausable implements DataViz.Chart.ILayouter {
        private static originWindowWidth = 840;
        private static originWindowHeight = 435;
        private static bodyOriginPadding = "0px 20px 10px 20px";
        private static bodyOriginMinWidth = 500;
        private static bodyOriginMinHeight = 290;
        private static bodyFinalMinWidth = 320;
        private static bodyFinalMinHeight = 200;
        private static floatMenuOriginHeight = 35;
        private static xGrid = 5;
        private static yGrid = 5;
        private static deviationWidth = 3;
        private cachedData: any;
        private cachedLayoutElementInstances: Object;
        private currentLayout: DataViz.Chart.Layout;
        private layoutElements: LayoutElements;
        private firstRelayout: boolean;

        public static getZoomRatioRelativeLast(): ZoomRatio {
            var windowWidth = window.innerWidth ? window.innerWidth : document.body.clientWidth;
            var windowHeight = window.innerHeight ? window.innerHeight : document.body.clientHeight;
            var savedWidowWidth = DataViz.mainApp.Configuration.get(DataViz.Config.Trends.wellKnownKeys.windowWidth);
            var savedWindowHeight = DataViz.mainApp.Configuration.get(DataViz.Config.Trends.wellKnownKeys.windowHeight);
            if (!savedWidowWidth) {
                savedWidowWidth = Layouter.originWindowWidth;
                savedWindowHeight = Layouter.originWindowHeight;
                DataViz.mainApp.Configuration.delaySet(DataViz.Config.Trends.wellKnownKeys.windowWidth, windowWidth);
                DataViz.mainApp.Configuration.delaySet(DataViz.Config.Trends.wellKnownKeys.windowHeight, windowHeight);
            }

            return new ZoomRatio(savedWidowWidth / windowWidth, savedWindowHeight / windowHeight);
        }

        public static getZoomRatioRelativeOrigin(): ZoomRatio {
            var windowWidth = window.innerWidth ? window.innerWidth : document.body.clientWidth;
            var windowHeight = window.innerHeight ? window.innerHeight : document.body.clientHeight;
            return new ZoomRatio(Layouter.originWindowWidth / windowWidth, Layouter.originWindowHeight / windowHeight);
        }

        constructor() {
            super();
            var zoomRatio = DataViz.Utils.getZoomRatioForApp();
            var dataButton = $("#data-button");
            var settingButton = $("#setting-button");
            var width = Math.floor(dataButton.width() / zoomRatio);
            dataButton.width(width);
            dataButton.height(width);
            settingButton.width(width);
            settingButton.height(width);
            this.firstRelayout = true;
            this.cachedLayoutElementInstances = {};
            this.layoutElements = new LayoutElements();
            this.currentLayout = DataViz.Chart.LayoutProvider.Instance.CurrentLayout;
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            this.setWindowResizeListener();
            this.cachedLayoutElementInstances = {};
            this.resume();
        }

        /**
          * Implementing {@link ILayouter#Layout}
          */
        public layout(data: any) {
            this.cachedData = data;

            this.relayout();
        }

        /**
          * Implementing {@link ILayoutChangeListener#onLayoutChanged}
          */
        public onLayoutChanged(layout: DataViz.Chart.Layout) {
        }

        /**
          * Implementing {@link ILayoutChangeListener#onLayoutElementChanged}
          */
        public onLayoutElementChanged(layoutElement: DataViz.Chart.LayoutElement) {
        }

        /**
          * Implementing {@link ILayoutChangeListener#onLayoutElementInstanceChanged}
          */
        public onLayoutElementInstanceChanged(layoutElement: DataViz.Chart.LayoutElement, value: any) {
            this.cachedLayoutElementInstances[layoutElement.id] = value;

            if (!this.isPaused()) {
                this.layoutOneElementInstance(layoutElement.id, value);
            }
        }

        private relayout() {
            var zoomRatioRelativeOrigin: ZoomRatio = Layouter.getZoomRatioRelativeOrigin();
            $("body").css("padding", Layouter.bodyOriginPadding);
            $("body").css("min-width", Math.max(Layouter.bodyOriginMinWidth / zoomRatioRelativeOrigin.widthRatio, Layouter.bodyFinalMinWidth));
            $("body").css("min-height", Math.max(Layouter.bodyOriginMinHeight / zoomRatioRelativeOrigin.heightRatio, Layouter.bodyFinalMinHeight));
            $("#float-menu-parent").height(Layouter.floatMenuOriginHeight / zoomRatioRelativeOrigin.heightRatio);

            this.handleNonContentLengthInHDPI($("body"));
            this.currentLayout.elements.forEach((layoutElement: DataViz.Chart.LayoutElement, index: number, array: DataViz.Chart.LayoutElement[]) => {
                this.layoutOneElement(layoutElement);
            });

            for (var elementId in this.cachedLayoutElementInstances) {
                this.layoutOneElementInstance(elementId, this.cachedLayoutElementInstances[elementId]);
            }

            this.layoutElements.resetLayoutElements();
            var windowWidth = window.innerWidth ? window.innerWidth : document.body.clientWidth;
            var windowHeight = window.innerHeight ? window.innerHeight : document.body.clientHeight;
            $("body").width(windowWidth - this.layoutElements.Body.ElementNonContentWidth);
            $("body").height(windowHeight - this.layoutElements.Body.ElementNonContentHeight);
            if (this.firstRelayout) {
                this.firstRelayout = false;
                this.handleWindowResizeWidth(windowWidth);
                this.handleWindowResizeHeight(windowHeight);
            }
        }

        private layoutOneElement(layoutElement: DataViz.Chart.LayoutElement): void {
            var thisLayouter = this;
            var parent = d3.select("#" + layoutElement.parentId);
            if (parent.empty()) {
                return;
            }

            var element = d3.select("#" + layoutElement.id);
            if (!element.empty()) {
                element.remove();
            }

            element = d3.select("#" + layoutElement.parentId).append(layoutElement.element).attr("id", layoutElement.id)

            if (layoutElement.attributes) {
                layoutElement.attributes.forEach(
                    (attr: DataViz.Chart.Attribute, index: number, array: DataViz.Chart.Attribute[]) => {
                        element.attr(attr.name, attr.value);
                    });
            }

            if (layoutElement.styles) {
                layoutElement.styles.forEach(
                    (style: DataViz.Chart.Style, index: number, array: DataViz.Chart.Style[]) => {
                        element.style(style.name, style.value);
                    });
            }

            if (layoutElement.cssClass) {
                element.classed(layoutElement.cssClass, true);
            }

            if (layoutElement.element === "textarea") {
                element.on("input", function () {
                    DataViz.mainApp.LayoutInstance.delaySetValueNoNotify($(this)[0].id, (<HTMLTextAreaElement>$(this)[0]).value);
                    thisLayouter.cachedLayoutElementInstances[$(this)[0].id] = (<HTMLTextAreaElement>$(this)[0]).value;
                });

                if (layoutElement.forceOneLine) {
                    element.on("keypress", function() {
                        if (d3.event.keyCode === 13 || d3.event.keyCode === 10) {
                            d3.event.preventDefault();
                            return;
                        }
                    });
                }
            }

            var jqueryElement = $("#" + layoutElement.id); //For using the jquery.ui api: resizable.
            var zoomRatioRelativeOrigin: ZoomRatio = Layouter.getZoomRatioRelativeOrigin();
            var zoomRatioRelativeLast: ZoomRatio = Layouter.getZoomRatioRelativeLast();
            jqueryElement.css("min-width", Math.floor(parseInt(jqueryElement.css("min-width")) / zoomRatioRelativeOrigin.widthRatio));
            var width = DataViz.mainApp.Configuration.get(jqueryElement.attr("id") + "-width");
            if (width !== undefined && width !== null) {
                jqueryElement.css("width", width);
            }

            var height = DataViz.mainApp.Configuration.get(jqueryElement.attr("id") + "-height");
            if (height !== undefined && height !== null) {
                jqueryElement.css("height", height);
            }

            if (layoutElement.resizable) {
                (<any>jqueryElement).resizable(
                {
                    handles: "e",
                    autoHide: true,
                    grid: [Layouter.xGrid, Layouter.yGrid],
                    resize: (e: any, ui: any) => {
                        var elementId = ui.element[0].id;
                        var elementWidth = ui.size.width;
                        var elementOriginWidth = ui.originalSize.width;

                        $("#line-chart").focus();

                        switch (elementId) {
                            case "title-parent":
                                this.onElementResize(this.layoutElements.TitleParent, elementWidth, elementOriginWidth, this.layoutElements.LineChart, this.layoutElements.Legend);
                                DataViz.mainApp.CurrentSKU.Plotter.delayPlot(DataViz.mainApp.CurrentSKU.Visualizer.CachedData);
                                break;

                            case "line-chart":
                                this.onElementResize(this.layoutElements.LineChart, elementWidth, elementOriginWidth, this.layoutElements.Legend, this.layoutElements.TitleParent);
                                DataViz.mainApp.CurrentSKU.Plotter.delayPlot(DataViz.mainApp.CurrentSKU.Visualizer.CachedData);
                                break;

                            case "shortdes1-group":
                                this.onElementResize(this.layoutElements.Shortdes1Group, elementWidth, elementOriginWidth, this.layoutElements.LongdesGroup, null);
                                break;

                            default:
                                break;
                        }
                    }
                });
            }

            this.handleNonContentLengthInHDPI(jqueryElement);
            if (layoutElement.element === "textarea") {
                jqueryElement.css("font-size",
                    parseInt(jqueryElement.css("font-size")) / zoomRatioRelativeOrigin.heightRatio + "px");
            }
            else {
                var jqueryElementWidth: number = Math.floor(jqueryElement.width() / zoomRatioRelativeLast.widthRatio);
                jqueryElement.width(jqueryElementWidth);
                if (!DataViz.mainApp.Configuration.get(jqueryElement.attr("id") + "-width")) {
                    DataViz.mainApp.Configuration.delaySet(jqueryElement.attr("id") + "-width", jqueryElementWidth);
                }
            }

            if (jqueryElement.attr("id") !== "title") {
                jqueryElement.height(Math.floor(jqueryElement.height() / zoomRatioRelativeOrigin.heightRatio));
            }
        }

        private handleNonContentLengthInHDPI(jqueryElement: any) {
            var ratio: ZoomRatio = Layouter.getZoomRatioRelativeOrigin();
            jqueryElement.css("padding-left", Math.floor(parseInt(jqueryElement.css("padding-left")) / ratio.widthRatio));
            jqueryElement.css("padding-right", Math.floor(parseInt(jqueryElement.css("padding-right")) / ratio.widthRatio));
            jqueryElement.css("padding-top", Math.floor(parseInt(jqueryElement.css("padding-top")) / ratio.heightRatio));
            jqueryElement.css("padding-bottom", Math.floor(parseInt(jqueryElement.css("padding-bottom")) / ratio.heightRatio));
            jqueryElement.css("margin-left", Math.floor(parseInt(jqueryElement.css("margin-left")) / ratio.widthRatio));
            jqueryElement.css("margin-right", Math.floor(parseInt(jqueryElement.css("margin-right")) / ratio.widthRatio));
            jqueryElement.css("margin-top", Math.floor(parseInt(jqueryElement.css("margin-top")) / ratio.heightRatio));
            jqueryElement.css("margin-bottom", Math.floor(parseInt(jqueryElement.css("margin-bottom")) / ratio.heightRatio));
        }

        private layoutOneElementInstance(layoutElementId: string, value: any) {
            var element = d3.select("#" + layoutElementId);

            if (element.empty()) {
                return;
            }

            if ((value !== null) && (value !== undefined)) {
                element.text(<string>value);
            }
        }

        private onElementResize(element: ElementWithFixedProperties, elementWidth: number, elementOriginWidth: number, peerElement1: ElementWithFixedProperties, peerElement2: ElementWithFixedProperties) {
            if (!this.layoutElements.Body || !element || !peerElement1) {
                return;
            }

            var bodyWidthNoPadding = this.layoutElements.Body.Element.width() - Layouter.deviationWidth;
            var ElementMinWidth = element.ElementMinWidth;
            var peerElement1MinWidth = peerElement1.ElementMinWidth;
            var peerElement2Width = peerElement2 ? peerElement2.Element.outerWidth() : 0;

            elementWidth += element.ElementNonContentWidth + element.getBorderWidth();
            elementOriginWidth += element.ElementNonContentWidth + element.getBorderWidth();

            if (elementWidth > elementOriginWidth) {
                var maxWidth = bodyWidthNoPadding - peerElement1MinWidth - peerElement2Width;
                elementWidth = (elementWidth < maxWidth) ? elementWidth : maxWidth;
            }
            else {
                if (elementOriginWidth === ElementMinWidth) {
                    return;
                }

                elementWidth = (elementWidth > ElementMinWidth) ? elementWidth : ElementMinWidth;
            }

            var actualPeerElement1Width = bodyWidthNoPadding - elementWidth - peerElement2Width;
            this.setWidth(peerElement1, actualPeerElement1Width);
            this.setWidth(element, elementWidth);
        }

        private setWindowResizeListener() {
            var timer: any;
            var delayTime: number = 100;
            var resizeHandler = (e: any) => {
                if (e.target === window) {
                    if (timer) {
                        clearTimeout(timer);
                    }

                    timer = setTimeout(() => {
                        var windowWidth = window.innerWidth ? window.innerWidth : document.body.clientWidth;
                        var windowHeight = window.innerHeight ? window.innerHeight : document.body.clientHeight;

                        this.relayout();
                        this.handleWindowResizeWidth(windowWidth);
                        this.handleWindowResizeHeight(windowHeight);
                        this.layoutElements.resetLayoutElements();
                        DataViz.mainApp.CurrentSKU.Plotter.delayPlot(DataViz.mainApp.CurrentSKU.Visualizer.CachedData, 50);
                        DataViz.mainApp.Configuration.set(DataViz.Config.Trends.wellKnownKeys.windowWidth, windowWidth);
                        DataViz.mainApp.Configuration.set(DataViz.Config.Trends.wellKnownKeys.windowHeight, windowHeight);
                    }, delayTime);
                }
            };

            $(window).off("resize", resizeHandler);
            $(window).on("resize", resizeHandler);
        }

        private handleWindowResizeWidth(windowWidth: number) {
            var drawAreaWidth = (windowWidth > this.layoutElements.Body.ElementMinWidth) ? windowWidth - Layouter.deviationWidth : this.layoutElements.Body.ElementMinWidth;
            var drawAreaContentWidth = drawAreaWidth - this.layoutElements.Body.ElementNonContentWidth;
            var lineChart = this.layoutElements.LineChart;
            var titleParent = this.layoutElements.TitleParent;
            var legend = this.layoutElements.Legend;

            this.setWidth(this.layoutElements.FirstRowContainer, drawAreaContentWidth);
            this.setWidth(this.layoutElements.SecondRowContainer, drawAreaContentWidth);

            var lineChartWidth = drawAreaContentWidth - titleParent.Element.outerWidth() - legend.Element.outerWidth();
            lineChartWidth = (lineChartWidth > lineChart.ElementMinWidth) ? lineChartWidth : lineChart.ElementMinWidth;
            this.setWidth(lineChart, lineChartWidth);

            var legendWidth = drawAreaContentWidth - titleParent.Element.outerWidth() - lineChartWidth;
            legendWidth = (legendWidth > legend.ElementMinWidth) ? legendWidth : legend.ElementMinWidth;
            this.setWidth(legend, legendWidth);

            var titleWidth = drawAreaContentWidth - lineChartWidth - legendWidth;
            titleWidth = (titleWidth > titleParent.ElementMinWidth) ? titleWidth : titleParent.ElementMinWidth;
            this.setWidth(titleParent, titleWidth);

            var shortdes1WidthOrigin = this.layoutElements.Shortdes1Group.Element.outerWidth();
            var longdesWidthOrigin = this.layoutElements.LongdesGroup.Element.outerWidth();
            var originWidth = shortdes1WidthOrigin + longdesWidthOrigin;
            this.setWidth(this.layoutElements.Shortdes1Group, Math.floor(shortdes1WidthOrigin * drawAreaContentWidth / originWidth));
            this.setWidth(this.layoutElements.LongdesGroup, Math.floor(longdesWidthOrigin * drawAreaContentWidth / originWidth));
        }

        private handleWindowResizeHeight(windowHeight: number) {
            var drawAreaHeight = (windowHeight > this.layoutElements.Body.ElementMinHeight) ? (windowHeight - Layouter.deviationWidth) : this.layoutElements.Body.ElementMinHeight;
            var firstRowContainerHeight = drawAreaHeight - this.layoutElements.Body.ElementNonContentHeight - this.layoutElements.FloatMenuParent.ElementFixedHeight
                                                         - this.layoutElements.SecondRowContainer.ElementFixedHeight - this.layoutElements.FirstRowContainer.ElementNonContentHeight
                                                         - this.layoutElements.FirstRowContainer.getBorderHeight();
            this.setHeight(this.layoutElements.FirstRowContainer, firstRowContainerHeight);
            this.setHeight(this.layoutElements.LineChart, firstRowContainerHeight);
            this.setHeight(this.layoutElements.TitleParent, firstRowContainerHeight);
            this.setHeight(this.layoutElements.Legend, firstRowContainerHeight);
        }

        private setWidth(layoutElement: ElementWithFixedProperties, width: number) {
            var contentWidth = Math.floor(width - layoutElement.ElementNonContentWidth - layoutElement.getBorderWidth());
            layoutElement.Element.width(contentWidth);
            DataViz.mainApp.Configuration.delaySet(layoutElement.Element.attr("id") + "-width", contentWidth);
        }

        private setHeight(layoutElement: ElementWithFixedProperties, height: number) {
            var zoomRatioRelativeOrigin: ZoomRatio = Layouter.getZoomRatioRelativeOrigin();
            var element = layoutElement.Element;
            element.height(height);
            DataViz.mainApp.Configuration.delaySet(element.attr("id") + "-height", height * zoomRatioRelativeOrigin.heightRatio);
        }
    }

    export class ElementWithFixedProperties {
        private element: any;
        private elementNonContentWidth: number;
        private elementMinWidth: number;
        private elementNonContentHeight: number;
        private elementMinHeight: number;
        private elementFixedHeight: number;

        constructor(elementId: string, isHeightFixed: boolean) {
            this.element = $("#" + elementId);
            this.elementNonContentWidth = this.getElementNonContentWidth(this.element);
            this.elementMinWidth = parseInt(this.element.css("min-width")) + this.elementNonContentWidth + this.getBorderWidth();

            if (!isHeightFixed) {
                this.elementNonContentHeight = this.getElementNonContentHeight(this.element);
                this.elementMinHeight = parseInt(this.element.css("min-height")) + this.elementNonContentHeight + this.getBorderHeight();
            }
            else {
                this.elementFixedHeight = this.element.outerHeight();
            }
        }

        public get Element(): any {
            return this.element;
        }

        public get ElementNonContentWidth(): number {
            return this.elementNonContentWidth;
        }

        public get ElementMinWidth(): number {
            return this.elementMinWidth;
        }

        public get ElementNonContentHeight(): number {
            return this.elementNonContentHeight;
        }

        public get ElementMinHeight(): number {
            return this.elementMinHeight;
        }

        public get ElementFixedHeight(): number {
            return this.elementFixedHeight;
        }

        public getBorderWidth() {
            return Math.ceil(parseFloat(this.element.css("border-left-width")) + parseFloat(this.element.css("border-right-width")));
        }

        public getBorderHeight() {
            return Math.ceil(parseFloat(this.element.css("border-top-width")) + parseFloat(this.element.css("border-bottom-width")));
        }

        private getElementNonContentWidth(element: any): number {
            return parseInt(element.css("padding-left")) + parseInt(element.css("padding-right")) + parseInt(element.css("margin-left")) + parseInt(element.css("margin-right"));
        }

        private getElementNonContentHeight(element: any): number {
            return parseInt(element.css("padding-top")) + parseInt(element.css("padding-bottom")) + parseInt(element.css("margin-top")) + parseInt(element.css("margin-bottom"));
        }
    }

    export class LayoutElements {
        private body: ElementWithFixedProperties;
        private floatMenuParent: ElementWithFixedProperties;
        private firstRowContainer: ElementWithFixedProperties;
        private secondRowContainer: ElementWithFixedProperties;
        private titleParent: ElementWithFixedProperties;
        private lineChart: ElementWithFixedProperties;
        private legend: ElementWithFixedProperties;
        private shortdes1Group: ElementWithFixedProperties;
        private longdesGroup: ElementWithFixedProperties;

        constructor() {
            this.body = null;
            this.floatMenuParent = null;
            this.firstRowContainer = null;
            this.secondRowContainer = null;
            this.titleParent = null;
            this.lineChart = null;
            this.legend = null;
            this.shortdes1Group = null;
            this.longdesGroup = null;
        }

        public resetLayoutElements() {
            this.body = new ElementWithFixedProperties("background", false);
            this.floatMenuParent = new ElementWithFixedProperties("float-menu-parent", true);
            this.firstRowContainer = new ElementWithFixedProperties("first-row-container", false);
            this.secondRowContainer = new ElementWithFixedProperties("second-row-container", true);
            this.titleParent = new ElementWithFixedProperties("title-parent", false);
            this.lineChart = new ElementWithFixedProperties("line-chart", false);
            this.legend = new ElementWithFixedProperties("legend", false);
            this.shortdes1Group = new ElementWithFixedProperties("shortdes1-group", true);
            this.longdesGroup = new ElementWithFixedProperties("longdes-group", true);
        }

        public get Body(): ElementWithFixedProperties {
            return this.body;
        }

        public get FloatMenuParent(): ElementWithFixedProperties {
            return this.floatMenuParent;
        }

        public get FirstRowContainer(): ElementWithFixedProperties {
            return this.firstRowContainer;
        }

        public get SecondRowContainer(): ElementWithFixedProperties {
            return this.secondRowContainer;
        }

        public get TitleParent(): ElementWithFixedProperties {
            return this.titleParent;
        }

        public get LineChart(): ElementWithFixedProperties {
            return this.lineChart;
        }

        public get Legend(): ElementWithFixedProperties {
            return this.legend;
        }

        public get Shortdes1Group(): ElementWithFixedProperties {
            return this.shortdes1Group;
        }

        public get LongdesGroup(): ElementWithFixedProperties {
            return this.longdesGroup;
        }
    }

    export class ZoomRatio {
        widthRatio: number;
        heightRatio: number;
        maxRatio: number;
        minRatio: number;

        constructor(widthRatio: number, heightRatio: number) {
            this.widthRatio = widthRatio;
            this.heightRatio = heightRatio;
            this.maxRatio = Math.max(this.widthRatio, this.heightRatio);
            this.minRatio = Math.min(this.widthRatio, this.heightRatio);
        }
    }
}