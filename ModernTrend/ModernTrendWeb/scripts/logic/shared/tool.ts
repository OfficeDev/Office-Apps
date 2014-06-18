/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="validate.ts"/>

/**
  * This module contains the basic definition implementations of the tools
  */
module DataViz.Tools {
    "use strict";

    /**
      * This interface defines the general behavior of a tool
      */
    export interface ITool {
        /**
          * Resets the tool
          */
        resetTool(): void;
    }

    /**
      * This interface defines a generic "pausable" behavior
      */
    export interface IPausable {
        /**
          * Pauses the operation
          */
        pause(): void;

        /**
          * Resumes the operation
          */
        resume(): void;

        /**
          * Checks whether the operation is paused.
          * @returns {boolean} true if paused; false otherwise
          */
        isPaused(): boolean;
    }

    /**
      * A reusable implementation of the {@link IPausable}
      */
    export class Pausable implements IPausable {
        private paused: boolean;

        constructor() {
            this.paused = false;
        }

        /**
          * Implementing {@link IPausable#Pause}
          */
        public pause() {
            this.paused = true;
        }

        /**
          * Implementing {@link IPausable#Resume}
          */
        public resume() {
            this.paused = false;
        }

        /**
          * Implementing {@link IPausable#IsPaused}
          */
        public isPaused(): boolean {
            return this.paused;
        }
    }

    /**
      * A tool class factory helper
      */
    export class ToolsFactory {
        private static toolsPool: any = {};

        /**
          * Builds a particular tool with a given class name.
          * @param {string} className The fully qualified class name of the tool
          * @returns {any} The tool instance or null if fails to build
          */
        public static buildTool(className: string): any {
            Validate.Validator.ensures(className).from("ToolsFactory::buildTool")
                                                 .isNotNull()
                                                 .isNotEmpty();

            var existingTool = ToolsFactory.toolsPool[className];
            if (existingTool) {
                return existingTool;
            }

            var toolClass = eval(className);
            if (!toolClass) {
                return null;
            }

            var newTool = new toolClass;
            ToolsFactory.toolsPool[className] = newTool;
            return newTool;
        }
    }
}
