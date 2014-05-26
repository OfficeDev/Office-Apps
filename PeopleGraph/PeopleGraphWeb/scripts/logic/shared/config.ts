/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="utils.ts"/>
///<reference path="tool.ts"/>
///<reference path="validate.ts"/>

/**
  * This modules contains basic definitions, interfaces and base classes related to configurations
  */
module DataViz.Config {
    /**
      * The well known configuration keys used in this app
      */
    export var wellKnownKeys = {
        theme: "theme",
        shape: "shape",
        layout: "layout",
        sku: "sku"
    };

    /**
      * This interface defines the behavior of the configuration change listener, which will be notified when any configuration value is changed
      */
    export interface IConfigurationChangeListener {
        /**
          * The event when a certain configuration value is changed.
          * @param {string} key The key of the configuration value that is changing
          * @param {any} value The actual configuration value that is changing
          */
        onConfigurationChanged(key: string, value: any): void;
    }

    /**
      * This interface defines the behavior of the configurator, which reads/saves configurations from/to the host document
      */
    export interface IConfigurator extends DataViz.Tools.ITool, IConfigurationChangeListener {
        /**
          * Loads all the values from the specified configuration
          * @param {Configuration} configuration The configuration to load
          */
        loadAll(configuration: Configuration): void;

        /**
          * Saves a configuration value specified by a particular key
          * @param {string} key The key of the configuration value to save
          * @param {any} value The value of the configuration
          */
        save(key: string, value: any): void;
    }

    /**
      * A configuration contains a set of key/value pairs (which normally represents user settings, etc.)
      */
    export class Configuration {
        private settings: any[];
        private changeListeners: IConfigurationChangeListener[];
        private keys: string[];
        private configurator: IConfigurator;

        /**
          * @param {string[]} keys The keys of supported values in this configuration
          * @param {IConfigurator} configurator The configurator that can be actually used to load/save the configuration from/to host document
          */
        constructor(keys: string[], configurator: IConfigurator) {
            Validate.Validator.ensures(keys).from("Configuration::ctor [keys]").isNotNull();
            Validate.Validator.ensures(configurator).from("Configuration::ctor [configurator]").isNotNull();

            this.keys = keys;
            this.configurator = configurator;
            this.settings = [];
            this.changeListeners = [];
            this.registerListener(this.configurator);
        }

        /**
          * Resets the configuration
          */
        public reset() {
            this.changeListeners.length = 0;
            this.settings.length = 0;
        }

        /**
          * Registers a configuration change listener. This method can be called for multiple times to register multiple listeners.
          * @param {IConfigurationChangeListener} listener A configuration change listener to be registered.
          */
        public registerListener(listener: IConfigurationChangeListener) {
            Validate.Validator.ensures(listener).from("Configuration::registerListener").isNotNull();
            if (this.changeListeners.indexOf(listener) === -1) {
                this.changeListeners.push(listener);
            }
        }

        /**
          * Unregisters a configuration change listener.
          * @param {@link IConfigurationChangeListener} listener: A configuration change listener to be unregistered.
          */
        public unregisterListener(listener: IConfigurationChangeListener) {
            Validate.Validator.ensures(listener).from("Configuration::unregisterListener").isNotNull();
            DataViz.Utils.removeItemFromArray(this.changeListeners, listener);
        }

        /**
          * Loads all the configurations
          */
        public loadAll() {
            this.configurator.loadAll(this);
        }

        /**
          * Clears all the configuration values
          */
        public clear() {
            this.settings.length = 0;
        }

        /**
          * Get a list of the keys of the supported configuration values
          * @returns {string[]} The keys of the supported configuration values
          */
        public get Keys(): string[] {
            return this.keys;
        }

        /**
          * Gets a configuration value with the specified key
          * @param {string} key The key of the configuration value to get
          * @returns {any} The configuration value retrieved
          */
        public get(key: string): any {
            Validate.Validator.ensures(key).from("Configuration::get").isNotNull();
            return this.settings[key];
        }

        /**
          * Sets a configuration value with the specified key
          * @param {string} key The key of the configuration value to set
          * @param {any} value The configuration value to set
          */

        public set(key: string, value: any) {
            Validate.Validator.ensures(key).from("Configuration::set [key]").isNotNull();
            Validate.Validator.ensures(value).from("Configuration::set [key]=" + key + " [value]").isNotNull();

            if (this.settings[key] === value) {
                // Same value, prevent re-updating
                return;
            }

            this.settings[key] = value;

            this.changeListeners.forEach((listener: IConfigurationChangeListener, index: number, array: IConfigurationChangeListener[]) => {
                listener.onConfigurationChanged(key, value);
            });
        }
    }
}