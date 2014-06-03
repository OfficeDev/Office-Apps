/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

///<reference path="../app.ts"/>
///<reference path="../logic/shared/utils.ts"/>

declare var $: any;

module DataViz.UX {
    export class DataPane {
        private static theInstance: DataPane = null;
        private reentryFlag: boolean;
        private titleChanged: boolean;

        constructor() {
            this.reentryFlag = false;

            this.init();
        }

        public static get Instance(): DataPane {
            if (!DataPane.theInstance) {
                DataPane.theInstance = new DataPane();
            }

            return DataPane.theInstance;
        }

        public onDataBindingTargetChanged() {
            // Do nothing
        }

        public show() {
            $("#data-pane").show();
            $("#data-pane").animate({ width: "220px", height: "100%", float: "right" }, "fast");
            $("#data-back-button").focus();
        }

        public hide() {
            if ($("#data-pane")[0].style.width > "0 px") {
                $("#data-pane").animate({ width: "0px", height: "100%", float: "right" }, "fast", null, () => { $("#data-pane").hide(); });
            }
        }

        private init() {
            this.setText();
            this.setEventHandlers();
            DataViz.Utils.setTabFocus("data-pane", "data-back-button", "select-data");
        }

        private setText() {
            $("#data-back-button").attr("alt", DataViz.Resources.UI.backButtonTitle);
            $("#data-back-button").attr("title", DataViz.Resources.UI.backButtonTitle);
            $("#data-pane-title").text(DataViz.Resources.DataPane.header);
            $("#select-data").text(DataViz.Resources.DataPane.selectButtonText);
        }

        private setEventHandlers() {
            $("#data-pane").off("click");
            $("#data-pane").click(() => {
                $("#data-back-button").focus();
            });

            $("#data-back-button").off("click");
            $("#data-back-button").click(() => {
                this.hide();
            }).keydown((event: any) => {
                if (event.which === 13) {
                    this.hide();
                } // Check the enter key.
            });

            $("#select-data").off("click");
            $("#select-data").click(() => {
                DataViz.mainApp.bindData();
            }).keydown((event: any) => {
                    // Check the enter key.
                    if (event.which === 13) {
                        DataViz.mainApp.bindData();
                    }
            });
        }
    }
}