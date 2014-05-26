/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

declare var ScriptsResources: any;

module DataViz.Resources {
    "use strict";

    export class UI {
        public static get backButtonTitle(): string {
            return ScriptsResources.BackButtonTitle;
        }

        public static get floatMenuDataTitle(): string {
            return ScriptsResources.FloatMenuDataTitle;
        }

        public static get floatMenuSettingTitle(): string {
            return ScriptsResources.FloatMenuSettingTitle;
        }

        public static get editTitle(): string {
            return ScriptsResources.EditTitle;
        }
    }

    export class DataPane {
        public static get header(): string {
            return ScriptsResources.DataPaneHeader;
        }

        public static get selectButtonText(): string {
            return ScriptsResources.DataPaneSelectButton;
        }

        public static get editTitleLabel(): string {
            return ScriptsResources.DataPaneEditTitleLabel;
        }
    }

    export class SettingPane {
        public static get header(): string {
            return ScriptsResources.SettingPaneHeader;
        }

        public static get typeTab(): string {
            return ScriptsResources.SettingPaneTypeTab;
        }

        public static get typeTitles(): string[] {
            return [
                ScriptsResources.SettingPaneTypeGaintTitle,
                ScriptsResources.SettingPaneTypeCalloutTitle,
                ScriptsResources.SettingPaneTypeClassicTitle,
            ];
        }

        public static get themeTab(): string  {
            return ScriptsResources.SettingPaneThemeTab;
        }

        public static get themeTitles(): string[] {
            return [
                ScriptsResources.SettingPaneThemeTitle1,
                ScriptsResources.SettingPaneThemeTitle2,
                ScriptsResources.SettingPaneThemeTitle3,
                ScriptsResources.SettingPaneThemeTitle4,
                ScriptsResources.SettingPaneThemeTitle5,
                ScriptsResources.SettingPaneThemeTitle6,
                ScriptsResources.SettingPaneThemeTitle7,
            ];
        }

        public static get shapeTab(): string {
            return ScriptsResources.SettingPaneShapeTab;
        }

        public static get shapeTitles(): string[] {
            return [
                ScriptsResources.SettingPaneShapeTitle1,
                ScriptsResources.SettingPaneShapeTitle2,
                ScriptsResources.SettingPaneShapeTitle3,
                ScriptsResources.SettingPaneShapeTitle4,
                ScriptsResources.SettingPaneShapeTitle5,
                ScriptsResources.SettingPaneShapeTitle6,
                ScriptsResources.SettingPaneShapeTitle7,
                ScriptsResources.SettingPaneShapeTitle8,
                ScriptsResources.SettingPaneShapeTitle9,
                ScriptsResources.SettingPaneShapeTitle10,
                ScriptsResources.SettingPaneShapeTitle11,
                ScriptsResources.SettingPaneShapeTitle12,
                ScriptsResources.SettingPaneShapeTitle13,
                ScriptsResources.SettingPaneShapeTitle14,
                ScriptsResources.SettingPaneShapeTitle15,
                ScriptsResources.SettingPaneShapeTitle16,
            ];
        }
    }

    export class Notification {
        public static get dontShowAgain(): string {
            return ScriptsResources.NotificationDontShowAgainButton;
        }

        public static get extendAppToShowMore(): string {
            return ScriptsResources.NotificationExtendAppToShowMore;
        }
    }

    export class SampleDataGaint {
        public static get title(): string {
            return ScriptsResources.SampleDataGaintTitle;
        }

        public static get row1(): string {
            return ScriptsResources.SampleDataGaintRow1;
        }

        public static get row2(): string {
            return ScriptsResources.SampleDataGaintRow2;
        }

        public static get row3(): string {
            return ScriptsResources.SampleDataGaintRow3;
        }
    }

    export class SampleDataCallout {
        public static get title(): string {
            return ScriptsResources.SampleDataCalloutTitle;
        }

        public static get row1(): string {
            return ScriptsResources.SampleDataCalloutRow1;
        }

        public static get row2(): string {
            return ScriptsResources.SampleDataCalloutRow2;
        }

        public static get row3(): string {
            return ScriptsResources.SampleDataCalloutRow3;
        }
    }

    export class SampleDataClassic {
        public static get title(): string {
            return ScriptsResources.SampleDataClassicTitle;
        }

        public static get row1(): string {
            return ScriptsResources.SampleDataClassicRow1;
        }

        public static get row2(): string {
            return ScriptsResources.SampleDataClassicRow2;
        }

        public static get row3(): string {
            return ScriptsResources.SampleDataClassicRow3;
        }
    }

    export class Pluralization {
        public static get rows(): string {
            return ScriptsResources.PluralizationRows;
        }

        public static get columns(): string {
            return ScriptsResources.PluralizationColumns;
        }
    }

    export class BindingPane {
        public static get infoNormal(): string {
            return ScriptsResources.BindingPaneInfoNormal;
        }

        public static get infoMaxRow(): string {
            return ScriptsResources.BindingPaneInfoMaxRow;
        }

        public static get infoMaxColumn(): string {
            return ScriptsResources.BindingPaneInfoMaxColumn;
        }

        public static get infoMaxRowAndColumn(): string {
            return ScriptsResources.BindingPaneInfoMaxRowAndColumn;
        }

        public static get infoDataSetTooLarge(): string {
            return ScriptsResources.BindingPaneInfoDataSetTooLarge;
        }

        public static get infoFirstRowEmpty(): string {
            return ScriptsResources.BindingPaneInfoFirstRowEmpty;
        }

        public static get infoFirstColumnEmpty(): string {
            return ScriptsResources.BindingPaneInfoFirstColumnEmpty;
        }

        public static get infoSelectData(): string {
            return ScriptsResources.BindingPaneInfoSelectData;
        }

        public static get infoSelectTwoColumns(): string {
            return ScriptsResources.BindingPaneInfoSelectTwoColumns;
        }

        public static get infoSecondColumnContainNumber(): string {
            return ScriptsResources.BindingPaneInfoSecondColumnContainNumber;
        }

        public static get title(): string {
            return ScriptsResources.BindingPaneTitle;
        }

        public static get subtitle(): string {
            return ScriptsResources.BindingPaneSubtitle;
        }

        public static get buttonOKText(): string {
            return ScriptsResources.BindingPaneOKButton;
        }

        public static get buttonCancelText(): string {
            return ScriptsResources.BindingPaneCancelButton;
        }
    }
}