/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="logic/shared/controller.ts"/>
///<reference path="logic/shared/config.ts"/>
///<reference path="logic/shared/layout.ts"/>
///<reference path="logic/shared/skus.ts"/>
///<reference path="logic/shared/decoration.ts"/>
///<reference path="logic/shared/utils.ts"/>
///<reference path="logic/plotter.peoplebarclassic.d3.ts"/>
///<reference path="logic/plotter.peoplebarcallout.d3.ts"/>
///<reference path="logic/plotter.peoplebargiant.d3.ts"/>
///<reference path="logic/layouter.base.d3.ts"/>
///<reference path="logic/layouter.giant.d3.ts"/>
///<reference path="logic/layouter.callout.d3.ts"/>
///<reference path="logic/layouter.classic.d3.ts"/>
///<reference path="logic/data.binder.agave.ts"/>
///<reference path="logic/data.convertor.peoplebar.ts"/>
///<reference path="logic/configurator.agave.ts"/>
///<reference path="logic/predefinedSKUs.ts"/>
///<reference path="strings/stringadapter.ts"/>
///<reference path="UX/shared/BindingPane.ts"/>
///<reference path="UX/BindingPaneSpecific.ts"/>
///<reference path="UX/Home.ts"/>
///<reference path="UX/Notification.ts"/>

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

    Office.initialize = (reason: string) => {
        $(document).ready(() => {
            DataViz.mainApp = new App();

            setTimeout(() => {
                var resourceUrl: string = "../resources/en-us/resources.js";

                // check if the target resource file exists
                $.ajaxSetup({
                    cache: true
                });

                loadResourcesAndInitApp(resourceUrl, reason);
            }, 150);
        });
    }

    function loadResourcesAndInitApp(resourceUrl: string, reason: string) {
        var retryCount: number = 3;
        $.getScript(resourceUrl, () => {
                ensureDependancies(retryCount, () => {
                    DataViz.mainApp.init(reason);
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
      * Define the sample data format
      */
    class SampleDataFormat {
        public title: string;
        public data: string[][];
    }

    /**
      * This class represents the primary entry-point and workflow of the app
      */
    export class App implements Config.IConfigurationChangeListener, Chart.IVisualizationListener {
        private static configurationKeys =
        [
            Config.wellKnownKeys.theme,
            Config.wellKnownKeys.shape,
            Config.wellKnownKeys.sku
        ];

        private mainUX: DataViz.UX.MainUX;
        private currentSKU: DataViz.SKUs.SKUInstance;
        private configuration: Config.Configuration;
        private layoutInstance: Chart.LayoutInstance;
        private reentryFlag: boolean;
        private bindingPane: DataViz.UX.BindingPaneSpecific;
        private timeoutId: number = null;

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
        public get Configuration(): Config.Configuration {
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
        public init(reason: string) {
            var thisApp = this;
            thisApp.bindingPane = DataViz.UX.BindingPaneSpecific.getInstance();
            thisApp.bindingPane.updateBindingPane({
                sampleData: [[DataViz.Resources.SampleDataClassic.row1, "160"],
                             [DataViz.Resources.SampleDataClassic.row2, "500"],
                             [DataViz.Resources.SampleDataClassic.row3, "948"]],
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

            SKUs.SKUProvider.Instance.loadAll(DataViz.SKUs.Predefines.Instance.getAll(), (): void => {
                Chart.LayoutProvider.Instance.loadAll((): void => {
                    Decoration.ThemeProvider.Instance.loadAll((): void => {
                        Decoration.ShapeProvider.Instance.loadAll((): void => {
                            thisApp.setupNewSKU();
                        });
                    });
                });
            });
        }

        /**
          * Binds to the selected cells (by prompt)
          */
        public bindData() {
            this.bindingPane.zoomBindingPane().show();
        }

        // Implementing IConfigurationChangeListener
        public onConfigurationChanged(key: string, value: any) {
            switch (key) {
                case Config.wellKnownKeys.sku:
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
            $("#title").off("dblclick");
            $("#title").on("dblclick", () => {
                DataViz.UX.SettingPane.Instance.hide();
                DataViz.UX.DataPane.Instance.show(true); // show data pane and focus into the title box
            });

            
            var resizeHandler = (event: any) => {
                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                }

                this.timeoutId = setTimeout( () => {
                        var target = event.target;
                        var data = {
                            "ResizedWidth": target.innerWidth,
                            "ResizedHeight": target.innerHeight
                        };

                        this.currentSKU.Controller.revisualize();
                        this.timeoutId = null;
                    }, 100);
            };

            $(window).off("resize", resizeHandler);
            $(window).on("resize", resizeHandler);

            // Browser will handle single click event even it is trying to trigger the double click event, so this is the workaround
            // If the two clicks happened less than 300 ms, it will not trigger single click actions, otherwise trigger single click
            // actions
            var clickNumber = 0;
            var delay = 300; // Set as 300 ms now
            $(DataViz.Chart.defaultSVGRootId).off("click");
            $(DataViz.Chart.defaultSVGRootId).on("click", () => {
                clickNumber++;
                setTimeout(() => {
                    if (clickNumber === 1) {
                        DataViz.UX.SettingPane.Instance.hide();
                        DataViz.UX.DataPane.Instance.hide();
                    }
                    clickNumber = 0;
                }, delay);
            });
        }

        private tearDownCurrentSKU() {
            $(Chart.defaultSVGRootId).empty();

            if (!this.currentSKU) {
                return;
            }

            this.currentSKU.reset();
            this.configuration.reset();
            this.layoutInstance.reset();
        }

        private setupNewSKU() {
            this.currentSKU = DataViz.SKUs.SKUProvider.Instance.CurrentSKUInstance;

            Chart.LayoutProvider.Instance.CurrentLayoutId = this.currentSKU.LayoutId;

            this.configuration = new Config.Configuration(App.configurationKeys, this.currentSKU.Configurator);

            // Registers listeners for configuration changes. NOTE: ORDER MATTERS!
            this.configuration.registerListener(Decoration.ShapeProvider.Instance);
            this.configuration.registerListener(Decoration.ThemeProvider.Instance);
            this.configuration.registerListener(this.currentSKU.DataConvertor);
            this.configuration.registerListener(this.currentSKU.Controller);
            this.configuration.registerListener(SKUs.SKUProvider.Instance);
            this.configuration.registerListener(this);
            this.currentSKU.Visualizer.registerListener(this);

            this.layoutInstance = new Chart.LayoutInstance(Chart.LayoutProvider.Instance.CurrentLayout, this.currentSKU.Configurator);
            this.layoutInstance.registerListener(this.currentSKU.Layouter);

            this.mainUX = new DataViz.UX.MainUX;
            this.mainUX.init();

            this.currentSKU.Layouter.pause();

            this.configuration.loadAll();
            this.layoutInstance.loadAll();

            this.currentSKU.Layouter.resume();

            var savedSkuId = this.configuration.get(Config.wellKnownKeys.sku);
            if (!savedSkuId) {
                DataViz.mainApp.configuration.set(Config.wellKnownKeys.sku, this.currentSKU.Id);
            }

            var savedThemeId = this.configuration.get(Config.wellKnownKeys.theme);
            var savedTheme = Decoration.ThemeProvider.Instance.getThemeById(savedThemeId);
            if ((!savedTheme)
                || ((savedTheme.sku !== "") && (savedTheme.sku !== this.currentSKU.Id))) {
                DataViz.mainApp.configuration.set(Config.wellKnownKeys.theme, this.currentSKU.ThemeId);
            }

            var savedShapeId = this.configuration.get(Config.wellKnownKeys.shape);
            var savedShape = Decoration.ShapeProvider.Instance.getShapeById(savedShapeId);
            if ((!savedShape)
                || ((savedShape.sku !== "") && (savedShape.sku !== this.currentSKU.Id))) {
                this.configuration.set(Config.wellKnownKeys.shape, this.currentSKU.ShapeId);
            }

            DataViz.UX.SettingPane.Instance.populate();

            this.currentSKU.Controller.rebindData(() => {
                if (this.currentSKU.DataBinder.isBound()) {
                    return;
                }

                var sampleData: SampleDataFormat = <SampleDataFormat>this.currentSKU.SampleData;
                var renderData: DataViz.Data.RawData = new DataViz.Data.RawData();
                renderData.formatted = sampleData.data;
                renderData.unformatted = sampleData.data;
                this.layoutInstance.setValue("title", sampleData.title);

                this.currentSKU.Controller.visualizeData(renderData);
            });
        }
    }
}