/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="tool.ts"/>
///<reference path="config.ts"/>

/**
  * This module contains the basic definitions, constants, and base-classes of data related tasks
  */
module DataViz.Data {
    "use strict";

    /**
      * The binding name used by the app
      */
    export var DefaultBindingName = "dataVizBinding";
    export var ExtraBindingName = "dataVizBinding2";

    /**
      * This interface defines the behavior of the data change listener, which will get notified for data related events
      */
    export interface IDataChangeListener {
        /**
          * The event when the bound data is being changed
          * @param {any} data The new data
          */
        onDataChanged(data: any): void;

        /**
          * The event when the binder is binding to a different target
          */
        onDataBindingTargetChanged(): void;
    }

    /**
      * This interface defines the behavior of the data convertor, which can convert the raw data (normally from host document) to the data of a particular form.
      * For example, the people bar data convertor can convert the raw data to data in key/value pairs
      */
    export interface IDataConvertor extends DataViz.Tools.ITool, DataViz.Config.IConfigurationChangeListener {
        /**
          * Converts the raw data
          * @param {any} data The raw data to convert
          * @returns {any} The converted data
          */
        convert(data: any): any;
    }

    /**
      * This interface defines the behavior of the data binder, which can:
      *  - Get/set data from/to the host application
      *  - Bind data in the host application
      *  - Listen to data changes of the bound data
      */
    export interface IDataBinder extends DataViz.Tools.ITool {
        /**
          * Registers a data change listener. This method can be called multiple times to register multiple listeners.
          * @param {IDataChangeListener} listener A data change listener to be registered.
          */
        registerDataChangeListener(listener: IDataChangeListener): void;

        /**
          * Unregisters a data change listener.
          * @param {@link IDataChangeListener} listener: A data change listener to be unregistered.
          */
        unregisterDataChangeListener(listener: IDataChangeListener): void;

        /**
          * Binds data by prompt
          * @param {(result: any) => any} [callback] The callback that will be called after the data binding is done. Optional.
          */
        bindByPrompt(callback?: (result: any) => any): void;

        /**
          * Binds the currently selected data
          * @param {(result: any) => any} [callback] The callback that will be called after the data binding is done. Optional.
          */
        bindBySelection(callback?: (result: any) => any): void;

        /**
          * Rebinds data directly using the default bind name
          * @param {() => any} [callback] The callback that will be called after the data binding is done. Optional.
          */
        rebind(callback?: () => any): void;

        /**
          * unbind data directly using the default bind name
          * @param {() => any} [callback] The callback that will be called after the data unbinding is done. Optional.
          */
        unbind(callback?: () => any): void;

        /**
          * Determines whether the binder is currently bound to any data
          * @returns {boolean} true if bound; false otherwise.
          */
        isBound(): boolean;

        /**
          * Retrieves the values of the bound data
          * @param {(data: any) => any} [callback] The callback that will be called after the values are retrieved. Required.
          */
        getData(callback: (data: any) => any): void;

        /**
          * Retrieves the values of the currently selected data
          * @param {(data: any) => any} [callback] The callback that will be called after the values are retrieved. Optional.
          */
        getSelectedData(callback: (data: any) => any): void;
    }
}