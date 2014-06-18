/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/data.ts"/>
///<reference path="shared/utils.ts"/>
///<reference path="shared/validate.ts"/>

declare var Office: any;

/**
  * This module contains the implementation of the specific data binder of the app
  */
module Trends.Data.Agave {
    "use strict";

    /**
      * This is the specific data binder of the app
      */
    export class DataBinder implements DataViz.Data.IDataBinder {
        private isDataBound: boolean;
        private sendDataBindingTelemetry: boolean;
        private bindingName: string;
        private dataChangeListeners: DataViz.Data.IDataChangeListener[];
        private dataChangeHandler: any;

        constructor() {
            this.isDataBound = false;
            this.sendDataBindingTelemetry = false;
            this.dataChangeListeners = [];
            this.dataChangeHandler = (eventArgs: any) => {
                this.notifyDataChange();
            };
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            this.dataChangeListeners.length = 0;
            this.detachHandler(this.bindingName);
            this.isDataBound = false;
        }

        /**
          * Implementing {@link IDataBinder#registerDataChangeListener}
          */
        public registerDataChangeListener(listener: DataViz.Data.IDataChangeListener) {
            if (this.dataChangeListeners.indexOf(listener) === -1) {
                this.dataChangeListeners.push(listener);
            }
        }

        /**
          * Implementing {@link IDataBinder#unregisterDataChangeListener}
          */
        public unregisterDataChangeListener(listener: DataViz.Data.IDataChangeListener) {
            DataViz.Utils.removeItemFromArray(this.dataChangeListeners, listener);
        }

        /**
          * Implementing {@link IDataBinder#bindByPrompt}
          */
        public bindByPrompt(callback?: (result: any) => any) {
            this.bind(true, callback);
        }

        /**
          * Implementing {@link IDataBinder#bindBySelection}
          */
        public bindBySelection(callback?: () => any) {
            this.bind(false, callback);
        }

        /**
          * Implementing {@link IDataBinder#Rebind}
          */
        public rebind(callback?: () => any) {
            this.bindingName = DataViz.mainApp.Configuration.get(DataViz.Config.Trends.wellKnownKeys.bindingName);
            if (!this.bindingName) {
                if (callback) {
                    callback();
                }

                return;
            }

            Office.context.document.bindings.getByIdAsync(this.bindingName, (result: any) => {
                if (result.status !== Office.AsyncResultStatus.Succeeded) {
                    if (callback) {
                        callback();
                    }

                    return;
                }

                if (DataViz.Utils.isOnWac()) {
                    this.detachHandler(this.bindingName);
                    this.isDataBound = true;
                    this.attachHandler(callback);
                }
                else {
                    this.detachHandler(this.bindingName, () => {
                        this.isDataBound = true;
                        this.attachHandler(callback);
                    });
                };
            });
        }

        /**
          * Implementing {@link IDataBinder#getSelectedData}
          */
        public getSelectedData(callback: (data: any) => any) {
            Office.context.document.getSelectedDataAsync(
                Office.CoercionType.Matrix,
                { valueFormat: Office.ValueFormat.Formatted, filterType: Office.FilterType.OnlyVisible },
                (result: any) => {
                    if (callback) {
                        callback(result.value);
                    }
                });
        }

        /**
          * Implementing {@link IDataBinder#IsBound}
          */
        public isBound(): boolean {
            return this.isDataBound;
        }

        /**
          * Implementing {@link IDataBinder#getData}
          */
        public getData(callback: (data: Trends.Data.RawData) => any) {
            DataViz.Validate.Validator.ensures(callback).isNotNull();
            var finalData: Trends.Data.RawData = { hasHeader: false, formatted: null, unformatted: null };
            var bindingName: string = "bindings#" + this.bindingName;

            var selection = Office.select(bindingName, (result: any) => {
                if (result.status !== Office.AsyncResultStatus.Succeeded) {
                    callback(null);
                }
            });

            // get unformatted data first
            selection.getDataAsync(
                { coercionType: Office.CoercionType.Matrix, valueFormat: Office.ValueFormat.Unformatted, filterType: Office.FilterType.OnlyVisible },
                (result: any) => {
                    if (result.status === Office.AsyncResultStatus.Succeeded) {
                        finalData.unformatted = result.value;
                        finalData.hasHeader = this.detectHeader(result.value);
                        // then get formatted data
                        selection.getDataAsync(
                            { coercionType: Office.CoercionType.Matrix, valueFormat: Office.ValueFormat.Formatted, filterType: Office.FilterType.OnlyVisible },
                            (result: any) => {
                                if (result.status === Office.AsyncResultStatus.Succeeded) {
                                    finalData.formatted = result.value;
                                    callback(finalData);
                                    if (this.sendDataBindingTelemetry) {
                                        this.sendDataBindingTelemetry = false;
                                    }
                                }
                                else {
                                    callback(null);
                                }
                            });
                    }
                });
        }

