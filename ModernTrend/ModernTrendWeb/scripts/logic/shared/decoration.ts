/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

///<reference path="config.ts"/>
///<reference path="validate.ts"/>

/**
  * This module contains the basic definitions, constants and base-classes of customizable decoration related tasks
  */
module DataViz.Decoration {
    "use strict";

    /**
      * The base class of a single definition in the customizable decoration
      */
    export class Customizable {
        /**
          * The id of the item
          */
        public id: string;

        /**
          * The thumbnail image URL of the item
          */
        public thumbnail: string;
    }

    /**
      * This class represents a single theme definition
      */
    export class Theme extends Customizable {
        /**
          * The ID of the SKU that uses this theme. Empty (null/""/undefined) if this theme is SKU-neutral.
          */
        public sku: string;

        /**
          * The CSS URL of this theme
          */
        public css: string;
    }

    /**
      * This class represents a single shape definition
      */
    export class Shape extends Customizable {
        /**
          * The ID of the SKU that uses this shape. Empty (null/""/undefined) if this shape is SKU-neutral.
          */
        public sku: string;

        /**
          * The data of the SVG <path> definition of this shape
          */
        public path: string;

        /**
          * The original width of this shape
          */
        public width: number;

        /**
          * The original height of this shape
          */
        public height: number;
    }

    /**
      * The theme provider that takes care of the following tasks
      *  - Loads the pre-defined themes into memory
      *  - Returns all the loaded themes
      *  - Returns the themes for a particular SKU
      *  - Tracks (via listening to configuration changes) and returns the currently selected theme
      */
    export class ThemeProvider implements Config.IConfigurationChangeListener {
        private static theInstance: ThemeProvider = null;
        private static version = 2; // To force web browser reload cache, increase this if you are updating themes.js or any of the stylesheets.

        private definitions: Theme[] = null;
        private currentThemeId = "";

        public static get Instance(): ThemeProvider {
            if (!ThemeProvider.theInstance) {
                ThemeProvider.theInstance = new ThemeProvider;
            }

            return ThemeProvider.theInstance;
        }

        /**
          * Loads all the pre-defined themes. This has to be called before calling any other methods of this class.
          * @param {() => any} callback The callback function that will be called after the loading is finished
          */
        public loadAll(callback: () => any) {
            Validate.Validator.ensures(callback).from("ThemeProvider::loadAll").isNotNull();

            if (this.definitions) {
                callback();
                return;
            }

            // TODO: Consider split and delay loading
            var thisProvider = this;
            $.ajax({
                type: "get",
                url: "../themes/themes.json?ver=" + ThemeProvider.version,
                data: null,
                success: (data: any) => {
                    thisProvider.definitions = data;
                },
                complete: (jqXHR: any, textStatus: string) => {
                    callback();
                },
                dataType: "json"
            });
        }

        /**
          * Gets all the loaded themes.
          * @returns {Theme[]} All the loaded themes
          */
        public get Themes(): Theme[] {
            Validate.Validator.ensures(this.definitions).from("ThemeProvider::Themes").isNotNull();

            return this.definitions;
        }

        /**
          * Enumerates all the themes for a particular SKU
          * @param {string} skuId The id of SKU
          * @returns {Theme[]} All the themes for a particular SKU, which include all the SKU-neutral themes
          */
        public enumerateForSku(skuId: string): Theme[] {
            Validate.Validator.ensures(skuId).from("ThemeProvider::enumerateForSku")
                                             .isNotNull()
                                             .isNotEmpty();

            return this.Themes.filter((theme: Theme, index: number, array: Theme[]) => {
                return (theme.sku === skuId) || (theme.sku === "") || (!theme.sku);
            });
        }

        /**
          * Returns the default theme
          * @returns {Theme} The default theme (normally the first theme in the list)
          */
        public get Default(): Theme {
            return this.Themes[0];
        }

        /**
          * Returns the id of the current theme
          * @returns {string} The id of the current theme
          */
        public get CurrentThemeId(): string {
            return this.currentThemeId;
        }

        /**
          * Sets the current theme id
          * @param {string} id The theme id
          */
        public set CurrentThemeId(id: string) {
            Validate.Validator.ensures(id).from("ThemeProvider::CurrentThemeId")
                                          .isNotNull()
                                          .isNotEmpty();
            this.currentThemeId = id;
        }

        /**
          * Returns the current theme
          * @returns {Theme} The current theme (if at least one is selected) or the default theme (if none is selected)
          */
        public get CurrentTheme(): Theme {
            var theme = this.getThemeById(this.currentThemeId);
            return theme ? theme : this.Default;
        }

        /**
          * Returns the CSS URL for the current theme
          * @returns {string} The CSS URL for the current theme
          */
        public get CurrentThemeCssUrl(): string {
            return this.CurrentTheme.css + "?ver=" + ThemeProvider.version
        }

