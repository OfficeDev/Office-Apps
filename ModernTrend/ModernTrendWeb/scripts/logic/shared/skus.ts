/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="tool.ts"/>
///<reference path="chart.ts"/>
///<reference path="data.ts"/>
///<reference path="config.ts"/>
///<reference path="controller.ts"/>
///<reference path="decoration.ts"/>
///<reference path="tool.ts"/>
///<reference path="validate.ts"/>

declare var $: any;

/**
  * This module contains the basic definitions, constants and base-classes of SKU related tasks
  */
module DataViz.SKUs {
    "use strict";

    /**
      * The SKU definition
      */
    export class SKUDefinition extends DataViz.Decoration.Customizable {
        /**
          * The display name
          */
        public displayName: string;

        /**
          * The plotter class name
          */
        public plotter: string;

        /**
          * The layouter class name
          */
        public layouter: string;

        /**
          * The data binder class name
          */
        public dataBinder: string;

        /**
          * The data convertor class name
          */
        public dataConvertor: string;

        /**
          * The configurator class name
          */
        public configurator: string;

        /**
          * The id of the default theme
          */
        public defaultTheme: string;

        /**
          * The id of the default shape
          */
        public defaultShape: string;

        /**
          * The id of the default layout
          */
        public defaultLayout: string;

        /**
          * The sample data
          */
        public sampleData: any;
    }

    /**
      * This represents an SKU instance, with all tools instantiated
      */
    export class SKUInstance {
        private id: string;
        private plotter: DataViz.Chart.IPlotter;
        private layouter: DataViz.Chart.ILayouter;
        private dataBinder: DataViz.Data.IDataBinder;
        private dataConvertor: DataViz.Data.IDataConvertor;
        private configurator: DataViz.Config.IConfigurator;
        private visualizer: DataViz.Chart.Visualizer;
        private controller: DataViz.Control.Controller;
        private themeId: string;
        private shapeId: string;
        private layoutId: string;
        private sampleData: any;

        /**
          * Creates an SKU instance from the SKU definition
          * @param {SKUDefinition} definition The SKU definition
          * @returns {SKUInstance} An SKU instance created or null if the creation fails
          */
        public static fromDefinition(definition: SKUDefinition): SKUInstance {
            DataViz.Validate.Validator.ensures(definition).from("SKUInstance::fromDefinition").isNotNull();

            var instance = new SKUInstance;

            instance.id = definition.id;
            instance.themeId = definition.defaultTheme;
            instance.shapeId = definition.defaultShape;
            instance.layoutId = definition.defaultLayout;
            instance.sampleData = definition.sampleData;

            instance.plotter = DataViz.Tools.ToolsFactory.buildTool(definition.plotter);
            instance.layouter = DataViz.Tools.ToolsFactory.buildTool(definition.layouter);
            instance.dataBinder = DataViz.Tools.ToolsFactory.buildTool(definition.dataBinder);
            instance.dataConvertor = DataViz.Tools.ToolsFactory.buildTool(definition.dataConvertor);
            instance.configurator = DataViz.Tools.ToolsFactory.buildTool(definition.configurator);

            if ((!instance.plotter)
                || (!instance.layouter)
                || (!instance.dataBinder)
                || (!instance.dataConvertor)
                || (!instance.configurator)) {
                return null;
            }

            instance.visualizer = new DataViz.Chart.Visualizer(instance.layouter, instance.plotter);
            instance.controller = new DataViz.Control.Controller(instance.visualizer, instance.dataBinder, instance.dataConvertor);

            return instance;
        }

        /**
          * Gets the id of the SKU
          * @returns {string} the id of the SKU
          */
        public get Id(): string {
            return this.id;
        }

        /**
          * Gets the plotter used in this SKU
          * @returns {DataViz.Chart.IPlotter} The plotter instance
          */
        public get Plotter(): DataViz.Chart.IPlotter {
            return this.plotter;
        }

        /**
          * Gets the layouter used in this SKU
          * @returns {DataViz.Chart.ILayouter} The layouter instance
          */
        public get Layouter(): DataViz.Chart.ILayouter {
            return this.layouter;
        }

        /**
          * Gets the data binder used in this SKU
          * @returns {DataViz.Data.IDataBinder} The data binder instance
          */
        public get DataBinder(): DataViz.Data.IDataBinder {
            return this.dataBinder;
        }

        /**
          * Gets the data convertor used in this SKU
          * @returns {DataViz.Data.IDataConvertor} The data convertor instance
          */
        public get DataConvertor(): DataViz.Data.IDataConvertor {
            return this.dataConvertor;
        }

        /**
          * The configurator used in the SKU
          * @returns {DataViz.Config.IConfigurator} The configurator instance
          */
        public get Configurator(): DataViz.Config.IConfigurator {
            return this.configurator;
        }

