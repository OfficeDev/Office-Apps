/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/data.ts"/>
///<reference path="shared/config.ts"/>
///<reference path="shared/validate.ts"/>

/**
  * This module contains the implementation of the People Bar specific data covnertor
  */
module DataViz.Data.PeopleBar {
    "use strict";

    /**
      * This is the data used by the People Bar plotter
      */
    export class KeyValueData {
        private threshold: number;
        private rawData: DataViz.Data.RawData;
        private keyColumnIndex: number;
        private valueColumnIndex: number;
        private hasHeader: boolean;

        /**
          * Instantiates a {@link KeyValueData} instance from the raw data
          * @param {DataViz.Data.RawData} data The raw data
          * @param {number} [keyColumnIndex = 0] The index of the column used as keys
          * @param {number} [valueColumnIndex = 0] The index of the column used as values
          * @param {boolean} [hasHeader = false] Indicating whether the data has header
          * @returns {KeyValueData} The converted data
          */
        public static from(data: DataViz.Data.RawData, keyColumnIndex: number = 0, valueColumnIndex: number = 1, hasHeader: boolean = false): KeyValueData {
            return KeyValueData.isValidKeyValueData(data.unformatted, keyColumnIndex, valueColumnIndex, hasHeader)
                ? new KeyValueData(data, keyColumnIndex, valueColumnIndex, hasHeader) : null;
        }

