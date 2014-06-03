/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

///<reference path="../app.ts"/>
///<reference path="shared/Galleries.ts"/>
///<reference path="SettingPane.ts"/>
///<reference path="DataPane.ts"/>
///<reference path="../Logic/configurator.agave.ts"/>

declare var $: any;

module Trends.UX {
    export class MainUX {
        private hideFloatMenuTimeoutId: number = null;

        constructor() {
        }

        public init() {
            var showAndHideFloatMenu = () => {
                this.showFloatMenu();

                if (this.hideFloatMenuTimeoutId !== null) {
                    clearTimeout(this.hideFloatMenuTimeoutId);
                }

                this.hideFloatMenuTimeoutId = setTimeout(this.hideFloatMenu, 3000);
            };

            //Disable right click actions in document except for "textarea"
            $(document).on("contextmenu", (e: any) => {
                if (e.target.type !== "textarea") {
                    e.preventDefault();
                    return false;
                }
            });

            //Disable "ctrl + a" in document except for "textarea"
            $(document).on("keydown", (e: any) => {
                if (e.target.type !== "textarea" && e.ctrlKey && (e.which === 65 || e.which === 97)) {
                    return false;
                }
            });

            $("#float-menu-parent").off("hover");
            $("#float-menu-parent").hover(() => { this.showFloatMenu(); }, showAndHideFloatMenu);
            window.addEventListener("click", showAndHideFloatMenu);
            window.addEventListener("keydown", showAndHideFloatMenu);

            $("#setting-button").off("click");
            $("#setting-button").click(() => {
                this.showSettingPane();
            }).keydown((event: any) => {
                // Check the enter key
                if (event.which === 13) {
                    this.showSettingPane();
                }
            });

            $("#data-button").off("click");
            $("#data-button").click(() => {
                this.showDataPane();
            }).keydown((event: any) => {
                // Check the enter key
                if (event.which === 13) {
                    this.showDataPane();
                } 
            });

            this.setText();
            this.setupListeners();
            showAndHideFloatMenu();
        }

        public setupListeners() {
            DataViz.UX.SettingPane.Instance.setupListeners();
        }

        private setText() {
            var dataButton = $("#data-button");
            dataButton.attr("alt", DataViz.Resources.UI.floatMenuDataTitle);
            dataButton.attr("title", DataViz.Resources.UI.floatMenuDataTitle);

            var settingButton = $("#setting-button");
            settingButton.attr("alt", DataViz.Resources.UI.floatMenuSettingTitle);
            settingButton.attr("title", DataViz.Resources.UI.floatMenuSettingTitle);
        }

        private showDataPane() {
            DataViz.UX.SettingPane.Instance.hide();
            DataViz.UX.DataPane.Instance.show();
        }

        private showSettingPane() {
            DataViz.UX.DataPane.Instance.hide();
            DataViz.UX.SettingPane.Instance.show();
        }

        private showFloatMenu() {
            $("#float-menu").fadeIn("slow");
        }

        private hideFloatMenu() {
            $("#float-menu").fadeOut("slow");
        }
    }
}