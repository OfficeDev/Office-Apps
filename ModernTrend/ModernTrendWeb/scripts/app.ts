/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

///<reference path="logic/shared/controller.ts"/>
///<reference path="logic/shared/config.ts"/>
///<reference path="logic/shared/layout.ts"/>
///<reference path="logic/shared/skus.ts"/>
///<reference path="logic/shared/decoration.ts"/>
///<reference path="logic/data.binder.agave.ts"/>
///<reference path="logic/configurator.agave.ts"/>
///<reference path="UX/BindingPaneSpecific.ts"/>
///<reference path="UX/Home.ts"/>
///<reference path="logic/data.binder.agave.ts"/>

declare var $: any;
declare var Office: any;

/**
  * This is the main module containing the entry point of the app.
  */
module DataViz {
    "use strict";

    /**
      * The main app instance
      */
    export var mainApp: App;

    // On the devices with >100% display ratio, the layout gets mess. Delay 100ms for working around.
    Office.initialize = (reason: string) => {
        $(document).ready(() => {
            DataViz.mainApp = new App();
            setTimeout(() => {
                var resourceUrl: string = "../resources/en-us/resources.js";

                // check if the target resource file exists
                $.ajaxSetup({
                    cache: true
                });

                loadResourcesAndInitApp(resourceUrl);
            }, 100);
        });
    }

    function loadResourcesAndInitApp(resourceUrl: string) {
        var retryCount: number = 3;
        $.getScript(resourceUrl, () => {
            ensureDependancies(retryCount, () => {
                DataViz.mainApp.init();
            });
        });
    }

    function ensureDependancies(retryCount: number, callback: () => any) {
        if (typeof(d3) !== "undefined") {
            callback();
        }
        else {
            reloadD3Library(retryCount, callback);
        }
    }

    function reloadD3Library(retryCount:number, callback: () => any) {
        if (retryCount >0 ) {
            $.getScript("../scripts/opensource/d3/d3.v3.min.js?random=" + Math.floor(Math.random() * 10000000), () => {
                    ensureDependancies(retryCount - 1, callback);
                })
                .fail(() => {
                    reloadD3Library(retryCount - 1, callback);
                });
        }
    }

    /**
      * This class represents the primary entry-point and workflow of the app
      */
    export class App implements DataViz.Config.IConfigurationChangeListener, DataViz.Chart.IVisualizationListener {
        private static paneWidth = 220;
        private static configurationKeys =
        [
            DataViz.Config.wellKnownKeys.theme,
            DataViz.Config.wellKnownKeys.sku,
            DataViz.Config.Trends.wellKnownKeys.titleWidth,
            DataViz.Config.Trends.wellKnownKeys.titleHeight,
            DataViz.Config.Trends.wellKnownKeys.lineChartWidth,
            DataViz.Config.Trends.wellKnownKeys.lineChartHeight,
            DataViz.Config.Trends.wellKnownKeys.legendWidth,
            DataViz.Config.Trends.wellKnownKeys.legendHeight,
            DataViz.Config.Trends.wellKnownKeys.shortdes1GroupWidth,
            DataViz.Config.Trends.wellKnownKeys.longdesGroupWidth,
            DataViz.Config.Trends.wellKnownKeys.clickedPointIdArray,
            DataViz.Config.Trends.wellKnownKeys.lineOrder,
            DataViz.Config.Trends.wellKnownKeys.lineDisplay,
            DataViz.Config.Trends.wellKnownKeys.lineTitleArray,
            DataViz.Config.Trends.wellKnownKeys.bindingName,
            DataViz.Config.Trends.wellKnownKeys.windowWidth,
            DataViz.Config.Trends.wellKnownKeys.windowHeight,
            DataViz.Config.Trends.wellKnownKeys.isLegendEdited,
        ];

