/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

/**
  * This module contains the basic definitions, helpers for parameter validation
  */
module DataViz.Validate {
    "use strict";

    /**
      * This is a helper to validate parameters.
      *
      * Sample usage:
      * <code>
      * function foo(bar1: number, bar2: string, bar3: boolean, bar4: any)
      * {
      *     // Any failed validation will throw an exception
      *     DataViz.Validate.Validator.ensures(bar1).isGreaterThan(10).isLessThan(20);
      *     DataViz.Validate.Validator.ensures(bar2).isNotEmpty();
      *     DataViz.Validate.Validator.ensures(bar3).isTrue();
      *     DataViz.Validate.Validator.ensures(bar4).isNotNull();
      *     ...
      * }
      * </code>
      *
      */
    export class Validator {
        private static invalidParameterTypeError = "Invalid parameter type";
        private static parameterIsNullError = "Parameter cannot be null";
        private static parameterIsZeroError = "Parameter cannot be zero";
        private static parameterIsEmptyError = "Parameter cannot be empty";
        private static parameterIsNotPositiveError = "Parameter must be positive";
        private static parameterIsNotTrueError = "Parameter must be true";
        private static parameterRangeError = "Parameter must be in the expected range";
        private static parameterIsNotEqualToError = "Parameter must be equal to the expected value";

        private param: any;
        private source: string;

        /**
          * Builds a validator that will validate the given parameter
          * @param {any} param The parameter to be validated
          * @returns {Validator} A validator instance to do the actual validation
          */
        public static ensures(param: any): Validator {
            return new Validator(param);
        }

        private static assertAndThrowIfNeeded(isValid: boolean, errorName: string, message?: string) {
            if (isValid) {
                return;
            }

            throw new Error(errorName + (message ? (": " + message) : ""));
        }

        /**
          * @param {any} param The parameter to be validated
          */
        constructor(param: any) {
            this.param = param;
            this.source = "";
        }

        /**
          * The information provided by the caller
          * @param {string} source This parameter contains the information of the caller.
          * @returns {Validator} The validator instance used to do chain validation
          */
        public from(source: string): Validator
        {
            this.source = source;
            return this;
        }

        /**
          * Checks whether the parameter is neither null nor undefined
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isNotNull(): Validator {
            Validator.assertAndThrowIfNeeded(
                (this.param !== null) && (this.param !== undefined),
                Validator.parameterIsNullError,
                this.source);

            return this;
        }

        /**
          * Checks whether the parameter is of a certain type; also validates against non-null.
          * @param {string} typeName The name of the expected type of the parameter
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isOfType(typeName: string): Validator {
            this.isNotNull();

            Validator.assertAndThrowIfNeeded(
                (typeof (this.param) === typeName),
                Validator.invalidParameterTypeError,
                "Expecting a " + typeName + " but actually a " + typeof (this.param) + " source:" + this.source);

            return this;
        }

        /**
          * Checks whether the parameter is a number; also validates against non-null.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isNumber(): Validator {
            this.isNotNull();

            var sample = 0;
            return this.isOfType(typeof (sample));
        }

        /**
          * Checks whether the parameter is a string; also validates against non-null.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isString(): Validator {
            this.isNotNull();

            var sample = "";
            return this.isOfType(typeof (sample));
        }

        /**
          * Checks whether the parameter is a boolean; also validates against non-null.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isBool(): Validator {
            this.isNotNull();

            var sample = true;
            return this.isOfType(typeof (sample));
        }

        /**
          * Checks whether the parameter is a non-zero number; also validates against non-null and isNumber.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isNotZero(): Validator {
            this.isNotNull();
            this.isNumber();

            Validator.assertAndThrowIfNeeded(
                (this.param !== 0),
                Validator.parameterIsZeroError,
                this.source);

            return this;
        }

        /**
          * Checks whether the parameter is a non-empty ("") string; also validates against non-null and isString.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isNotEmpty(): Validator {
            this.isNotNull();
            this.isString();

            Validator.assertAndThrowIfNeeded(
                (this.param !== ""),
                Validator.parameterIsEmptyError,
                this.source);

            return this;
        }

        /**
          * Checks whether the parameter is true; also validates against non-null and isBool.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isTrue(): Validator {
            this.isNotNull();
            this.isBool();

            Validator.assertAndThrowIfNeeded(
                this.param === true,
                Validator.parameterIsNotTrueError,
                this.source);

            return this;
        }

        /**
          * Checks whether the parameter is a positive number; also validates against non-null and isNumber.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isPositive(): Validator {
            this.isNotNull();
            this.isNumber();

            Validator.assertAndThrowIfNeeded(
                (this.param > 0),
                Validator.parameterIsNotPositiveError,
                this.source);

            return this;
        }

        /**
          * Checks whether the parameter is no less than the given value; also validates against non-null and isNumber.
          * @param {number} value The value compares to.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isGreaterThanOrEqualTo(value: number): Validator {
            this.isNotNull();
            this.isNumber();

            Validator.assertAndThrowIfNeeded(
                this.param >= value,
                Validator.parameterRangeError,
                "Must be greater than or equal to " + value + ", actual is " + this.param + " source:" + this.source);

            return this;
        }

        /**
          * Checks whether the parameter is greater than the given value; also validates against non-null and isNumber.
          * @param {number} value The value compares to.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isGreaterThan(value: number): Validator {
            this.isNotNull();
            this.isNumber();

            Validator.assertAndThrowIfNeeded(
                this.param > value,
                Validator.parameterRangeError,
                "Must be greater than " + value + ", actual is " + this.param + " source:" + this.source);

            return this;
        }

        /**
          * Checks whether the parameter is no larger than the given value; also validates against non-null and isNumber.
          * @param {number} value The value compares to.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isLessThanOrEqualTo(value: number): Validator {
            this.isNotNull();
            this.isNumber();

            Validator.assertAndThrowIfNeeded(
                this.param <= value,
                Validator.parameterRangeError,
                "Must be less than or equal to " + value + ", actual is " + this.param + " source:" + this.source);

            return this;
        }

        /**
          * Checks whether the parameter is less than the given value; also validates against non-null and isNumber.
          * @param {number} value The value compares to.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isLessThan(value: number): Validator {
            this.isNotNull();
            this.isNumber();

            Validator.assertAndThrowIfNeeded(
                this.param < value,
                Validator.parameterRangeError,
                "Must be less than " + value + ", actual is " + this.param + " source:" + this.source);

            return this;
        }

        /**
          * Checks whether the parameter is equal to the given value (including null or undefined).
          * @param {number} value The value compares to.
          * @returns {Validator} The validator instance used to do chain validation if this validation passes
          */
        public isEqualTo(value: any): Validator {
            Validator.assertAndThrowIfNeeded(
                this.param === value,
                Validator.parameterIsNotEqualToError,
                "Expecting: " + value + ", Actual: " + this.param + " source:" + this.source);

            return this;
        }
    }
}