/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="validate.ts"/>

/**
  * This module contains some helper functions
  */
module DataViz.Utils {
    /**
      * Get zoom ratio for the app to adjust some element sizes inside it
      * @returns number The zoom ratio to adjust element sizes
      */
    export function getZoomRatioForApp(): number {
        // No need to zoom in or zoom out as the app size will not change on Office Web Application not matter what's the devicePixelRatio.
        if (DataViz.Utils.isOnWac()) {
            return 1;
        }
        else {
            return getDeviceZoomRatio();
        }
    }

    /**
      * Get device zoom ratio
      * @returns number The zoom ratio of device
      */
    export function getDeviceZoomRatio(): number {
        // For IE10, IE11, Firefox
        if (window.screen.deviceXDPI && window.screen.logicalXDPI) {
                return window.screen.deviceXDPI / window.screen.logicalXDPI
            }
        // For Safari, Chrome
        else if ((<any>window).devicePixelRatio) {
            return (<any>window).devicePixelRatio;
        }
        else {
            return 1;
        }
    }

    /**
      * Determines whether the application is running on an Office Web Application environment.
      */
    export function isOnWac(): boolean {
        return window["OSF"].DDA.ExcelWebAppDocument !== undefined;
    }

    /**
      * A module to handle events according to differnt browers.
      */
    export module BrowserHelper {
        var isFirefox: boolean = navigator.userAgent.toLowerCase().indexOf("firefox") > 0;

        /**
          * Determines whether the browser is IE.
          * @returns True if the browser is IE, false otherwise.
          */
        export function isIE(): boolean {
            return navigator.userAgent.toLowerCase().indexOf("trident") > 0;
        }

        /**
          * Determines whether the browser is IE9.
          * @returns True if the browser is IE9, false otherwise.
          */
        export function isIE9(): boolean {
            var userAgent = navigator.userAgent.toLowerCase();
            return userAgent.indexOf("trident/5.0") > 0 || userAgent.indexOf("msie 9.0") > 0 ;
        }

        /**
          * Get the width of the svg element
          * @param {SVGSVGElement} node An svg node we need to get its width
          * @returns {number} The width of the svg element
          */
        export function getSvgElementWidth(node: SVGSVGElement): number {
            if (isFirefox) {
                return node.getBBox().width; // Works in IE, Chrome, Safari, and Firefox but all have a rendering bug.
            }
            else {
                return node.clientWidth; // Works well in IE, Chrome, and Safari but not in Firefox.
            }
        }

        /**
          * Get the height of the svg element
          * @param {SVGSVGElement} node An svg node we need to get its height
          * @returns {number} The height of the svg element
          */
        export function getSvgElementHeight(node: SVGSVGElement): number {
            if (isFirefox) {
                return node.getBBox().height;
            }
            else {
                return node.clientHeight;
            }
        }
    }

    /**
      * Removes a particular item from an array. If there are multiple matches in the array, all will be removed.
      * @param {any[]} array The array that the item is removed from
      * @param {any} item The item to remove
      * @returns True if succeeded; false otherwise (no such item)
      */
    export function removeItemFromArray(array: any[], item: any): boolean {
        Validate.Validator.ensures(array).from("Utils.removeItemFromArray [array]").isNotNull();
        Validate.Validator.ensures(item).from("Utils.removeItemFromArray [item]").isNotNull();

        var index: number;
        var removed = false;
        while ((index = array.indexOf(item)) !== -1) {
            array.splice(index, 1);
            removed = true;
        }

        return removed;
    }

    /**
      * Formats a number into a string with thousand separators. For example, 1234567 will becom 1,234,567; 1234567.12345 will become 1,234,567.12345
      * Only supports non-negative float numbers.
      * @param {string} value The value to format
      * @returns {string} The formatted string, or the original string if it's not a non-negative float number
      */
    export function formatNumberWithThousandSeparators(value: string): string {
        Validate.Validator.ensures(value).from("Utils.formatNumberWithThousandSeparators").isNotNull();

        // If it's not a non-negative float number, don't add comma separator
        if ( /^[0-9]+(\.[0-9]+)?$/.test(value) ) {
            var decimalPointPosition = value.indexOf(".") >= 0 ? value.indexOf(".") : value.length;
            var result = value.substr(decimalPointPosition);
            var startPos = value.indexOf("-") + 1;
            var index = decimalPointPosition;

            while (index - 3 > startPos) {
                result = "," + value.substr(index - 3, 3) + result;
                index -= 3;
            }

            return value.substr(0, index) + result;
        }
        else {
            return value;
        }
    }

    /**
      * Make the buttons of a certain pane tapped in circle
      * @param {string} paneId The id of the target pane which will get the focus
      * @param {string} firstTabId The id of the element which is the first one getting focused
      * @param {string} lastTabId The id of the element which is the last one getting focused
      */
    export function setTabFocus(paneId: string, firstTabId: string, lastTabId: string) {
        $("#" + paneId).off("keydown");
        $("#" + paneId).on("keydown", (event: any) => {
            if (event.keyCode && event.keyCode === 9) {
                var firstButton = $("#" + firstTabId)[0];
                var lastButton = $("#" + lastTabId)[0];
                if (firstButton && lastButton) {
                    if (event.target === lastButton && !event.shiftKey) {
                        event.preventDefault();
                        firstButton.focus();
                    } else if (event.target === firstButton && event.shiftKey) {
                        event.preventDefault();
                        lastButton.focus();
                    }
                }
            }
        });
    }
    
    /**
      * Replace all the specific sub-strings which contain a number and curly brace like "{1}" with meaningful strings.
      * @param {any[]} ...parameters The parameter[0] is the origin string and others are the replacing strings.
      * @returns {string} The replaced string.
      */
    export function stringFormat(...parameters: any[]) {
        var args = arguments;
        var source: string = args[0];
        return source.replace(/{(\d+)}/gm, <any>function (match: any, number: any) {
            var index: number = parseInt(number, 10) + 1;
            return index >= args.length ? match : (args[index] === null || typeof(args[index]) == 'undefined' ? '' : args[index]);
        });
    };
}