        private mainUX: Trends.UX.MainUX;
        private currentSKU: DataViz.SKUs.SKUInstance;
        private configuration: DataViz.Config.Configuration;
        private layoutInstance: DataViz.Chart.LayoutInstance;
        private reentryFlag: boolean;
        private bindingPane: DataViz.UX.BindingPane;

        constructor() {
            this.mainUX = null;
            this.currentSKU = null;
            this.configuration = null;
            this.layoutInstance = null;
            this.reentryFlag = false;
            this.bindingPane = null;
        }

        /**
          * Gets the current SKU instance
          * @returns {DataViz.SKUs.SKUInstance} The current SKU instance
          */
        public get CurrentSKU(): DataViz.SKUs.SKUInstance {
            return this.currentSKU;
        }

        /**
          * Gets the configuration instance
          * @returns {Config.Configuration} The configuration instance
          */
        public get Configuration(): DataViz.Config.Configuration {
            return this.configuration;
        }

        /**
          * Gets the layout instance
          * @returns {DataViz.Chart.LayoutInstance} The layout instance
          */
        public get LayoutInstance(): DataViz.Chart.LayoutInstance {
            return this.layoutInstance;
        }

        /**
          * Initializes the app
          */
        public init() {
            var thisApp = this;
            thisApp.bindingPane = DataViz.UX.BindingPaneSpecific.getInstance();
            thisApp.bindingPane.updateBindingPane({
                sampleData: [[DataViz.Resources.BindingPane.sampleDataHeader1, DataViz.Resources.BindingPane.sampleDataHeader2, DataViz.Resources.BindingPane.sampleDataHeader3],
                             [DataViz.Resources.BindingPane.sampleDataTime1, "41", "61"],
                             [DataViz.Resources.BindingPane.sampleDataTime2, "9", "15"],
                             [DataViz.Resources.BindingPane.sampleDataTime3, "29", "40"]],
                handleDataSelection: () => {
                    thisApp.bindingPane.handleDataSelection();
                },
                buttonOKCallback: (bindingData: any) => {
                    this.currentSKU.Controller.bindDataBySelection();
                    DataViz.UX.DataPane.Instance.hide();
                },
                title: DataViz.Resources.BindingPane.title,
                subtitle: DataViz.Resources.BindingPane.subtitle,
                buttonOKText: DataViz.Resources.BindingPane.buttonOKText,
                buttonCancelText: DataViz.Resources.BindingPane.buttonCancelText,
            });
            DataViz.SKUs.SKUProvider.Instance.CurrentSKUId = "trends-default";
            DataViz.SKUs.SKUProvider.Instance.loadAll(DataViz.SKUs.Predefines.Instance.getAll(), (): void => {
                DataViz.Chart.LayoutProvider.Instance.loadAll((): void => {
                    DataViz.Decoration.ThemeProvider.Instance.loadAll((): void => {
                        thisApp.setupNewSKU();
                    });
                });
            });
        }

        /**
          * Binds to the selected cells (by prompt)
          */
        public bindData() {
            this.bindingPane.show();
        }

        // Implementing IConfigurationChangeListener
        public onConfigurationChanged(key: string, value: any) {
            switch (key) {
                case DataViz.Config.wellKnownKeys.sku:
                    if (this.reentryFlag) {
                        return;
                    }

                    if ((!this.currentSKU) || (this.currentSKU.Id !== <string>value)) {
                        this.tearDownCurrentSKU();

                        this.reentryFlag = true;
                        this.setupNewSKU();
                        this.reentryFlag = false;
                    }
                    break;
            }
        }

        // Implementing IVisualizationListener
        public onStartVisualizing() {
            // Nothing special by now
        }

        // Implementing IVisualizationListener
        public onEndVisualizing() {
            // Do nothing
        }

        private tearDownCurrentSKU() {
            if (!this.currentSKU) {
                return;
            }

            this.currentSKU.reset();
            this.configuration.reset();
            this.layoutInstance.reset();
        }

