/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

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
        
        public static get defaultLegendName(): string {
            return ScriptsResources.DefaultLegendName;
        }
    }

    export class DataPane {
        public static get header(): string {
            return ScriptsResources.DataPaneHeader;
        }

        public static get selectButtonText(): string {
            return ScriptsResources.DataPaneSelectButton;
        }
    }

    export class SettingPane {
        public static get header(): string {
            return ScriptsResources.SettingPaneHeader;
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
            ];
        }
    }

    export class SampleData {
        public static get title(): string {
            return ScriptsResources.SampleDataTitle;
        }

        public static get shortDescriptionTitle(): string {
            return ScriptsResources.SampleDataShortDescriptionTitle;
        }

        public static get shortDescription(): string {
            return ScriptsResources.SampleDataShortDescription;
        }

        public static get longDescriptionTitle(): string {
            return ScriptsResources.SampleDataLongDescriptionTitle;
        }

        public static get longDescription(): string {
            return ScriptsResources.SampleDataLongDescription;
        }

        public static get legend1(): string {
            return ScriptsResources.SampleDataLegend1;
        }

        public static get legend2(): string {
            return ScriptsResources.SampleDataLegend2;
        }

        public static get time1(): string {
            return ScriptsResources.SampleDataTime1;
        }

        public static get time2(): string {
            return ScriptsResources.SampleDataTime2;
        }

        public static get time3(): string {
            return ScriptsResources.SampleDataTime3;
        }

        public static get time4(): string {
            return ScriptsResources.SampleDataTime4;
        }

        public static get time5(): string {
            return ScriptsResources.SampleDataTime5;
        }

        public static get time6(): string {
            return ScriptsResources.SampleDataTime6;
        }

        public static get time7(): string {
            return ScriptsResources.SampleDataTime7;
        }

        public static get time8(): string {
            return ScriptsResources.SampleDataTime8;
        }

        public static get time9(): string {
            return ScriptsResources.SampleDataTime9;
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
            return ScriptsResources.BindingPaneButtonOK;
        }

        public static get buttonCancelText(): string {
            return ScriptsResources.BindingPaneButtonCancel;
        }

        public static get sampleDataHeader1(): string {
            return ScriptsResources.BindingPaneSampleDataHeader1;
        }

        public static get sampleDataHeader2(): string {
            return ScriptsResources.BindingPaneSampleDataHeader2;
        }

        public static get sampleDataHeader3(): string {
            return ScriptsResources.BindingPaneSampleDataHeader3;
        }

        public static get sampleDataTime1(): string {
            return ScriptsResources.BindingPaneSampleDataTime1;
        }

        public static get sampleDataTime2(): string {
            return ScriptsResources.BindingPaneSampleDataTime2;
        }

        public static get sampleDataTime3(): string {
            return ScriptsResources.BindingPaneSampleDataTime3;
        }
    }
}