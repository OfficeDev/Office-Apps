/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="config.ts"/>
///<reference path="validate.ts"/>

declare var $: any;

/**
  * This module contains the basic definitions, constants and base-classes of layout related tasks
  */
module DataViz.Chart {
    "use strict";

    /**
      * This represents a single HTML attribute name/value pair in the layout HTML element
      */
    export class Attribute {
        /**
          * The name of the attribute
          */
        public name: string;

        /**
          * The value of the attribute
          */
        public value: any;
    }

    /**
      * This  represents a single CSS style item in the layout HTML element
      */
    export class Style {
        /**
          * The name of the style item
          */
        public name: string;

        /**
          * The value of the style item
          */
        public value: string;
    }

    /**
      * This represents a single HTML element in the layout definition
      */
    export class LayoutElement {
        /**
          * The id of the element
          */
        public id: string;

        /**
          * The tag name of the element (e.g. "text", "line", "rect", etc.)
          */
        public element: string;

        /**
          * The name of the CSS class for this element
          */
        public cssClass: string;

        /**
          * A list of HTML attributes of this element. @see Attribute
          */
        public attributes: Attribute[];

        /**
          * A list of CSS styles of this element. @see Style
          */
        public styles: Style[];
    }

    /**
      * This represents the layout definition, which contains a set of element definitions
      */
    export class Layout {
        /**
          * The id of the layout
          */
        public id: string;

        /**
          * The HTML elements contained in this layout. @see LayoutElement
          */
        public elements: LayoutElement[];
    }

    /**
      * This interface defines the behavior of the layout chage listener
      */
    export interface ILayoutChangeListener {
        /**
          * The event when the whole layout is being changed
          * @param {Layout} layout The layout that is being changed
          */
        onLayoutChanged(layout: Layout): void;

        /**
          * The event when a particular element is being changed
          * @param {LayoutElement} layoutElement The layout element that is being changed
          */
        onLayoutElementChanged(layoutElement: LayoutElement): void;

        /**
          * The event when a particular element instance is being changed
          * @param {LayoutElement} layoutElement The layout element whose value is being changed
          * @param {any} value The new value of the layout element
          */
        onLayoutElementInstanceChanged(layoutElement: LayoutElement, value: any): void;
    }

    /**
      * A layout element instance contains a particular layout element definition and its value. Normally it represents a concrete HTML element on the canvas
      */
    export class LayoutElementInstance {
        public layoutElement: LayoutElement;
        public value: any;

        /**
          * @param {LayoutElement} layoutElement The layout element
          * @param {any} value The value of this instance
          */
        constructor(layoutElement: LayoutElement, value: any) {
            Validate.Validator.ensures(layoutElement).from("LayoutElementInstance::ctor [layoutElement]").isNotNull();
            Validate.Validator.ensures(value).from("LayoutElementInstance::ctor [value]").isNotNull();

            this.layoutElement = layoutElement;
            this.value = value;
        }
    }

    /**
      * A layout instance contains a set of layout element instances. It represents all the definitions of the HTML elements and the values for a concrete layout on the canvas
      */
    export class LayoutInstance implements Config.IConfigurationChangeListener {
        private static Prefix = "layout-element-";
        private changeListeners: ILayoutChangeListener[];
        private storage: Config.Configuration;
        private layout: Layout;
        private reentryFlag: boolean;

        /**
          * @param {Layout} layout The layout definitino
          * @param {Config.IConfigurator} configurator The configurator used to load element instance values from host document
          */
        constructor(layout: Layout, configurator: Config.IConfigurator) {
            Validate.Validator.ensures(layout).from("LayoutInstance::ctor [layout]").isNotNull();
            Validate.Validator.ensures(configurator).from("LayoutInstance::ctor [configurator]").isNotNull();

            this.layout = layout;
            this.changeListeners = [];
            this.reentryFlag = false;

            var keys = layout.elements.map(
                (val: LayoutElement, index: number, array: LayoutElement[]) => {
                    return LayoutInstance.Prefix + val.id;
                });
            this.storage = new Config.Configuration(keys, configurator);
            this.storage.registerListener(this);
        }

        /**
          * Resets the layout instance
          */
        public reset() {
            this.changeListeners.length = 0;
        }

        /**
          * Loads all the element instance values from the configuration
          */
        public loadAll() {
            this.storage.loadAll();
        }

        /**
          * Registers a layout chnage listener. This method can be called for multiple times to register multiple listeners.
          * @param {ILayoutChangeListener} listener A layout change listener to be registered.
          */
        public registerListener(listener: ILayoutChangeListener) {
            Validate.Validator.ensures(listener).from("LayoutInstance::registerListener").isNotNull();

            if (this.changeListeners.indexOf(listener) === -1) {
                this.changeListeners.push(listener);
            }
        }

        /**
          * Unregisters a layout change listener.
          * @param {@link ILayoutChangeListener} listener: A layout change listener to be unregistered.
          */
        public unregisterListener(listener: ILayoutChangeListener) {
            Validate.Validator.ensures(listener).from("LayoutInstance::unregisterListener").isNotNull();

            DataViz.Utils.removeItemFromArray(this.changeListeners, listener);
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            Validate.Validator.ensures(key).from("LayoutInstance::onConfigurationChanged [key]")
                                           .isNotNull()
                                           .isNotEmpty();
            Validate.Validator.ensures(value).from("LayoutInstance::onConfigurationChanged [key]=" + key + " [value]")
                                             .isNotNull();

            if (key.indexOf(LayoutInstance.Prefix) === -1) {
                return;
            }

            if (this.reentryFlag) {
                return;
            }

            this.reentryFlag = true;

            var id = key.substring(LayoutInstance.Prefix.length);
            this.notifyChange(id, value);

            this.reentryFlag = false;
        }

