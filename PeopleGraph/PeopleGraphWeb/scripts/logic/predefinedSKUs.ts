/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
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
            defs.push(this.getGiantDefinition());
            defs.push(this.getCalloutDefinition());
            defs.push(this.getClassicDefinition());

            return defs;
        }

        private getGiantDefinition(): DataViz.SKUs.SKUDefinition {
            var def = new DataViz.SKUs.SKUDefinition();
            def.id = "peoplebar-giant";
            def.thumbnail = "../SKUs/peoplebar-giant.png";
            def.plotter = "DataViz.Chart.D3.PeopleBarGiantPlotterD3";
            def.layouter = "DataViz.Chart.D3.GiantLayouter";
            def.dataBinder = "DataViz.Data.Agave.DataBinder";
            def.dataConvertor = "DataViz.Data.PeopleBar.KeyValueDataConvertor";
            def.configurator = "DataViz.Config.Agave.Configurator";
            def.defaultTheme = "giant-redwhiteblack";
            def.defaultShape = "muscle-people";
            def.defaultLayout = "giant";

            var sampleData = {};
            sampleData["title"] = DataViz.Resources.SampleDataGaint.title;
            sampleData["data"] = [[DataViz.Resources.SampleDataGaint.row1, "85000"],
                                  [DataViz.Resources.SampleDataGaint.row2, "110000"],
                                  [DataViz.Resources.SampleDataGaint.row3, "65000"]];
            def.sampleData = sampleData;

            return def;
        }

        private getCalloutDefinition(): DataViz.SKUs.SKUDefinition {
            var def = new DataViz.SKUs.SKUDefinition();
            def.id = "peoplebar-callout";
            def.thumbnail = "../SKUs/peoplebar-callout.png";
            def.plotter = "DataViz.Chart.D3.PeopleBarCalloutPlotterD3";
            def.layouter = "DataViz.Chart.D3.CalloutLayouter";
            def.dataBinder = "DataViz.Data.Agave.DataBinder";
            def.dataConvertor = "DataViz.Data.PeopleBar.KeyValueDataConvertor";
            def.configurator = "DataViz.Config.Agave.Configurator";
            def.defaultTheme = "callout-blackyellow";
            def.defaultShape = "muscle-people";
            def.defaultLayout = "callout";

            var sampleData = {};
            sampleData["title"] = DataViz.Resources.SampleDataCallout.title;
            sampleData["data"] = [[DataViz.Resources.SampleDataCallout.row1, "150"],
                                  [DataViz.Resources.SampleDataCallout.row2, "70"],
                                  [DataViz.Resources.SampleDataCallout.row3, "90"]];
            def.sampleData = sampleData;

            return def;
        }

        private getClassicDefinition(): DataViz.SKUs.SKUDefinition {
            var def = new DataViz.SKUs.SKUDefinition();
            def.id = "peoplebar-classic";
            def.thumbnail = "../SKUs/peoplebar-classic.png";
            def.plotter = "DataViz.Chart.D3.PeopleBarClassicPlotterD3";
            def.layouter = "DataViz.Chart.D3.ClassicLayouter";
            def.dataBinder = "DataViz.Data.Agave.DataBinder";
            def.dataConvertor = "DataViz.Data.PeopleBar.KeyValueDataConvertor";
            def.configurator = "DataViz.Config.Agave.Configurator";
            def.defaultTheme = "classic-bluewhite";
            def.defaultShape = "muscle-people";
            def.defaultLayout = "classic";

            var sampleData = {};
            sampleData["title"] = DataViz.Resources.SampleDataClassic.title;
            sampleData["data"] = [[DataViz.Resources.SampleDataClassic.row1, "160"],
                                  [DataViz.Resources.SampleDataClassic.row2, "500"],
                                  [DataViz.Resources.SampleDataClassic.row3, "948"]];
            def.sampleData = sampleData;

            return def;
        }
    }
}