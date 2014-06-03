/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

///<reference path="data.ts"/>
///<reference path="chart.ts"/>
///<reference path="config.ts"/>
///<reference path="validate.ts"/>

/**
  * This module contains the controller implementation
  */
module DataViz.Control {
    "use strict";

    /**
      * The controller behaves like a bridge or a middle man connecting several other components.
      * In general, it listens to certain events from some components and triggers certain operations of other components
      */
    export class Controller implements Data.IDataChangeListener, Config.IConfigurationChangeListener {
        private visualizer: Chart.Visualizer;
        private dataBinder: Data.IDataBinder;
        private dataConvertor: Data.IDataConvertor;
        private cachedData: any;
        private isRevisualizeOnThemeChange: boolean;

        /**
          * @param {Visualizer} visualizer The visualizer that will be used for visualization
          * @param {IDataBinder} dataBinder The data binder that will be used to bind data
          * @param {IDataConvertor} visualizer The data convertor that will be used to convert raw data
          */
        constructor(visualizer: Chart.Visualizer, dataBinder: Data.IDataBinder, dataConvertor: Data.IDataConvertor) {
            Validate.Validator.ensures(visualizer).from("Controller::ctor [visualizer]").isNotNull();
            Validate.Validator.ensures(dataBinder).from("Controller::ctor [dataBinder]").isNotNull();
            Validate.Validator.ensures(dataConvertor).from("Controller::ctor [dataConvertor]").isNotNull();

            this.visualizer = visualizer;
            this.dataBinder = dataBinder;
            this.dataConvertor = dataConvertor;
            this.cachedData = null;
            this.isRevisualizeOnThemeChange = false;
            this.dataBinder.registerDataChangeListener(this);
        }

        /**
          * Binds data by prompt (delegate to the data binder)
          * @param {(result: any) => any} [callback] The callback that will be called after the data binding is done. Optional.
          */
        public bindDataByPrompt(callback?: (result: any) => any) {
            this.dataBinder.bindByPrompt(callback);
        }

        /**
          * Binds data by selection (delegate to the data binder)
          * @param {(result: any) => any} [callback] The callback that will be called after the data binding is done. Optional.
          */
        public bindDataBySelection(callback?: (result: any) => any) {
            this.dataBinder.bindBySelection(callback);
        }

        /**
          * Rebinds data directly using the default bind name (delegate to the data binder)
          * @param {() => any} [callback] The callback that will be called after the data binding is done. Optional.
          */
        public rebindData(callback?: () => any) {
            this.dataBinder.rebind(callback);
        }

        /**
          * Tries to bind the currently selected data (delegate to the data binder)
          * @param {(result: any) => any} [callback] The callback that will be called after the data binding is done. Optional.
          */
        public tryBindSelection(callback?: (result: any) => any) {
            this.dataBinder.getSelectedData((rawData: any) => {
                var data = this.dataConvertor.convert(rawData);
                if (data) {
                    this.dataBinder.bindBySelection(callback);
                }
                else {
                    if (callback) {
                        callback(null);
                    }
                }
            });
        }

        /**
          * Visualizes the given data (delegate to the visualizer)
          * @param {any} rawData The raw data to be visualized
          */
        public visualizeData(rawData: any) {
            this.cachedData = rawData;
            this.revisualize();
        }

        /**
          * Revisualizes the cached data (if any)
          */
        public revisualize() {
            if (this.cachedData) {
                this.visualizer.visualize(this.dataConvertor.convert(this.cachedData));
            }
        }

        /**
          * Whether revisualize on theme change
          * @param {boolean} isRevisualize set to true if revisualizing on theme change is true
          */
        public revisualizeOnThemeChange(isRevisualize: boolean) {
            this.isRevisualizeOnThemeChange = isRevisualize;
        }

        /**
          * Implementing {@link IDataChangeListener#onDataChanged}
          */
        public onDataChanged(rawData: any) {
            this.visualizeData(rawData);
        }

        /**
          * Implementing {@link IDataChangeListener#onDataBindingTargetChanged}
          */
        public onDataBindingTargetChanged() {
            this.dataConvertor.resetTool();
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            Validate.Validator.ensures(key).from("Controller::onConfigurationChanged [key]").isNotNull().isNotEmpty();
            Validate.Validator.ensures(value).from("Controller::onConfigurationChanged [key]=" + key + " [value]").isNotNull();

            switch (key) {
                case Config.wellKnownKeys.theme: {
                    var stylesheetLink = $("link#chart-theme");
                    stylesheetLink.attr("href", Decoration.ThemeProvider.Instance.CurrentThemeCssUrl);

                    if (this.isRevisualizeOnThemeChange) {
                        stylesheetLink.off("load");
                        $("link#chart-theme").on("load", () => {
                            this.revisualize();
                        });
                    }
                }
                    break;

                case Config.wellKnownKeys.shape: {
                    this.revisualize();
                }
                    break;
            }
        }
    }
}