        /**
          * Implementing {@link IDataBinder#unbind}
          */
        public unbind(callback?: () => any) {
            if (!this.bindingName) {
                if (callback) {
                    callback();
                }

                return;
            }

            if (DataViz.Utils.isOnWac()) {
                this.detachHandler(this.bindingName);
                Office.context.document.bindings.releaseByIdAsync(this.bindingName, (releaseBindResult: any) => {
                    this.isDataBound = false;

                    if (callback) {
                        callback();
                    }
                });
            }
            else {
                this.detachHandler(this.bindingName, () => {
                    Office.context.document.bindings.releaseByIdAsync(this.bindingName, (releaseBindResult: any) => {
                        this.isDataBound = false;

                        if (callback) {
                            callback();
                        }
                    });
                })
            }
        }

        private bind(prompt: boolean, callback?: (result: any) => any) {
            this.sendDataBindingTelemetry = true;
            this.bindInternal(prompt, callback);
        }

        public getBindingName(): string {
            return this.bindingName === DataViz.Data.DefaultBindingName ?
                        DataViz.Data.ExtraBindingName : DataViz.Data.DefaultBindingName;
        }

        private bindInternal(prompt: boolean, callback?: (result: any) => any) {
            var innerCallback =
                (result: any) => {
                    if (result.status !== Office.AsyncResultStatus.Succeeded) {
                        return;
                    }

                    this.unbind(() => {
                        this.bindingName = this.getBindingName();
                        DataViz.mainApp.Configuration.set(DataViz.Config.Trends.wellKnownKeys.bindingName, this.bindingName);
                        this.isDataBound = true;
                        this.attachHandler(() => {
                            this.notifyBindingTargetChange();

                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                };

            if (prompt) {
                Office.context.document.bindings.addFromPromptAsync(Office.BindingType.Matrix, { id: this.getBindingName() }, innerCallback);
            }
            else {
                Office.context.document.bindings.addFromSelectionAsync(Office.BindingType.Matrix, { id: this.getBindingName() }, innerCallback);
            }
        }

        private attachHandler(callback?: () => any) {
            Office.select("bindings#" + this.bindingName).addHandlerAsync(
                Office.EventType.BindingDataChanged,
                this.dataChangeHandler,
                (result: any) => {
                    if (result.status !== Office.AsyncResultStatus.Succeeded) {
                        return;
                    }

                    this.notifyDataChange();

                    if (callback) {
                        callback();
                    }
                });
        }

        private detachHandler(bindingName: string, callback?: () => any) {
            Office.select("bindings#" + bindingName, callback) // this callback happens after binding failed, which results into an invalid bindingName, and then bind again.
                .removeHandlerAsync(
                    Office.EventType.BindingDataChanged,
                    { handler: this.dataChangeHandler },
                    (removeHandlerResult: any) => {
                        if (callback) {
                            callback();
                        }
                    }
                );
        }

        private notifyDataChange() {
            var _this = this;

            this.getData((data: Trends.Data.RawData) => {
                if (!data) {
                    return;
                }

                _this.dataChangeListeners.forEach((listener: DataViz.Data.IDataChangeListener, index: number, array: DataViz.Data.IDataChangeListener[]) => {
                    listener.onDataChanged(data);
                });
            });
        }

        private notifyBindingTargetChange() {
            DataViz.Config.Trends.resetClickedPointIdArrays();
            DataViz.Config.Trends.resetLineOrder();
            DataViz.Config.Trends.resetLineDisplay();
            DataViz.Config.Trends.resetLineTitleArray();
            this.dataChangeListeners.forEach((listener: DataViz.Data.IDataChangeListener, index: number, array: DataViz.Data.IDataChangeListener[]) => {
                listener.onDataBindingTargetChanged();
            });
        }

        private detectHeader(data: any): boolean {
            DataViz.Validate.Validator.ensures(data).from("DataBinder::detectHeader").isNotNull();

            var hasHeader: boolean = true; 
            for (var i = 1; i < data[0].length; i++) {
                if (data[0][i] !== null && data[0][i] !== undefined) {
                    var stringData = data[0][i].toString();
                    if (stringData.length > 0 && $.isNumeric(stringData)) {
                        hasHeader = false;
                    }
                }
            }

            return hasHeader;
        }
    }
}