        /**
          * Gets the theme with the given id
          * @param {string} id The id of a theme
          * @returns {Theme} The theme with the given id or null if not found
          */
        public getThemeById(id: string): Theme {
            var match = this.Themes.filter((value: Theme, index: number, array: Theme[]) => {
                return (value.id === id);
            });

            return (match.length > 0) ? match[0] : null;
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            Validate.Validator.ensures(key).from("ThemeProvider::onConfigurationChanged [key]")
                                           .isNotNull()
                                           .isNotEmpty();
            Validate.Validator.ensures(value).from("ThemeProvider::onConfigurationChanged [key]=" + key + " [value]")
                                             .isNotNull();

            if (key === Config.wellKnownKeys.theme) {
                this.currentThemeId = <string>value;
            }
        }
    }

    /**
      * The shape provider that takes care of the following tasks
      *  - Loads the pre-defined shapes into memory
      *  - Returns all the loaded shapes
      *  - Returns the shapes for a particular SKU
      *  - Tracks (via listening to configuration changes) and returns the currently selected shape
      */
    export class ShapeProvider implements Config.IConfigurationChangeListener {
        private static theInstance: ShapeProvider = null;
        private static version = 1;  // To force web browser reload cache; increase it if you are updating shapes.js.

        private definitions: Shape[] = null;
        private currentShapeId = "";

        public static get Instance(): ShapeProvider {
            if (!ShapeProvider.theInstance) {
                ShapeProvider.theInstance = new ShapeProvider;
            }

            return ShapeProvider.theInstance;
        }

        /**
          * Loads all the pre-defined shapes. This has to be called before calling any other methods of this class.
          * @param {() => any} callback The callback function that will be called after the loading is finished
          */
        public loadAll(callback: () => any) {
            Validate.Validator.ensures(callback).from("ShapeProvider::loadAll").isNotNull();

            if (this.definitions) {
                callback();
                return;
            }

            var thisProvider = this;
            $.ajax({
                type: "get",
                url: "../shapes/shapes.json?ver=" + ShapeProvider.version,
                data: null,
                success: (data: any) => {
                    thisProvider.definitions = data;
                },
                complete: (jqXHR: any, textStatus: string) => {
                    callback();
                },
                dataType: "json"
            });
        }

        /**
          * Gets all the loaded shapes.
          * @returns {Shape[]} All the loaded shapes
          */
        public get Shapes(): Shape[] {
            Validate.Validator.ensures(this.definitions).from("ShapeProvider::Shapes").isNotNull();

            return this.definitions;
        }

        /**
          * Enumerates all the shapes for a particular SKU
          * @param {string} skuId The id of SKU
          * @returns {Shape[]} All the shapes for a particular SKU, which include all the SKU-neutral shapes
          */
        public enumerateForSku(skuId: string): Shape[] {
            Validate.Validator.ensures(skuId).from("ShapeProvider::enumerateForSku")
                                             .isNotNull()
                                             .isNotEmpty();

            return this.Shapes.filter((shape: Shape, index: number, array: Shape[]) => {
                return (shape.sku === skuId) || (shape.sku === "") || (!shape.sku);
            });
        }

        /**
          * Returns the default shape
          * @returns {Shape} The default shape (normally the first shape in the list)
          */
        public get Default(): Shape {
            return this.Shapes[0];
        }

        /**
          * Returns the id of current shape
          * @returns {string} The id of current shape
          */
        public get CurrentShapeId(): string {
            return this.currentShapeId;
        }

        /**
          * Sets the current shape id
          * @param {string} id The shape id
          */
        public set CurrentShapeId(id: string) {
            Validate.Validator.ensures(id).from("ShapeProvider::CurrentShapeId")
                                          .isNotNull()
                                          .isNotEmpty();
            this.currentShapeId = id;
        }

        /**
          * Returns the current shape
          * @returns {Shape} The current shape (if at least one is selected) or the default shape (if none is selected)
          */
        public get CurrentShape(): Shape {
            var shape = this.getShapeById(this.currentShapeId);
            return shape ? shape : this.Default;
        }

        /**
          * Gets the shape with the given id
          * @param {string} id The id the shape to get
          * @returns {Shape} The shape with the given id or null if not found
          */
        public getShapeById(id: string): Shape {
            var match = this.Shapes.filter((value: Shape, index: number, array: Shape[]) => {
                return (value.id === id);
            });

            return (match.length > 0) ? match[0] : null;
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            Validate.Validator.ensures(key).from("ShapeProvider::onConfigurationChanged [key]")
                                           .isNotNull()
                                           .isNotEmpty();
            Validate.Validator.ensures(value).from("ShapeProvider::onConfigurationChanged [key]=" + key + " [value]")
                                             .isNotNull();

            if (key === Config.wellKnownKeys.shape) {
                this.currentShapeId = <string>value;
            }
        }
    }
}