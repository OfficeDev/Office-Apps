/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
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

        private currentButtonId: string = "type-button";
        private menuButtonMap: MenuButtonMap[] =
        [
            { buttonId: "type-button", paneId: "type-pane" },
            { buttonId: "theme-button", paneId: "theme-pane" },
            { buttonId: "shape-button", paneId: "shape-pane" }
        ];

        private buttonMap: any =
        {
            "type-button": "type-pane",
            "theme-button": "theme-pane",
            "shape-button": "shape-pane"
        };

        private typeGallery: UX.Shared.TypeGallery;
        private themeGallery: UX.Shared.ThemeGallery;
        private shapeGallery: UX.Shared.ShapeGallery;

        constructor() {
            $("#setting-pane-title").text(DataViz.Resources.SettingPane.header);
            $("#type-button").text(DataViz.Resources.SettingPane.typeTab);
            $("#theme-button").text(DataViz.Resources.SettingPane.themeTab);
            $("#shape-button").text(DataViz.Resources.SettingPane.shapeTab);

            $("#setting-pane").off("click");
            $("#setting-pane").click( () => {
                $("#back-button").focus();
            });

            var backButton = $("#back-button");
            backButton.attr("alt", DataViz.Resources.UI.backButtonTitle);
            backButton.attr("title", DataViz.Resources.UI.backButtonTitle);
            backButton.off("click");
            backButton.click(() => {
                this.hide();
            }).keydown((event: any) => {
                // Check the enter key.
                if (event.which === 13) {
                    this.hide();
                }
            });

            this.typeGallery = UX.Shared.TypeGallery.build();
            this.themeGallery = UX.Shared.ThemeGallery.build();
            this.shapeGallery = UX.Shared.ShapeGallery.build();

            this.setMenuClickListener();

            this.showInternalPane("type-pane");
            $("#" + this.buttonMap[this.currentButtonId]).hide();
        }

        public setupListeners() {
            this.typeGallery.setupListener();
            this.themeGallery.setupListener();
            this.shapeGallery.setupListener();
        }

        public static get Instance(): SettingPane {
            if (!SettingPane.theInstance) {
                SettingPane.theInstance = new SettingPane();
            }

            return SettingPane.theInstance;
        }

        public show() {
            $("#setting-pane").show();
            $("#setting-pane").animate({ width: "220px", height: "100%", float: "right" }, "fast", null, () => {
                $("#" + this.buttonMap[this.currentButtonId]).fadeIn();
            });
            $("#" + this.currentButtonId).focus();
        }

        public hide() {
            if ($("#setting-pane")[0].style.width > "0 px") {
                $("#" + this.buttonMap[this.currentButtonId]).hide();
                $("#setting-pane").animate({ width: "0px", height: "100%", float: "right" }, "fast", null, () => { $("#setting-pane").hide(); });
            }
        }

        public populate() {
            this.typeGallery.populate(DataViz.Resources.SettingPane.typeTitles);
            this.themeGallery.populate(DataViz.Resources.SettingPane.themeTitles);
            this.shapeGallery.populate(DataViz.Resources.SettingPane.shapeTitles);
        }

        private setMenuClickListener() {
            var thisSettingPane = this;
            for (var index = 0; index < this.menuButtonMap.length; index++) {
                $("#" + this.menuButtonMap[index].buttonId).off("click");
                $("#" + this.menuButtonMap[index].buttonId)
                    .data("menuButtonIndex", index)
                    .mousedown(function (event: any) {
                        $(this).animate({
                            paddingTop: "1px"
                        }, "fast");
                        thisSettingPane.menuClickAction(event)
                    })
                    .mouseup(function (event: any) {
                        $(this).animate({
                            paddingTop: "0"
                        }, "fast");
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
                    this.currentButtonId = this.menuButtonMap[index].buttonId;
                    $("#" + this.menuButtonMap[index].paneId).fadeIn("fast", () => {
                        $("#" + this.currentButtonId).addClass("sub-title-click");
                        var lastItemId = $("#" + paneId).children().last().attr("id");
                        DataViz.Utils.setTabFocus("setting-pane", "back-button", lastItemId);
                    });
                }
                else {
                    $("#" + this.menuButtonMap[index].paneId).hide();
                    $("#" + this.menuButtonMap[index].buttonId).removeClass("sub-title-click");
                }
            }
        }
    }
}