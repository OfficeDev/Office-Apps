/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

/**
  * This module contains the pre-defined SKU configs
  */
module DataViz.SKUs {
    "use strict";

    export class Predefines {
        private static instance: Predefines = null;

        public static get Instance(): Predefines {
            if (!Predefines.instance) {
                Predefines.instance = new Predefines;
            }

            return Predefines.instance;
        }

        /**
          * Get all the definitions of SKUs
          * @returns {DataViz.SKUs.SKUDefinition[]} SKU definitions
          */
        public getAll(): DataViz.SKUs.SKUDefinition[] {
            var defs = new Array();
            defs.push(this.getDefault());

            return defs;
        }

        private getDefault(): DataViz.SKUs.SKUDefinition {
            var def = new DataViz.SKUs.SKUDefinition();
            def.id = "trends-default";
            def.thumbnail = "";
            def.displayName = "trends-default";
            def.plotter = "Trends.Chart.LineChartPlotter";
            def.layouter = "Trends.Chart.Layouter";
            def.dataBinder = "Trends.Data.Agave.DataBinder";
            def.dataConvertor = "Trends.Data.DataConvertor";
            def.configurator = "DataViz.Config.Trends.Configurator";
            def.defaultTheme = "default-greenwhite";
            def.defaultShape = "";
            def.defaultLayout = "layout-trends-default";

            var sampleData = {};
            sampleData["formatted"] = [
                    ["Time", DataViz.Resources.SampleData.legend1, DataViz.Resources.SampleData.legend2],
                    [DataViz.Resources.SampleData.time1, "41", "61"],
                    [DataViz.Resources.SampleData.time2, "9", "15"],
                    [DataViz.Resources.SampleData.time3, "29", "40"],
                    [DataViz.Resources.SampleData.time4, "123", "83"],
                    [DataViz.Resources.SampleData.time5, "148", "107"],
                    [DataViz.Resources.SampleData.time6, "148", "109"],
                    [DataViz.Resources.SampleData.time7, "109", "130"],
                    [DataViz.Resources.SampleData.time8, "129", "172"],
                    [DataViz.Resources.SampleData.time9, "73", "110"]
                ];
            sampleData["unformatted"] = [
                    ["Time", DataViz.Resources.SampleData.legend1, DataViz.Resources.SampleData.legend2],
                    [DataViz.Resources.SampleData.time1, "41", "61"],
                    [DataViz.Resources.SampleData.time2, "9", "15"],
                    [DataViz.Resources.SampleData.time3, "29", "40"],
                    [DataViz.Resources.SampleData.time4, "123", "83"],
                    [DataViz.Resources.SampleData.time5, "148", "107"],
                    [DataViz.Resources.SampleData.time6, "148", "109"],
                    [DataViz.Resources.SampleData.time7, "109", "130"],
                    [DataViz.Resources.SampleData.time8, "129", "172"],
                    [DataViz.Resources.SampleData.time9, "73", "110"]
                ];
            sampleData["dataPoints"] = ["#pointline0column4end"];
            sampleData["sampleText"] = {
                    "title": DataViz.Resources.SampleData.title,
                    "shortdes1Title": DataViz.Resources.SampleData.shortDescriptionTitle,
                    "shortdes1Descript": DataViz.Resources.SampleData.shortDescription,
                    "longdesTitle": DataViz.Resources.SampleData.longDescriptionTitle,
                    "longdesDescript": DataViz.Resources.SampleData.longDescription
                };

            def.sampleData = sampleData;
            return def;
        }
    }
}