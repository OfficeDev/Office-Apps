/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. Licensed under the Apache License, Version 2.0. 
See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="../app.ts"/>
///<reference path="shared/Galleries.ts"/>

declare var $: any;

module DataViz.UX {
    export interface MenuButtonMap {
        buttonId: string;
        paneId: string;
    }

    export class SettingPane {
        private static theInstance: SettingPane;
        private static currentButtonId: string = "theme-button";

        private menuButtonMap: MenuButtonMap[] =
            [
                { buttonId: "theme-button", paneId: "theme-pane" },
            ];

        private themeGallery: UX.Shared.ThemeGallery;

        constructor() {
            $("#setting-pane-title").text(DataViz.Resources.SettingPane.header);
            $("#theme-button").text(DataViz.Resources.SettingPane.themeTab);

            $("#setting-pane").off("click");
            $("#setting-pane").click(() => {
                $("#" + DataViz.mainApp.Configuration.get(DataViz.Config.wellKnownKeys.theme)).focus();
            });

            var backButton = $("#setting-back-button");
            backButton.attr("alt", DataViz.Resources.UI.backButtonTitle);
            backButton.attr("title", DataViz.Resources.UI.backButtonTitle);
            backButton.off("click");
            backButton.click(() => {
                this.hide();
            }).keydown((event: any) => {
                if (event.which === 13) {
                    this.hide();
                } // Check the enter key.
            });

            this.themeGallery = UX.Shared.ThemeGallery.build();

            this.setMenuClickListener();

            this.showInternalPane("theme-pane");
        }

        public setupListeners() {
            this.themeGallery.setupListener();
        }

        public static get Instance(): SettingPane {
            if (!SettingPane.theInstance) {
                SettingPane.theInstance = new SettingPane();
            }

            return SettingPane.theInstance;
        }

        public show() {
            $("#setting-pane").show();
            $("#setting-pane").animate({ width: "220px", height: "100%", float: "right" }, "fast");
            $("#" + DataViz.mainApp.Configuration.get(DataViz.Config.wellKnownKeys.theme)).focus();
        }

        public hide() {
            if ($("#setting-pane")[0].style.width > "0 px") {
                $("#setting-pane").animate({ width: "0px", height: "100%", float: "right" }, "fast", null, () => { $("#setting-pane").hide(); });
            }
        }

        public populate() {
            this.themeGallery.populate(DataViz.Resources.SettingPane.themeTitles);
        }

        private setMenuClickListener() {
            for (var index = 0; index < this.menuButtonMap.length; index++) {
                $("#" + this.menuButtonMap[index].buttonId).off("click");
                $("#" + this.menuButtonMap[index].buttonId)
                    .data("menuButtonIndex", index)
                    .click((event: any) => {
                        this.menuClickAction(event)
                    })
                    .keydown((event: any) => {
                        if (event.which === 13) {
                            this.menuClickAction(event);
                        } // Check the enter key.
                    });
            }
        }

        private menuClickAction(event: any) {
            var menuButtonIndex = $(event.target).data("menuButtonIndex");
            this.showInternalPane(this.menuButtonMap[menuButtonIndex].paneId);
        }

        private showInternalPane(paneId: string) {
            for (var index = 0; index < this.menuButtonMap.length; index++) {
                if (this.menuButtonMap[index].paneId === paneId) {
                    $("#" + this.menuButtonMap[index].paneId).show();
                    $("#" + this.menuButtonMap[index].buttonId).addClass("setting-tab-click");
                    SettingPane.currentButtonId = this.menuButtonMap[index].buttonId;
                }
                else {
                    $("#" + this.menuButtonMap[index].paneId).hide();
                    $("#" + this.menuButtonMap[index].buttonId).removeClass("setting-tab-click");
                }
            }

            DataViz.Utils.setTabFocus("setting-pane", "setting-back-button", "blackwhite");
        }
    }
}