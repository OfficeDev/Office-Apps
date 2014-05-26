/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/layout.ts"/>
///<reference path="layouter.base.d3.ts"/>

declare var d3: any;
declare var $: any;

/**
  * This module contains the implementation of the layouter for the People Bar "giant" type
  */
module DataViz.Chart.D3 {
    "use strict";

    /**
      * The layouter for the People Bar "giant" type
      */
    export class GiantLayouter extends DataViz.Chart.D3.BaseLayouter {
        private static cxBoardMargin = 10;
        private static cyBoardMargin = 12;
        private static cyTitleGap = 24;
        private static cySeparatorGap = 8;

        private cxBoardMargin: number;
        private cyBoardMargin: number;
        private cyTitleGap: number;
        private cySeparatorGap: number;

        constructor() {
            super();
            this.cxBoardMargin = GiantLayouter.cxBoardMargin / this.ZoomRatio;
            this.cyBoardMargin = GiantLayouter.cyBoardMargin / this.ZoomRatio;
            this.cyTitleGap = GiantLayouter.cyTitleGap / this.ZoomRatio;
            this.cySeparatorGap = GiantLayouter.cySeparatorGap / this.ZoomRatio;
        }

        /**
          * Overriding {@link BaseLayout#layoutExtra}
          */
        public layoutExtra() {
            var root = d3.select(DataViz.Chart.defaultSVGRootId);
            var boardWidth = window.innerWidth || document.body.clientWidth;
            var boardHeight = window.innerHeight || document.body.clientHeight;

            var titleElement = root.select("#title");
            if (titleElement.empty()) {
                return;
            }

            var titleHeight = this.getTitleHeight(titleElement);

            titleElement
                .attr("x", boardWidth / 2)
                .attr("y", this.cyBoardMargin + titleHeight);

            var separator = root.select("line#separator");
            if (separator.empty()) {
                return;
            }

            var separatorY = this.cyBoardMargin + titleHeight + this.cyTitleGap;
            separator.attr("x1", this.cxBoardMargin)
                .attr("x2", boardWidth - this.cxBoardMargin)
                .attr("y1", separatorY)
                .attr("y2", separatorY);

            var chartRoot = root.select(DataViz.Chart.defaultChartRootId);
            if (chartRoot.empty()) {
                return;
            }

            var chartY = separatorY + this.cySeparatorGap;
            chartRoot.attr("y", chartY)
                .attr("height", boardHeight - chartY);

            super.injectPlaceholderForInnerSVG(chartRoot, "100%", boardHeight - chartY);
        }
    }
}