        private setupNewSKU() {
            this.currentSKU = DataViz.SKUs.SKUProvider.Instance.CurrentSKUInstance;

            DataViz.Chart.LayoutProvider.Instance.CurrentLayoutId = this.currentSKU.LayoutId;

            this.configuration = new DataViz.Config.Configuration(App.configurationKeys, this.currentSKU.Configurator);

            // Registers listeners for configuration changes. NOTE: ORDER MATTERS!
            this.configuration.registerListener(DataViz.Decoration.ShapeProvider.Instance);
            this.configuration.registerListener(DataViz.Decoration.ThemeProvider.Instance);
            this.configuration.registerListener(this.currentSKU.DataConvertor);
            this.configuration.registerListener(this.currentSKU.Controller);
            this.configuration.registerListener(DataViz.SKUs.SKUProvider.Instance);
            this.configuration.registerListener(this);
            this.currentSKU.Visualizer.registerListener(this);

            this.layoutInstance = new DataViz.Chart.LayoutInstance(DataViz.Chart.LayoutProvider.Instance.CurrentLayout, this.currentSKU.Configurator);
            this.layoutInstance.registerListener(this.currentSKU.Layouter);

            this.mainUX = new Trends.UX.MainUX;
            this.mainUX.init();

            this.configuration.loadAll();
            this.layoutInstance.loadAll();

            this.currentSKU.Layouter.resume();

            var savedSkuId = this.configuration.get(DataViz.Config.wellKnownKeys.sku);
            if (!savedSkuId) {
                DataViz.mainApp.configuration.set(DataViz.Config.wellKnownKeys.sku, this.currentSKU.Id);
            }

            var savedThemeId = this.configuration.get(DataViz.Config.wellKnownKeys.theme);
            var savedTheme = DataViz.Decoration.ThemeProvider.Instance.getThemeById(savedThemeId);
            if ((!savedTheme)
                || ((savedTheme.sku !== "") && (savedTheme.sku !== this.currentSKU.Id))) {
                this.configuration.set(DataViz.Config.wellKnownKeys.theme, this.currentSKU.ThemeId);
            }

            var sampleData = new DataViz.Config.Trends.SampleDataProvider(this.currentSKU.SampleData);

            this.initLayoutElementConfig(DataViz.Config.Trends.wellKnownKeys.title, sampleData.Title);
            this.initLayoutElementConfig(DataViz.Config.Trends.wellKnownKeys.shortdes1Title, sampleData.Shortdes1Title);
            this.initLayoutElementConfig(DataViz.Config.Trends.wellKnownKeys.shortdes1Descript, sampleData.Shortdes1Descript);
            this.initLayoutElementConfig(DataViz.Config.Trends.wellKnownKeys.longdesTitle, sampleData.LongdesTitle);
            this.initLayoutElementConfig(DataViz.Config.Trends.wellKnownKeys.longdesDescript, sampleData.LongdesDescript);

            DataViz.UX.SettingPane.Instance.populate();

            this.currentSKU.Controller.rebindData(() => {
                if (this.currentSKU.DataBinder.isBound()) {
                    return;
                }

                var savedClickedPoints: string[] = this.configuration.get(DataViz.Config.Trends.wellKnownKeys.clickedPointIdArray);
                if (!savedClickedPoints) {
                    this.configuration.set(DataViz.Config.Trends.wellKnownKeys.clickedPointIdArray, sampleData.DataPoints);
                }

                this.currentSKU.Controller.visualizeData(sampleData.RenderData);
            });

            window.addEventListener("click", (e: any) => {
                if (e.clientX < window.innerWidth - DataViz.App.paneWidth) {
                    DataViz.UX.SettingPane.Instance.hide();
                    DataViz.UX.DataPane.Instance.hide();
                }
            });
        }

        private initLayoutElementConfig(key: string, sampleValue: string) {
            var savedValue = DataViz.mainApp.layoutInstance.getValue(key);
            if ((savedValue === undefined) || (savedValue === null)) {
                DataViz.mainApp.layoutInstance.setValue(key, sampleValue);
            }
        }
    }
}