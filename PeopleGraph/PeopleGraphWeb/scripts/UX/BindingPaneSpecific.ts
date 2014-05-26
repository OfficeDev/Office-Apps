/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="shared/BindingPane.ts"/>
///<reference path="../logic/configurator.agave.ts"/>
///<reference path="../strings/stringadapter.ts"/>

declare var $: any;
declare var Office: any;

module DataViz.UX {
    export class BindingPaneSpecific extends BindingPane {
        private static instance: BindingPaneSpecific;

        /**
          * Get the singleton instance.
          */
        public static getInstance(): BindingPaneSpecific {
            if (!BindingPaneSpecific.instance) {
                BindingPaneSpecific.instance = new BindingPaneSpecific();
            }

            return BindingPaneSpecific.instance;
        }

        public handleDataSelection() {
            Office.context.document.getSelectedDataAsync(
                Office.CoercionType.Matrix,
                { valueFormat: Office.ValueFormat.Unformatted, filterType: Office.FilterType.OnlyVisible },
                (result: any) => {
                    if (result.status === Office.AsyncResultStatus.Succeeded) {
                        this.bindingData = result.value;

                        if (result.value[0].length < 2) {
                            this.setInfoTextAndButton(DataViz.Resources.BindingPane.infoSelectTwoColumns, DataViz.UX.infoColors.red, false);
                        }
                        else if (!this.isFirstColumnNonEmpty(result.value)) {
                            this.setInfoTextAndButton(DataViz.Resources.BindingPane.infoFirstColumnEmpty, DataViz.UX.infoColors.red, false);
                        }
                        else if (!this.isSecondColumnHasNumber(result.value)) {
                            this.setInfoTextAndButton(DataViz.Resources.BindingPane.infoSecondColumnContainNumber, DataViz.UX.infoColors.red, false);
                        }
                        else if (!this.isFirstRowNonEmpty(result.value)) {
                            this.setInfoTextAndButton(DataViz.Resources.BindingPane.infoFirstRowEmpty, DataViz.UX.infoColors.red, false);
                        }
                        else {
                            var rowCount = result.value.length;
                            var columnCount = result.value[0].length;
                            var rowString = this.getPluralString(DataViz.Resources.Pluralization.rows, rowCount);
                            var columnString = this.getPluralString(DataViz.Resources.Pluralization.columns, columnCount);
                            var maxRowString = this.getPluralString(DataViz.Resources.Pluralization.rows, DataViz.Config.Agave.MaxRowNumber);
                            var maxColumnString = this.getPluralString(DataViz.Resources.Pluralization.columns, DataViz.Config.Agave.MaxColumnNumber);

                            var infoString = "";
                            if (rowCount > DataViz.Config.Agave.MaxRowNumber && columnCount > DataViz.Config.Agave.MaxColumnNumber) {
                                infoString = DataViz.Utils.stringFormat(DataViz.Resources.BindingPane.infoMaxRowAndColumn,
                                    rowCount,
                                    rowString,
                                    columnCount,
                                    columnString,
                                    DataViz.Config.Agave.MaxRowNumber,
                                    maxRowString,
                                    DataViz.Config.Agave.MaxColumnNumber,
                                    maxColumnString);
                            }
                            else if (rowCount > DataViz.Config.Agave.MaxRowNumber && columnCount <= DataViz.Config.Agave.MaxColumnNumber) {
                                infoString = DataViz.Utils.stringFormat(DataViz.Resources.BindingPane.infoMaxRow,
                                    rowCount,
                                    rowString,
                                    columnCount,
                                    columnString,
                                    DataViz.Config.Agave.MaxRowNumber,
                                    maxRowString);
                            }
                            else if (rowCount <= DataViz.Config.Agave.MaxRowNumber && columnCount > DataViz.Config.Agave.MaxColumnNumber) {
                                infoString = DataViz.Utils.stringFormat(DataViz.Resources.BindingPane.infoMaxColumn,
                                    rowCount,
                                    rowString,
                                    columnCount,
                                    columnString,
                                    DataViz.Config.Agave.MaxColumnNumber,
                                    maxColumnString);
                            }
                            else {
                                infoString = DataViz.Utils.stringFormat(DataViz.Resources.BindingPane.infoNormal,
                                    rowCount,
                                    rowString,
                                    columnCount,
                                    columnString);
                            }

                            this.setInfoTextAndButton(infoString, DataViz.UX.infoColors.green, true);
                        }
                    }
                    // "1008" is the error code for "Data Read Error"
                    else if (result.error.code === 1008) {
                        this.setInfoTextAndButton(DataViz.Resources.BindingPane.infoDataSetTooLarge, DataViz.UX.infoColors.red, false);
                    }
                    else {
                        this.setInfoTextAndButton(DataViz.Resources.BindingPane.infoSelectData, DataViz.UX.infoColors.red, false);
                    }
                }
                );
        }

        private isFirstColumnNonEmpty(value: any[][]): boolean {
            if (!value) {
                return false;
            }

            for (var i = 0; i < value.length; i++) {
                if (value[i] && this.isDataValid(value[i][0])) {
                    return true;
                }
            }

            return false;
        }

        private isSecondColumnHasNumber(value: any[][]): boolean {
            if (!value) {
                return false;
            }

            for (var i = 0; i < value.length; i++) {
                if (value[i] && this.isDataValid(value[i][1]) && !isNaN(parseFloat(value[i][1]))) {
                    return true;
                }
            }

            return false;
        }

        private isFirstRowNonEmpty(value: any[][]): boolean {
            if (!value || !value[0]) {
                return false;
            }

            for (var i = 0; i < value[0].length; i++) {
                if (this.isDataValid(value[0][i])) {
                    return true;
                }
            }

            return false;
        }

        private isDataValid(data: any) {
            return (data !== null) && (data !== undefined) && (data.toString().trim() !== "");
        }

        //This method is for en-us culture only.
        private getPluralString(combinedStr: string, count: number) {
            var pluralStringArray: string[] = combinedStr.split("||");
            if (pluralStringArray.length !== 2) {
                throw "Error: Provided string variations do not match expected amount";
            }

            return count === 1 ? pluralStringArray[0] : pluralStringArray[1];
        }
    }
}