/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/utils.ts"/>
///<reference path="shared/config.ts"/>

declare var Office: any;

/**
  * This module contains the implementation of the app's specific configurator
  */
module DataViz.Config.Agave {
    export var MaxRowNumber = 15;
    export var MaxColumnNumber = 2;

    /**
      * This is the app's specific configurator
      */
    export class Configurator implements IConfigurator {
        private reentryFlag: boolean;

        constructor() {
            this.reentryFlag = false;
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            // Do nothing.
        }

        /**
          * Implementing {@link IConfigurator#loadAll}
          */
        public loadAll(configuration: Configuration) {
            if (!Office.context.document.settings) {
                return;
            }

            configuration.clear();

            this.reentryFlag = true;
            configuration.Keys.forEach((key: string, index: number, array: string[]) => {
                var value = Office.context.document.settings.get(key);
                if ((value !== null) && (value !== undefined)) {
                    configuration.set(key, value);
                }
            });
            this.reentryFlag = false;
        }

        /**
          * Implementing {@link IConfigurator#Save}
          */
        public save(key: string, value: any) {
            if (Office.context.document.settings) {
                Office.context.document.settings.set(key, value);
                Office.context.document.settings.saveAsync();
            }
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            if (!this.reentryFlag) {
                this.save(key, value);
            }
        }
    }
}
