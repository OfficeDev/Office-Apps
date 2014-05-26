/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/chart.ts"/>
///<reference path="shared/layout.ts"/>
///<reference path="shared/decoration.ts"/>
///<reference path="data.convertor.peoplebar.ts"/>

declare var d3: any;
declare var $: any;

/**
  * This module contains the implementation of the base layouter
  */
module DataViz.Chart.D3 {
    "use strict";

    /**
      * The base class of all layouters based on D3
      */
    export class BaseLayouter extends DataViz.Tools.Pausable implements ILayouter {
        private zoomRatio: number;
        private cachedLayoutElementInstance: LayoutElementInstance[];

        constructor() {
            super();

            this.zoomRatio = DataViz.Utils.getZoomRatioForApp();
            this.cachedLayoutElementInstance = [];
        }

        public get ZoomRatio(): number {
            return this.zoomRatio;
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            this.cachedLayoutElementInstance.length = 0;
            this.resume();
        }

        /**
          * Implementing {@link ILayouter#Layout}
          */
        public layout(data: any) {
            this.relayout();
        }

        /**
          * Implementing {@link ILayoutChangeListener#onLayoutChanged}
          */
        public onLayoutChanged(layout: Layout) {
        }

        /**
          * Implementing {@link ILayoutChangeListener#onLayoutElementChanged}
          */
        public onLayoutElementChanged(layoutElement: LayoutElement) {
        }

        /**
          * Implementing {@link ILayoutChangeListener#onLayoutElementInstanceChanged}
          */
        public onLayoutElementInstanceChanged(layoutElement: LayoutElement, value: any) {
            this.cachedLayoutElementInstance.push(new LayoutElementInstance(layoutElement, value));

            if (!this.isPaused()) {
                this.layoutOneElementInstance(layoutElement, value);
            }
        }

        /**
          * The width and height settings for an inner SVG are not working properly. It always becomes "auto x auto".
          * Here is a workaround helper to inject a placeholder rect into the inner SVG.
          * In addition, this actually ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * @param {any} innserSVG The inner SVG node
          * @param {any} width The width of the placeholder (the expected width of the inner SVG)
          * @param {any} height The height of the placeholder (the expected height of the inner SVG)
          */
        public injectPlaceholderForInnerSVG(innerSVG: any, width: any, height: any) {
            if (d3.select("rect#innerSVG-placeholder").empty()) {
                innerSVG.append("rect")
                    .attr("id", "innerSVG-placeholder")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height)
                    .style("opacity", 0);
            }
        }

        /**
          * This is an overridable method that mostly should be used by sub classes to do extra layout
          * It actually ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          */
        public layoutExtra() {
            // Subclasses might override if needed
        }

        /**
          * This is a helper method mostly should be used by sub classes to get title height
          * It actually ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          */
        public getTitleHeight(title: any): number {
            var titleHeight = title.node().getBBox().height;
            if (title.text().trim() === "") {
                title.attr("visibility", "hidden");
                title.text("1");
                titleHeight = title.node().getBBox().height;
                title.text("");
                title.attr("visibility", "visible");
            }

            return titleHeight;
        }

        private relayout() {
            this.ensureDefinitions();

            DataViz.Chart.LayoutProvider.Instance.CurrentLayout.elements.forEach((layoutElement: LayoutElement, index: number, array: LayoutElement[]) => {
                this.layoutOneElement(layoutElement);
            });

            $("#title").css("font-size", 24 / this.zoomRatio + "pt");

            this.cachedLayoutElementInstance.forEach((leInstance: LayoutElementInstance, index: number, array: LayoutElementInstance[]) => {
                this.layoutOneElementInstance(leInstance.layoutElement, leInstance.value);
            });

            this.layoutExtra();
        }

        private layoutOneElement(layoutElement: LayoutElement) {
            var root = d3.select(DataViz.Chart.defaultSVGRootId)
            var element = root.select("#" + layoutElement.id);

            if (element.empty()) {
                element = root.append(layoutElement.element)
                    .attr("id", layoutElement.id);

                if (layoutElement.cssClass) {
                    element.classed(layoutElement.cssClass, true);
                }

                layoutElement.attributes.forEach(
                    (attr: Attribute, index: number, array: Attribute[]) => {
                        element.attr(attr.name, attr.value);
                    });

                layoutElement.styles.forEach(
                    (style: Style, index: number, array: Style[]) => {
                        element.style(style.name, style.value);
                    });
            }
        }

        private layoutOneElementInstance(layoutElement: LayoutElement, value: any) {
            var element = d3.select(DataViz.Chart.defaultSVGRootId).select("#" + layoutElement.id);
            if (element.empty()) {
                return;
            }

            if ((value !== null) && (value !== undefined)) {
                element.text(<string>value);
            }
        }

        private ensureDefinitions() {
            var root = d3.select(DataViz.Chart.defaultSVGRootId);
            var defs = root.select("defs");
            if (defs.empty()) {
                defs = root.append("defs");
            }

            if (defs.select("pattern#backgroundPattern").empty()) {
                var pattern = defs.append("pattern")
                    .attr("id", "backgroundPattern")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 8)
                    .attr("height", 8)
                    .attr("patternUnits", "userSpaceOnUse");

                pattern.append("rect")
                    .attr("class", "chart-background")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 8)
                    .attr("height", 8);

                pattern.append("path")
                    .attr("d", "M8,8 8,7.717 7.717,8 Z M8,0 7.717,0 0,7.717 0,8 0.283,8 8,0.283 Z M0,0 0,0.283 0.283,0 Z")
                    .attr("class", "chart-background-path");
            }
        }
    }
}