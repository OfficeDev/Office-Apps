/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/data.ts"/>
///<reference path="shared/utils.ts"/>

declare var Office: any;

/**
  * This module contains the implementation of the app's specific data binder
  */
module DataViz.Data.Agave {
    "use strict";

    /**
      * This is the app's specific data binder
      */
    export class DataBinder implements IDataBinder {
        private isDataBound: boolean;
        private bindingName: string;
        private dataChangeListeners: IDataChangeListener[];
        private dataChangeHandler: any;

        constructor() {
            this.isDataBound = false;
            this.bindingName = DataViz.Data.DefaultBindingName;
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
            this.detachHandler();
            this.isDataBound = false;
        }

        /**
          * Implementing {@link IDataBinder#registerDataChangeListener}
          */
        public registerDataChangeListener(listener: IDataChangeListener) {
            if (this.dataChangeListeners.indexOf(listener) === -1) {
                this.dataChangeListeners.push(listener);
            }
        }

        /**
          * Implementing {@link IDataBinder#unregisterDataChangeListener}
          */
        public unregisterDataChangeListener(listener: IDataChangeListener) {
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
        public bindBySelection(callback?: (result: any) => any) {
            this.bind(false, callback);
        }

        /**
          * Implementing {@link IDataBinder#Rebind}
          */
        public rebind(callback?: () => any) {
            Office.context.document.bindings.getByIdAsync(this.bindingName, (result: any) => {
                if (result.status !== Office.AsyncResultStatus.Succeeded) {
                    if (callback) {
                        callback();
                    }

                    return;
                }
                
                if (DataViz.Utils.isOnWac()) {
                    this.detachHandler();
                    this.isDataBound = true;
                    this.attachHandler(callback);
                }
                else {
                    this.detachHandler(() => {
                        this.isDataBound = true;
                        this.attachHandler(callback);
                    });
                };
            });
        }

        /**
          * Implementing {@link IDataBinder#unbind}
          */
        public unbind(callback?: () => any) {
            if (DataViz.Utils.isOnWac()) {
                this.detachHandler();
                Office.context.document.bindings.releaseByIdAsync(this.bindingName, (releaseBindResult: any) => {
                    this.isDataBound = false;

                    if (callback) {
                        callback();
                    }
                });
            }
            else {
                this.detachHandler(() => {
                    Office.context.document.bindings.releaseByIdAsync(this.bindingName, (releaseBindResult: any) => {
                        this.isDataBound = false;

                        if (callback) {
                            callback();
                        }
                    });
                })
            }
        }

        /**
          * Implementing {@link IDataBinder#getSelectedData}
          */
        public getSelectedData(callback: (data: any) => any) {
            Office.context.document.getSelectedDataAsync(
                Office.CoercionType.Matrix,
                { valueFormat: "unformatted", filterType: "onlyVisible" },
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
        public getData(callback: (data: DataViz.Data.RawData) => any) {
            Validate.Validator.ensures(callback).from("DataBinder::getData").isNotNull();

            var rawData: DataViz.Data.RawData = new DataViz.Data.RawData();
            var selection = Office.select("bindings#" + this.bindingName, (result: any) => {
                    if (result.status !== Office.AsyncResultStatus.Succeeded) {
                        callback(null);
                    }
                });

            // get unformatted data first
            selection.getDataAsync(
                { coercionType: Office.CoercionType.Matrix, valueFormat: Office.ValueFormat.Unformatted, filterType: Office.FilterType.OnlyVisible },
                (result: any) => {
                    if (result.status === Office.AsyncResultStatus.Succeeded) {
                        rawData.unformatted = result.value;

                        // then get the formatted data
                        selection.getDataAsync(
                            { coercionType: Office.CoercionType.Matrix, valueFormat: Office.ValueFormat.Formatted, filterType: Office.FilterType.OnlyVisible },
                            (result: any) => {
                                if (result.status === Office.AsyncResultStatus.Succeeded) {
                                    rawData.formatted = result.value;
                                    callback(rawData);
                                }
                                else {
                                    callback(null);
                                }
                            });
                    }
                    else {
                        callback(null);
                    }
                });
        }

        private bind(prompt: boolean, callback?: (result: any) => any) {
            if (this.isDataBound) {
                this.unbind(() => {
                    this.bindInternal(prompt, callback);
                });
            }
            else {
                this.bindInternal(prompt, callback);
            }
        }

        private bindInternal(prompt: boolean, callback?: (result: any) => any) {
            var innerCallback =
                (result: any) => {
                    if (result.status !== Office.AsyncResultStatus.Succeeded) {
                        return;
                    }

                    this.isDataBound = true;
                    this.attachHandler(() => {
                        this.notifyBindingTargetChange();

                        if (callback) {
                            callback(result);
                        }
                    });
                };

            if (prompt) {
                Office.context.document.bindings.addFromPromptAsync(Office.BindingType.Matrix, { id: this.bindingName }, innerCallback);
            }
            else {
                Office.context.document.bindings.addFromSelectionAsync(Office.BindingType.Matrix, { id: this.bindingName }, innerCallback);
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

        private detachHandler(callback?: () => any) {
            Office.select("bindings#" + this.bindingName).removeHandlerAsync(
                Office.EventType.BindingDataChanged,
                { handler: this.dataChangeHandler },
                (removeHandlerResult: any) => {
                    if (removeHandlerResult.status !== Office.AsyncResultStatus.Succeeded) {
                        // This is probably OK as it is possible that no handler has been previously attached
                    }

                    if (callback) {
                        callback();
                    }
                });
        }

        private notifyDataChange() {
            this.getData((data: DataViz.Data.RawData) => {
                if (!data) {
                    return;
                }

                this.dataChangeListeners.forEach((listener: IDataChangeListener, index: number, array: IDataChangeListener[]) => {
                    listener.onDataChanged(data);
                });
            });
        }

        private notifyBindingTargetChange() {
            this.dataChangeListeners.forEach((listener: IDataChangeListener, index: number, array: IDataChangeListener[]) => {
                listener.onDataBindingTargetChanged();
            });
        }
    }
}