        /**
          * Gets the visualizer in the SKU
          * @returns {DataViz.Chart.Visualizer} The visualizer instance
          */
        public get Visualizer(): DataViz.Chart.Visualizer {
            return this.visualizer;
        }

        /**
          * Gets the controller in the SKU
          * @returns {DataViz.Control.Controller} The controller instance
          */
        public get Controller(): DataViz.Control.Controller {
            return this.controller;
        }

        /**
          * Gets the id of the default theme of the SKU
          * @returns {string} The id of the default theme
          */
        public get ThemeId(): string {
            return this.themeId;
        }

        /**
          * Gets the id of the default shape of the SKU
          * @returns {string} The id of the default shape
          */
        public get ShapeId(): string {
            return this.shapeId;
        }

        /**
          * Gets the id of the default layout of the SKU
          * @returns {string} The id of the default layout
          */
        public get LayoutId(): string {
            return this.layoutId;
        }

        /**
          * Gets the sample data of the SKU
          * @returns {any} The sample data
          */
        public get SampleData(): any {
            return this.sampleData;
        }

        /**
          * Resets the SKU (basically resets all the tools in the SKU)
          */
        public reset() {
            this.plotter.resetTool();
            this.layouter.resetTool();
            this.dataBinder.resetTool();
            this.dataConvertor.resetTool();
            this.visualizer.resetTool();
        }
    }

    /**
      * The SKU provider that takes care of the following tasks
      *  - Loads the pre-defined SKUs into memory
      *  - Returns all the loaded SKUs
      *  - Tracks (via listening to configuration changes) and returns the currently selected SKU
      */
    export class SKUProvider implements DataViz.Config.IConfigurationChangeListener {
        private static theInstance: SKUProvider = null;
        private static version = 2;  // To force web browser reload cache, increase this if you are updating skus.js.

        private definitions: SKUDefinition[];
        private currentSKUId: string = null;

        public static get Instance(): SKUProvider {
            if (!SKUProvider.theInstance) {
                SKUProvider.theInstance = new SKUProvider;
            }

            return SKUProvider.theInstance;
        }

        /**
          * Loads all the pre-defined SKUs. This has to be called before calling any other methods of this class.
          * @param {SKUDefinition[]} preDefines The pre-defined SKU configurations
          * @param {() => any} callback The callback function that will be called after the loading is finished
          */
        public loadAll(preDefines: SKUDefinition[], callback: () => any) {
            DataViz.Validate.Validator.ensures(callback).from("SKUProvider::loadAll").isNotNull();

            if (!this.definitions) {
                this.definitions = preDefines;
            }

            callback();
        }

        /**
          * Gets (lazy loading) all the loaded SKUs.
          * @returns {SKUDefinition[]} All the loaded SKUs
          */
        public get SKUs(): SKUDefinition[] {
            DataViz.Validate.Validator.ensures(this.definitions).from("SKUProvider::SKUs").isNotNull();

            return this.definitions;
        }

        /**
          * Returns the default SKU
          * @returns {SKUDefinition} The default SKU (normally the first SKU in the list)
          */
        public get Default(): SKUDefinition {
            return this.SKUs[0];
        }

        /**
          * Returns the id of the current SKU
          * @returns {string} The id of the current SKU
          */
        public get CurrentSKUId(): string {
            return this.currentSKUId;
        }

        /**
          * Sets the current SKU id
          * @param {string} id The SKU id
          */
        public set CurrentSKUId(id: string) {
            DataViz.Validate.Validator.ensures(id).from("SKUProvider::CurrentSKUId")
                                                  .isNotNull()
                                                  .isNotEmpty();
            this.currentSKUId = id;
        }

        /**
          * Returns the current SKU
          * @returns {SKUDefinition} The current SKU (if at least one is selected) or the default SKU (if none is selected)
          */
        public get CurrentSKU(): SKUDefinition {
            return this.getSKUById(this.currentSKUId);
        }

        /**
          * Returns the current SKU instance
          * @returns {SKUInstance} The current SKU instance (if at least one is selected) or null (if none is selected)
          */
        public get CurrentSKUInstance(): SKUInstance {
            var definition = this.CurrentSKU;
            return definition ? SKUInstance.fromDefinition(definition) : null;
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            DataViz.Validate.Validator.ensures(key).from("SKUProvider::onConfigurationChanged [key]")
                                                   .isNotNull()
                                                   .isNotEmpty();
            DataViz.Validate.Validator.ensures(value).from("SKUProvider::onConfigurationChanged [key]=" + key + " [value]")
                                                     .isNotNull();

            if (key === DataViz.Config.wellKnownKeys.sku) {
                this.currentSKUId = <string>value;
            }
        }

        private getSKUById(id: string): SKUDefinition {
            var match = this.SKUs.filter((sku: SKUDefinition, index: number, array: SKUDefinition[]) => {
                return (sku.id === id);
            });

            return (match.length > 0) ? match[0] : this.Default;
        }
    }
}