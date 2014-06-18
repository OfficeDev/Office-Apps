/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/utils.ts"/>
///<reference path="shared/config.ts"/>

declare var Office: any;

/**
  * This module contains the implementation of the app's specific configurator
  */
module DataViz.Config.Trends {
    "use strict";

    /**
      * The configuration keys used in this app
      */
    export var wellKnownKeys = {
        title: "title",
        shortdes1Title: "shortdes1-title",
        shortdes1Descript: "shortdes1-descript",
        longdesTitle: "longdes-title",
        longdesDescript: "longdes-descript",
        firstRowContainerWidth: "first-row-container-width",
        firstRowContainerHeight: "first-row-container-height",
        titleWidth: "title-parent-width",
        titleHeight: "title-parent-height",
        lineChartWidth: "line-chart-width",
        lineChartHeight: "line-chart-height",
        legendWidth: "legend-width",
        legendHeight: "legend-height",
        secondRowContainerWidth: "second-row-container-width",
        shortdes1GroupWidth: "shortdes1-group-width",
        longdesGroupWidth: "longdes-group-width",
        clickedPointIdArray: "clicked-pointid-array",
        lineOrder: "line-order",
        lineDisplay: "line-display",
        lineTitleArray: "line-title-array",
        bindingName: "binding-name",
        windowWidth: "window-width",
        windowHeight: "window-height",
        isLegendEdited: "is-legend-edited",
    };

    // We can only render five lines at most
    export var MaxLineNumber = 5;

    // One "column" means the column on the line chart
    // For example, the first point of each line is inside one column,  the second point is inside another column.
    export var MaxColumnNumber = 50;

    // The dafault display language is set to en-US.
    export var Culture: string = "en-US";

    /**
      * Reset clickedPointIdArray
      */
    export function resetClickedPointIdArrays() {
        DataViz.mainApp.Configuration.set(DataViz.Config.Trends.wellKnownKeys.clickedPointIdArray, []);
    }

    /**
      * Reset lineOrder
      */
    export function resetLineOrder() {
        var tempLineOrder: number[] = [];
        for (var i = 0; i < MaxLineNumber; i++) {
            tempLineOrder[i] = i;
        }

        DataViz.mainApp.Configuration.set(DataViz.Config.Trends.wellKnownKeys.lineOrder, tempLineOrder);
    }

    /**
      * Reset line display status
      */
    export function resetLineDisplay() {
        var tempLineDisplay: boolean[] = [];
        for (var i = 0; i < MaxLineNumber; i++) {
            tempLineDisplay[i] = true;
        }

        DataViz.mainApp.Configuration.set(DataViz.Config.Trends.wellKnownKeys.lineDisplay, tempLineDisplay);
    }

    /**
      * Reset line display status
      */
    export function resetLineTitleArray() {
        var tempLineTitleArray: string[] = [];
        for (var i = 0; i < MaxLineNumber; i++) {
            tempLineTitleArray[i] = DataViz.Utils.stringFormat(DataViz.Resources.UI.defaultLegendName, i + 1);
        }

        DataViz.mainApp.Configuration.set(DataViz.Config.Trends.wellKnownKeys.lineTitleArray, tempLineTitleArray);
        DataViz.mainApp.Configuration.set(DataViz.Config.Trends.wellKnownKeys.isLegendEdited, false);
    }

    /**
      * This is the sample data structure
      */
    class SampleText {
        public title: string;
        public subTitle: string;
        public subTitleDescript: string;
        public shortdes1Title: string;
        public shortdes1Descript: string;
        public shortdes2Title: string;
        public shortdes2Descript: string;
        public longdesTitle: string;
        public longdesDescript: string;
    }

    class SampleDataFormat {
        public lineTitles: string[];
        public formatted: string[][];
        public unformatted: string[][];
        public sampleText: SampleText;
        public dataPoints: string[];
    }

    export class SampleDataProvider {
        private data: SampleDataFormat;
        private renderData: any;

        constructor(jsonData: any) {
            this.data = <SampleDataFormat>jsonData;

            this.renderData = {};
            this.renderData["hasHeader"] = true;
            this.renderData["formatted"] = this.data.formatted;
            this.renderData["unformatted"] = this.data.unformatted;
        }

        public get LineTitles(): string[] {
            return this.data.lineTitles;
        }

        public get RenderData(): any {
            return this.renderData;
        }

        public get Title(): string {
            return this.data.sampleText.title;
        }

        public get SubTitle(): string {
            return this.data.sampleText.subTitle;
        }

        public get SubTitleDescript(): string {
            return this.data.sampleText.subTitleDescript;
        }

        public get Shortdes1Title(): string {
            return this.data.sampleText.shortdes1Title;
        }

        public get Shortdes1Descript(): string {
            return this.data.sampleText.shortdes1Descript;
        }

        public get Shortdes2Title(): string {
            return this.data.sampleText.shortdes2Title;
        }

        public get Shortdes2Descript(): string {
            return this.data.sampleText.shortdes2Descript;
        }

        public get LongdesTitle(): string {
            return this.data.sampleText.longdesTitle;
        }

        public get LongdesDescript(): string {
            return this.data.sampleText.longdesDescript;
        }

        public get DataPoints(): string[] {
            return this.data.dataPoints;
        }
    }

    /**
      * This is the specific configurator of the app
      */
    export class Configurator implements IConfigurator {
        private reentryFlag: boolean;

        constructor() {
            this.reentryFlag = false;
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            // Do nothing.
        }

        /**
          * Implementing {@link IConfigurator#loadAll}
          */
        public loadAll(configuration: Configuration) {
            if (!Office.context.document.settings) {
                return;
            }

            configuration.clear();

            this.reentryFlag = true;
            configuration.Keys.forEach((key: string, index: number, array: string[]) => {
                var value = Office.context.document.settings.get(key);
                if ((value !== null) && (value !== undefined)) {
                    configuration.set(key, value);
                }
            });
            this.reentryFlag = false;
        }

        /**
          * Implementing {@link IConfigurator#Save}
          */
        public save(key: string, value: any) {
            if (Office.context.document.settings) {
                Office.context.document.settings.set(key, value);
                Office.context.document.settings.saveAsync();
            }
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            if (!this.reentryFlag) {
                this.save(key, value);
            }
        }
    }
}