/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="../app.ts"/>

declare var $: any;

module DataViz.UX {
    export class DataPane implements DataViz.Chart.ILayoutChangeListener {
        private static theInstance: DataPane = null;
        private reentryFlag: boolean;
        private titleChanged: boolean;
        private timeoutId: number = null;

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

        public onLayoutChanged(layout: Chart.Layout) {
        }

        public onLayoutElementChanged(layoutElement: Chart.LayoutElement) {
        }

        public onLayoutElementInstanceChanged(layoutElement: Chart.LayoutElement, value: any) {
            if (this.reentryFlag) {
                return;
            }

            switch (layoutElement.id) {
                case "title":
                    $("#edit-title").text(value);
                    break;
            }
        }

        public setupListeners() {
            DataViz.mainApp.LayoutInstance.registerListener(this);
        }

        public show(isFocusOnTitle: boolean) {
            $("#data-pane").show();
            $("#data-pane").animate({ width: "220px", height: "100%", float: "right" }, "fast", null, () => {
                if (isFocusOnTitle && $("#edit-title")[0]) {
                    // On IE browser, textarea.select() may cause "Incorrect Function" exception if the textarea is not fully visible
                    try {
                        (<HTMLTextAreaElement>$("#edit-title")[0]).select();
                    } catch(e) {
                        // do nothing
                    }
                }

                $("#edit-title").focus();
            });
        }

        public hide() {
            if ($("#data-pane")[0].style.width > "0 px") {
                $("#data-pane").animate({ width: "0px", height: "100%", float: "right" }, "fast", null, () => { $("#data-pane").hide(); });
            }
        }

        private init() {
            this.setText();
            this.setEventHandlers();
            DataViz.Utils.setTabFocus("data-pane", "data-back-button", "edit-title");
        }

        private setText() {
            $("#data-back-button").attr("alt", DataViz.Resources.UI.backButtonTitle);
            $("#data-back-button").attr("title", DataViz.Resources.UI.backButtonTitle);
            $("#data-pane-title").text(DataViz.Resources.DataPane.header);
            $("#select-data").text(DataViz.Resources.DataPane.selectButtonText);
            $("#edit-title-label").text(DataViz.Resources.DataPane.editTitleLabel);
        }

        private setEventHandlers() {
            $("#data-back-button").off("click");
            $("#data-back-button").click( () => {
                this.hide();
            }).keydown((event: any) => {
                // Check the enter key.
                if (event.which === 13) {
                    this.hide();
                }
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

            var inputHandler = () => {
                    this.reentryFlag = true;
                    this.titleChanged = true;
                    var titleElement : HTMLTextAreaElement = <HTMLTextAreaElement>$("#edit-title")[0];
                    $("#title").text(titleElement.value);

                    if (this.timeoutId) {
                        clearTimeout(this.timeoutId);
                    }

                    this.timeoutId = setTimeout( () => {
                            DataViz.mainApp.LayoutInstance.setValue("title", titleElement.value);
                            this.timeoutId = null;
                        }, 100);
                    this.reentryFlag = false;
                };

            $("#edit-title").unbind("input");
            $("#edit-title").bind("input", inputHandler);

            // IE9 doesn't fire the input event when characters are deleted from a text field using the backspace or delete key
            if (DataViz.Utils.BrowserHelper.isIE9()) {
                $("#edit-title").off("keydown");
                $("#edit-title").on("keydown", (event: any) => {
                        // key code 46 is delete, key code 8 is backspace
                        if (event.keyCode && (event.keyCode === 46 || event.keyCode === 8)) {
                            inputHandler();
                        }
                    });
            }

            $("#edit-title").off("focusout");
            $("#edit-title").on("focusout", () => {
                if (this.titleChanged) {
                    this.titleChanged = false;
                }
            });
        }
    }
}