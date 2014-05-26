/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="../app.ts"/>
///<reference path="shared/Galleries.ts"/>
///<reference path="SettingPane.ts"/>
///<reference path="DataPane.ts"/>

declare var $: any;

module DataViz.UX {
    export class MainUX {
        constructor() {
        }

        public init() {
            if (DataViz.Utils.BrowserHelper.isIE()) {
                $(document).off("focusout");
                $(document).focusout(() => {
                    this.hideFloatMenu();
                });

                $(document).off("focusin");
                $(document).focusin(() => {
                    this.showFloatMenu();
                });
            }
            else {
                $(window).off("blur");
                $(window).blur(() => {
                    this.hideFloatMenu();
                });

                $(window).off("focus");
                $(window).focus(() => {
                    this.showFloatMenu();
                });
            }

            $("#chart-setting-button").off("click");
            $("#chart-setting-button").click(() => {
                DataViz.UX.DataPane.Instance.hide();
                DataViz.UX.SettingPane.Instance.show();
            });

            $("#data-settings-button").off("click");
            $("#data-settings-button").click(() => {
                DataViz.UX.SettingPane.Instance.hide();
                DataViz.UX.DataPane.Instance.show(false);
            });

            this.setText();
            this.setupListeners();
        }

        public setupListeners() {
            DataViz.UX.SettingPane.Instance.setupListeners();
            DataViz.UX.DataPane.Instance.setupListeners();
        }

        private setText() {
            var dataButton = $("#data-settings-button");
            dataButton.attr("alt", DataViz.Resources.UI.floatMenuDataTitle);
            dataButton.attr("title", DataViz.Resources.UI.floatMenuDataTitle);

            var settingButton = $("#chart-setting-button");
            settingButton.attr("alt", DataViz.Resources.UI.floatMenuSettingTitle);
            settingButton.attr("title", DataViz.Resources.UI.floatMenuSettingTitle);
        }

        private showFloatMenu() {
            $("#float-menu").show();
        }

        private hideFloatMenu() {
            $("#float-menu").hide();
        }
    }
}
