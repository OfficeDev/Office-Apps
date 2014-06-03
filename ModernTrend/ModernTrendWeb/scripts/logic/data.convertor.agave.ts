/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

///<reference path="shared/data.ts"/>
///<reference path="shared/config.ts"/>

/**
  * This module contains the implementation of the People Bar specific data covnertor
  */
module Trends.Data {
    "use strict";

    export interface RawData {
        hasHeader: boolean;
        formatted: any;
        unformatted: any;
    }

    export interface PointDataOnLine {
        originalIndex: number;
        formatted: string;
        unformatted: number;
    }

    export interface LineDataConverted {
        validDataCount: number;
        data: PointDataOnLine[];
    }

    export interface BindingData {
        header: string[];
        xData: string[];
        yData: LineDataConverted[];
    }

    /**
      * This is the specific data convertor implementation of the app
      */
    export class DataConvertor implements DataViz.Data.IDataConvertor {
        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            //Do nothing.
        }

        /**
          * Determines whether the binding is a table and its column number is more than one
          * @param {any} binding used to get data.
          * @returns {boolean} True if the binding is valid; false otherwise
          */
        public static isBindingValid(binding: any): boolean {
            return (binding && binding.type === Office.BindingType.Matrix && binding.columnCount > 1);
        }

        /**
          * Implementing {@link IDataConvertor#Convert}
          * @param {RawData} the raw data contains both formatted and unformatted data.
          * Example: data.formatted: [["21-Jul", "$41.00"], ["22-Jul", "$29.00"], ...]
          *          data.unformatted: [[41476, 41], [41477, 29], ...]
          * @returns {BindingData} The converted data
          */
        public convert(data: RawData): BindingData {
            var convertedData: BindingData = { header: [], xData: [], yData: null };
            if (!this.isDataValid(data.formatted) || !this.isDataValid(data.unformatted)) {
                return convertedData;
            }

            var lineNumber = Math.min(data.formatted[0].length - 1, DataViz.Config.Trends.MaxLineNumber);
            if (data.hasHeader) {
                for (var i = 0; i < lineNumber; i++) {
                    convertedData.header[i] = data.formatted[0][i + 1];
                }
            }
            
            convertedData.yData = [];
            for (var i = 0; i < lineNumber; i++) {
                convertedData.yData.push({
                    validDataCount: 0,
                    data: []
                });
            }

            var columnNumber = Math.min(data.formatted.length, DataViz.Config.Trends.MaxColumnNumber);
            var columnNumberStartIndex = data.hasHeader ? 1 : 0;
            for (var i = columnNumberStartIndex; i < columnNumber; i++) {
                convertedData.xData[i - columnNumberStartIndex] = data.formatted[i][0];

                for (var j = 0; j < lineNumber; j++) {
                    var temp = parseFloat(data.unformatted[i][j + 1]);
                    if (!isNaN(temp)) {
                        convertedData.yData[j].validDataCount++;
                        convertedData.yData[j].data.push({
                            originalIndex: i - columnNumberStartIndex,
                            formatted: data.formatted[i][j + 1],
                            unformatted: temp
                        });
                    }
                }
            }           

            return convertedData;
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            //Do nothing.
        }

        private isDataValid(data: any): boolean {
            return data !== null && data !== undefined;
        }
    }
}