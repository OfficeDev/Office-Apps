/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
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