        /**
          * Determines whether the give raw data is in valid form for People Bar
          * @param {string[][]} data The raw data
          * @param {number} [keyColumnIndex = 0] The index of the column used as keys
          * @param {number} [valueColumnIndex = 0] The index of the column used as values
          * @param {boolean} [hasHeader = false] Indicating whether the data has header
          * @returns {boolean} True if the data is valid; false otherwise
          */
        public static isValidKeyValueData(data: string[][], keyColumnIndex: number = 0, valueColumnIndex: number = 1, hasHeader: boolean = false): boolean {
            var dataNotALLEmpty: boolean = false;
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].length; j++) {
                    if (data[i][j] != "") {
                        dataNotALLEmpty = true;
                        break;
                    }
                }
            }

            return (data)
                && (data.length >= (hasHeader ? 2 : 1))
                && (data[0].length > Math.max(keyColumnIndex, valueColumnIndex))
                && (dataNotALLEmpty);
        }

        /**
          * @param {DataViz.Data.RawData} data The raw data
          * @param {number} [keyColumnIndex = 0] The index of the column used as keys
          * @param {number} [valueColumnIndex = 0] The index of the column used as values
          * @param {boolean} [hasHeader = false] Indicating whether the data has header
          */
        constructor(rawData: DataViz.Data.RawData, keyColumnIndex: number = 0, valueColumnIndex: number = 1, hasHeader: boolean = false) {
            Validate.Validator.ensures(rawData).from("KeyValueData::ctor [rawData]").isNotNull();
            Validate.Validator.ensures(keyColumnIndex).from("KeyValueData::ctor [keyColumnIndex]")
                                                      .isGreaterThanOrEqualTo(0)
                                                      .isLessThan(rawData.unformatted[0].length);
            Validate.Validator.ensures(valueColumnIndex).from("KeyValueData::ctor [valueColumnIndex]")
                                                        .isGreaterThanOrEqualTo(0)
                                                        .isLessThan(rawData.unformatted[0].length);

            this.rawData = rawData;
            this.keyColumnIndex = keyColumnIndex;
            this.valueColumnIndex = valueColumnIndex;
            this.hasHeader = hasHeader;
            this.threshold = this.rawData.unformatted.length;
        }

        /**
          * Sets the index of the column used as keys
          * @param {number} index The key column index
          */
        public set KeyColumnIndex(index: number) {
            Validate.Validator.ensures(index).from("KeyValueData::KeyColumnIndex")
                                             .isGreaterThanOrEqualTo(0)
                                             .isLessThan(this.rawData.unformatted[0].length);

            this.keyColumnIndex = index;
        }

        /**
          * Gets the index of the column used as keys
          * @returns {number} The key column index
          */
        public get KeyColumnIndex(): number {
            return this.keyColumnIndex;
        }

        /**
          * Sets the index of the column used as values
          * @param {number} index The value column index
          */
        public set ValueColumnIndex(index: number) {
            Validate.Validator.ensures(index).from("KeyValueData::ValueColumnIndex")
                                             .isGreaterThanOrEqualTo(0)
                                             .isLessThan(this.rawData.unformatted[0].length);

            this.valueColumnIndex = index;
        }

        /**
          * Gets the index of the column used as values
          * @returns {number} The value column index
          */
        public get ValueColumnIndex(): number {
            return this.valueColumnIndex;
        }

        /**
          * Gets the flag indicating whether the data has a header
          * @returns {boolean} True if it has header; false otherwise
          */
        public get HasHeader(): boolean {
            return this.hasHeader;
        }

        /**
          * Sets the flag indicating whether the data has a header
          * @param {boolean} hasHeader True if it has header; false otherwise
          */
        public set HasHeader(hasHeader: boolean) {
            this.hasHeader = hasHeader;
        }

        /**
          * Gets the headers of all columns
          * @returns {string[]} The headers of all columns
          */
        public get Headers(): string[] {
            return this.rawData.formatted[0];
        }

        /**
          * Gets all the keys
          * @returns {string[]} All the keys
          */
        public get Keys(): string[] {
            var keys: string[] = [];
            for (var i = this.startRow; i < this.endRow; i++) {
                keys.push(String(this.rawData.formatted[i][this.keyColumnIndex]));
            }

            return keys;
        }

        /**
          * Gets all the formatted values
          * @returns {string[]} All the formatted value series
          */
        public get FormattedValueSeries(): string[] {
            var series: string[] = [];
            for (var i = this.startRow; i < this.endRow; i++) {
                series.push(String(this.rawData.formatted[i][this.valueColumnIndex]));
            }

            return series;
        }

        /**
          * Gets the normalized value series. Normalized means all values are non negative numbers
          * @returns {number[]} The normalized value series
          */
        public get NormalizedValueSeries(): number[] {
            var series: number[] = [];
            for (var i = this.startRow; i < this.endRow; i++) {
                var value = Math.max(0, parseFloat(this.rawData.unformatted[i][this.valueColumnIndex]));
                series.push(isNaN(value) ? 0 : value);
            }

            return series;
        }

        /**
          * Sets the threshold of the data
          * @param {number} threshold The threshold of the data
          */
        public setThreshold(threshold: number) {
            Validate.Validator.ensures(threshold).from("KeyValueData::setThreshold").isGreaterThanOrEqualTo(1);

            this.threshold = threshold;
        }

        /**
          * Resets  the threshold of the data
          */
        public resetThreshold() {
            this.threshold = this.rawData.unformatted.length;
        }

        /**
          * Gets a copy of the data with a threshold. Anything beyond the threshold will be discarded from the returned copy
          * @returns {KeyValueData} The data copy with eveything below the threshold
          */
        public withThreshold(threshold: number): KeyValueData {
            Validate.Validator.ensures(threshold).from("KeyValueData::withThreshold").isGreaterThanOrEqualTo(1);

            var result = new KeyValueData(this.rawData, this.keyColumnIndex, this.valueColumnIndex, this.hasHeader);
            result.setThreshold(threshold);

            return result;
        }

        private get startRow(): number {
            return this.hasHeader ? 1 : 0;
        }

        private get endRow(): number {
            return Math.min(this.hasHeader ? (this.threshold + 1) : this.threshold, this.rawData.unformatted.length);
        }
    }

    /**
      * This is a People Bar specific data convertor implementation
      */
    export class KeyValueDataConvertor implements IDataConvertor {
        private rawData: string[][];
        private keyColumnIndex: number;
        private valueColumnIndex: number;

        /**
          * @param {string[][]} data The raw data
          * @param {number} [keyColumnIndex = 0] The index of the column used as keys
          * @param {number} [valueColumnIndex = 0] The index of the column used as values
          */
        constructor(keyColumnIndex: number = 0, valueColumnIndex: number = 1) {
            this.keyColumnIndex = keyColumnIndex;
            this.valueColumnIndex = valueColumnIndex;
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            this.keyColumnIndex = 0;
            this.valueColumnIndex = 1;
        }

        /**
          * Gets the index of the column used as keys
          * @returns {number} The key column index
          */
        public get KeyColumnIndex(): number {
            return this.keyColumnIndex;
        }

        /**
          * Sets the index of the column used as keys
          * @param {number} index The key column index
          */
        public set KeyColumnIndex(index: number) {
            this.keyColumnIndex = index;
        }

        /**
          * Gets the index of the column used as values
          * @returns {number} The value column index
          */
        public get ValueColumnIndex(): number {
            return this.valueColumnIndex;
        }

        /**
          * Sets the index of the column used as values
          * @param {number} index The value column index
          */
        public set ValueColumnIndex(index: number) {
            this.valueColumnIndex = index;
        }

        /**
          * Implementing {@link IDataConvertor#Convert}
          */
        public convert(data: DataViz.Data.RawData): KeyValueData {
            Validate.Validator.ensures(data).from("KeyValueDataConvertor::convert [data]").isNotNull();
            Validate.Validator.ensures(data.unformatted).from("KeyValueDataConvertor::convert [data.unformatted]").isNotNull();
            Validate.Validator.ensures(data.unformatted[0]).from("KeyValueDataConvertor::convert [data.unformatted[0]]").isNotNull();
            var hasHeader = isNaN(parseFloat(data.unformatted[0][1])) ? true : false;

            return KeyValueData.from(data, this.keyColumnIndex, this.valueColumnIndex, hasHeader);
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            // Do nothing.
        }
    }
}