        /**
          * Sets the value of a layout element with the specified id
          * @param {string} layoutElementId The id of the layout element
          * @param {any} value The value to set into the layout element
          */
        public setValue(layoutElementId: string, value: any) {
            Validate.Validator.ensures(layoutElementId).from("LayoutInstance::setValue [layoutElementId]")
                                                       .isNotNull()
                                                       .isNotEmpty();
            Validate.Validator.ensures(value).from("LayoutInstance::setValue [layoutElementId]=" + layoutElementId + " [value]")
                                             .isNotNull();

            this.storage.set(LayoutInstance.Prefix + layoutElementId, value);
        }

        /**
          * Gets the value of a layout element with the specified id
          * @param {string} layoutElementId The id of the layout element
          * @returns {any} The value of the layout element instance
          */
        public getValue(layoutElementId: string): any {
            Validate.Validator.ensures(layoutElementId).from("LayoutInstance::getValue")
                                                       .isNotNull()
                                                       .isNotEmpty();

            return this.storage.get(LayoutInstance.Prefix + layoutElementId);
        }

        private notifyChange(layoutElementId: string, value: any) {
            var matchedElement = this.layout.elements.filter(
                (element: LayoutElement, index: number, array: LayoutElement[]) => {
                    return element.id === layoutElementId;
                });

            if (matchedElement.length <= 0) {
                return;
            }

            this.changeListeners.forEach(
                (listener: ILayoutChangeListener, index: number, array: ILayoutChangeListener[]) => {
                    listener.onLayoutElementInstanceChanged(matchedElement[0], value);
                });
        }
    }

    /**
      * The layout provider that takes care of the following tasks
      *  - Loads the pre-defined layouts into memory
      *  - Returns all the loaded layouts
      *  - Tracks (via listening to configuration changes) and returns the currently selected layout
      */
    export class LayoutProvider implements Config.IConfigurationChangeListener {
        private static theInstance: LayoutProvider = null;
        private static version = 3;  // To force web browser reload cache, increase this if you are updating layouts.js.

        private layouts: Layout[];
        private currentLayoutId = "";

        public static get Instance(): LayoutProvider {
            if (!LayoutProvider.theInstance) {
                LayoutProvider.theInstance = new LayoutProvider;
            }

            return LayoutProvider.theInstance;
        }

        /**
          * Loads all the pre-defined layouts. This has to be called before calling any other methods of this class.
          * @param {() => any} callback The callback function that will be called after the loading is finished
          */
        public loadAll(callback: () => any) {
            Validate.Validator.ensures(callback).from("LayoutInstance::loadAll").isNotNull();

            if (this.layouts) {
                callback();
                return;
            }

            var thisProvider = this;
            $.ajax({
                type: "get",
                url: "../layouts/layouts.json?ver=" + LayoutProvider.version,
                data: null,
                success: (data: any) => {
                    thisProvider.layouts = data;
                },
                complete: (jqXHR: any, textStatus: string) => {
                    callback();
                },
                dataType: "json"
            });
        }

        /**
          * Gets all the loaded layouts.
          * @returns {Layout[]} All the loaded layouts
          */
        public get Layouts(): Layout[] {
            Validate.Validator.ensures(this.layouts).from("LayoutInstance::Layouts").isNotNull();

            return this.layouts;
        }

        /**
          * Returns the default layout
          * @returns {Layout} The default layout (normally the first layout in the list)
          */
        public get Default(): Layout {
            return this.Layouts[0];
        }

        /**
          * Returns the id of current layout
          * @returns {string} The id of current layout
          */
        public get CurrentLayoutId(): string {
            return this.currentLayoutId;
        }

        /**
          * Sets the current layout id
          * @param {string} id The layout id
          */
        public set CurrentLayoutId(id: string) {
            Validate.Validator.ensures(id).from("LayoutInstance::CurrentLayoutId")
                                          .isNotNull()
                                          .isNotEmpty();
            this.currentLayoutId = id;
        }

        /**
         * Returns the current layout
         * @returns {Layout} The current layout (if at least one is selected) or the default layout (if none is selected)
         */
        public get CurrentLayout(): Layout {
            return this.getLayoutById(this.CurrentLayoutId);
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            Validate.Validator.ensures(key).from("LayoutInstance::onConfigurationChanged [key]")
                                           .isNotNull()
                                           .isNotEmpty();
            Validate.Validator.ensures(value).from("LayoutInstance::onConfigurationChanged [key]=" + key + " [value]")
                                             .isNotNull();

            if (key === Config.wellKnownKeys.layout) {
                this.currentLayoutId = <string>value;
            }
        }

        private getLayoutById(id: string): Layout {
            var match = this.Layouts.filter((value: Layout, index: number, array: Layout[]) => {
                return (value.id === id);
            });

            return (match.length > 0) ? match[0] : this.Default;
        }
    }
}