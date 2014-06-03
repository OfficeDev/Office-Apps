/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

declare var $: any;
declare var Office: any;

module DataViz.UX {
    export var infoColors = {
        red: "#a80f22",
        green: "#217346",
    };

    /**
      * This class is the Data Binding Dialog UI.
      */
    export class BindingPane {
        private static bindingPaneStyle = {
            "binding-pane-style": [["min-width", "400"]],
            "binding-pane-title-style": [["top", "17"], ["margin-left", "30"], ["font-size", "20"]],
            "binding-pane-subtitle-style": [["margin-top", "38"], ["margin-left", "30"], ["font-size", "12"]],
            "sample-data-pane-style": [["margin-top", "15"], ["margin-left", "30"], ["min-width", "180"]],
            "binding-pane-info-text-style": [["margin-top", "20"], ["margin-left", "30"], ["font-size", "12"], ["line-height", "12"]],
            "button-group": [["height", "30"], ["margin-top", "20"], ["margin-bottom", "20"]],
            "button": [["font-size", "14"], ["min-width", "80"], ["max-width", "200"], ["height", "30"], ["padding-left", "20"], ["padding-right", "20"], ["line-height", "14"]],
            "binding-pane-cancel": [["margin-right", "20"]],
            "binding-pane-ok": [["margin-right", "10"]],
            "td": [["font-size", "12"], ["height", "18"], ["padding-left", "10"], ["padding-right", "10"]],
        };
        private static sampleDataMaxRowNumber = 5;
        private static defaultArgs: BindingPaneArgs = {
            sampleData: null,
            handleDataSelection: null,
            buttonOKCallback: null,
            buttonCancelCallback: null,
            title: "Select your data to create a chart",
            subtitle: "SAMPLE DATA",
            infoText: "",
            buttonOKText: "Create",
            buttonCancelText: "Cancel",
        };
        private selectionChangeHandler: any;
        private resizeHandler: any;
        private args: BindingPaneArgs;
        private bindingPaneElementsStyle: any;
        private selectedData: any;
        // jQuery elements
        private bindingPaneDim: any;
        private bindingPane: any;
        private titleSpan: any;
        private subtitle: any;
        private sampleDataPane: any;
        private infoText: any;
        private buttonGroup: any;
        private buttonCancel: any;
        private buttonOk: any;
        private td: any;
        private zoomRatio: number;

        /**
          * Constructor
          */
        constructor() {
            this.zoomRatio = 1;
            $("body").append(
                $("<div/>", { id: "binding-pane-dim", "class": "binding-dim-style" })
                ).append(
                $("<div/>", { id: "binding-pane", "class": "binding-pane-style" }).append(
                    $("<span/>", { id: "binding-pane-title-span", "class": "binding-pane-title-style" })
                    ).append(
                    $("<div/>", { id: "subtitle", "class": "binding-pane-subtitle-style" })
                    ).append(
                    $("<div/>", { id: "sample-data-pane", "class": "sample-data-pane-style" })
                    ).append(
                    $("<div/>", { id: "binding-pane-info-text", "class": "binding-pane-info-text-style" })
                    ).append(
                    $("<div/>", { id: "button-group", "class": "button-group" }).append(
                        $("<button/>", { id: "binding-pane-cancel", "class": "button button-white binding-pane-cancel" })
                        ).append(
                        $("<button/>", { id: "binding-pane-ok", "class": "button button-green binding-pane-ok" })
                        )
                    )
                );

            this.bindingPaneDim = $("#binding-pane-dim");
            this.bindingPane = $("#binding-pane");
            this.titleSpan = $("#binding-pane-title-span");
            this.subtitle = $("#subtitle");
            this.sampleDataPane = $("#sample-data-pane");
            this.infoText = $("#binding-pane-info-text");
            this.buttonGroup = $("#button-group");
            this.buttonCancel = $("#binding-pane-cancel");
            this.buttonOk = $("#binding-pane-ok");

            this.resizeHandler = () => {
                this.resetPaneContentPosition();
            };

            DataViz.Utils.setTabFocus("binding-pane-content", "binding-pane-cancel", "binding-pane-cancel");
            this.args = {};
        }

        /**
          * Use new arguments to update the Data Binding UI and its event handlers.
          * @param {BindingPaneArgs} args The arguments used to update the binding pane
          */
        public updateBindingPane(args: BindingPaneArgs): BindingPane {
            if (args) {
                this.updateArgs(args);
                this.handleArgs();
            }

            this.zoomBindingPane();
            return this;
        }

        public zoomBindingPane(): BindingPane {
            this.zoomRatio = DataViz.Utils.getZoomRatioForApp();
            this.bindingPaneElementsStyle = {};
            this.handleStyleInHDPI("bindingPane", ["binding-pane-style"]),
            this.handleStyleInHDPI("title", ["binding-pane-title-style"]),
            this.handleStyleInHDPI("subtitle", ["binding-pane-subtitle-style"]),
            this.handleStyleInHDPI("sampleDataPane", ["sample-data-pane-style"]),
            this.handleStyleInHDPI("infoText", ["binding-pane-info-text-style"]),
            this.handleStyleInHDPI("buttonGroup", ["button-group"]),
            this.handleStyleInHDPI("cancel", ["button", "binding-pane-cancel"]),
            this.handleStyleInHDPI("ok", ["button", "binding-pane-ok"]),
            this.handleStyleInHDPI("td", ["td"]),

            this.bindingPane.css(this.bindingPaneElementsStyle.bindingPane);
            this.titleSpan.css(this.bindingPaneElementsStyle.title);
            this.subtitle.css(this.bindingPaneElementsStyle.subtitle);
            this.sampleDataPane.css(this.bindingPaneElementsStyle.sampleDataPane);
            this.infoText.css(this.bindingPaneElementsStyle.infoText);
            this.buttonGroup.css(this.bindingPaneElementsStyle.buttonGroup)
            this.buttonCancel.css(this.bindingPaneElementsStyle.cancel);
            this.buttonOk.css(this.bindingPaneElementsStyle.ok);

            if (this.td[0]) {
                this.td.css(this.bindingPaneElementsStyle.td);
            }

            return this;
        }

        /**
          * Show the Data Binding UI.
          */
        public show() {
            this.bindingData = null;
            $(window).on("resize", this.resizeHandler);
            this.bindingPaneDim.fadeIn("fast");
            this.buttonOk.attr("disabled", "disabled");
            if (this.selectionChangeHandler) {
                this.selectionChangeHandler();
                Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, this.selectionChangeHandler);
            }
            
            this.resetPaneContentPosition();
            this.bindingPane.fadeIn("fast", () => {
                this.buttonCancel.focus();
            });
        }

        /**
          * Hide the Data Binding UI.
          */
        public hide() {
            $(window).off("resize", this.resizeHandler);
            if (this.selectionChangeHandler) {
                Office.context.document.removeHandlerAsync(Office.EventType.DocumentSelectionChanged, { handler: this.selectionChangeHandler });
            }

            this.bindingPane.fadeOut("fast");
            this.bindingPaneDim.fadeOut("fast");
        }

        /**
          * Identify whether the string is numeric
          * @param {string} str The string need to be identified
          * @returns True if the string is numeric; false otherwise
          */
        public setInfoTextAndButton(text: string, textColor: string, buttonEnable: boolean) {
            this.infoText.text(text);
            this.infoText.css("color", textColor);
            if (buttonEnable) {
                DataViz.Utils.setTabFocus("binding-pane", "binding-pane-cancel", "binding-pane-ok");
                if (this.buttonOk.attr("disabled")) {
                    this.buttonOk.removeAttr("disabled");
                }
            }
            else {
                DataViz.Utils.setTabFocus("binding-pane", "binding-pane-cancel", "binding-pane-cancel");
                if (!this.buttonOk.attr("disabled")) {
                    this.buttonOk.attr("disabled", "disabled");
                }
            }
        }

        public get bindingData(): any {
            return this.selectedData;
        }

        public set bindingData(data: any) {
            this.selectedData = data;
        }

        public handleDataSelection() {
            // Implemented in sub-classes
        }

        private updateArgs(args: BindingPaneArgs) {
            this.args.sampleData = args.sampleData ? args.sampleData : BindingPane.defaultArgs.sampleData;
            this.args.handleDataSelection = args.handleDataSelection ? args.handleDataSelection : BindingPane.defaultArgs.handleDataSelection;
            this.args.buttonOKCallback = args.buttonOKCallback ? args.buttonOKCallback : BindingPane.defaultArgs.buttonOKCallback;
            this.args.buttonCancelCallback = args.buttonCancelCallback ? args.buttonCancelCallback : BindingPane.defaultArgs.buttonCancelCallback;
            this.args.title = args.title ? args.title : BindingPane.defaultArgs.title;
            this.args.subtitle = args.subtitle ? args.subtitle : BindingPane.defaultArgs.subtitle;
            this.args.infoText = args.infoText ? args.infoText : BindingPane.defaultArgs.infoText;
            this.args.buttonOKText = args.buttonOKText ? args.buttonOKText : BindingPane.defaultArgs.buttonOKText;
            this.args.buttonCancelText = args.buttonCancelText ? args.buttonCancelText : BindingPane.defaultArgs.buttonCancelText;
        }

        private handleArgs() {
            this.setSampleData(this.args.sampleData);
            this.titleSpan.text(this.args.title);
            this.subtitle.text(this.args.subtitle);
            this.infoText.text(this.args.infoText);
            this.buttonOk.text(this.args.buttonOKText);
            this.buttonCancel.text(this.args.buttonCancelText);

            if (this.args.handleDataSelection) {
                this.selectionChangeHandler = () => {
                    this.args.handleDataSelection();
                };
            }
            else {
                this.selectionChangeHandler = null;
            }

            this.setEventHandler(this.args.buttonOKCallback, this.args.buttonCancelCallback);
        }

        private setEventHandler(funcOK?: any, funcCancel?: any) {
            this.buttonOk.off("click");
            this.buttonOk.click(() => {
                this.hide();

                if (funcOK) {
                    funcOK(this.bindingData);
                }
            });

            this.buttonCancel.off("click");
            this.buttonCancel.click(() => {
                this.hide();
            });
        }

        private setSampleData(sampleData?: string[][]) {
            if ($("#sample-table")[0]) {
                $("#sample-table").remove();
            }

            if (sampleData) {
                this.sampleDataPane.append($("<table/>", { id: "sample-table" }));
                var rowNumber = Math.min(sampleData.length, BindingPane.sampleDataMaxRowNumber);
                for (var i = 0; i < rowNumber; i++) {
                    $("<tr/>", { id: "tr" + i }).appendTo("#sample-table");
                    for (var j = 0; j < sampleData[0].length; j++) {
                        $("<td/>", { text: sampleData[i][j] }).appendTo("#tr" + i);
                    }
                }

                this.td = $("td");
            }
        }

        private resetPaneContentPosition() {
            this.zoomBindingPane();
            this.bindingPane.css("top", (window.innerHeight - this.bindingPane.height()) / 2);
        }

        private handleStyleInHDPI(elementId: string, classNameArray: string[]): void {
            if (!classNameArray) {
                return;
            }

            var elementStyle = {};
            for (var i = 0; i < classNameArray.length; i++) {
                var styleArray: any[][] = BindingPane.bindingPaneStyle[classNameArray[i]];
                if (!styleArray || !styleArray[0]) {
                    return;
                }

                for (var j = 0; j < styleArray.length; j++) {
                    if (styleArray[j] && styleArray[j][0] && styleArray[j][1]) {
                        elementStyle[styleArray[j][0]] = (parseFloat(styleArray[j][1]) / this.zoomRatio).toFixed(2) + "px";
                    }
                }

                this.bindingPaneElementsStyle[elementId] = elementStyle;
            }
        }
    }

    export interface BindingPaneArgs {
        sampleData?: any;
        handleDataSelection?: any;
        buttonOKCallback?: any;
        buttonCancelCallback?: any;
        title?: any;
        subtitle?: any;
        infoText?: any;
        buttonOKText?: any;
        buttonCancelText?: any;
    }
}