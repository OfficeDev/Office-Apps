/* **************************************************************************************
Copyright © Microsoft Open Technologies, Inc.

All Rights Reserved

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at 

http://www.apache.org/licenses/LICENSE-2.0 

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABLITY OR NON-INFRINGEMENT. 

See the Apache 2 License for the specific language governing permissions and limitations under the License.

***************************************************************************************** */

///<reference path="../../logic/shared/config.ts"/>
///<reference path="../../logic/shared/skus.ts"/>
///<reference path="../../logic/shared/decoration.ts"/>
///<reference path="../../app.ts"/>

declare var $: any;

/**
  * This modules contains the implementation of the galleries
  */
module DataViz.UX.Shared {
    /**
      * This defines the basic styles of a thumbnail icon in the gallery 
      */
    export interface IconStyle {
        /**
          * The left margin
          */
        marginLeft: number;

        /**
          * The top margin
          */
        marginTop: number;

        /**
          * The width
          */
        width: number;

        /**
          * The height
          */
        height: number;
    }

    /**
      * The base class of all the gallery classes
      */
    export class BaseGallery implements Config.IConfigurationChangeListener {
        /* protected */ public icons: Decoration.Customizable[];
        /* protected */ public currentIconId: string;

        private parentId: string;
        private reentryFlag: boolean;
        private iconStyle: IconStyle;
        private configurationKey: string;

        constructor(parentId: string, iconStyle: IconStyle, configurationKey: string) {
            this.parentId = parentId;
            this.iconStyle = iconStyle;
            this.configurationKey = configurationKey;
            this.reentryFlag = false;
        }

        /**
          * Sets up the listeners
          */
        public setupListener() {
            DataViz.mainApp.Configuration.registerListener(this);
        }

        /**
          * Populates the gallery
          */
        public populate(iconNames: string[]) {
            this.refreshList();

            var currentWidth = 0;
            var marginTopFromParent = this.iconStyle.marginTop;

            $("#" + this.parentId + " > img").remove();

            for (var index = 0; index < this.icons.length; index++) {
                var nextWidth = currentWidth + this.iconStyle.marginLeft + this.iconStyle.width;
                if (nextWidth > 210) {
                    if (currentWidth > 0) {
                        currentWidth = 0;
                        nextWidth = currentWidth + this.iconStyle.marginLeft + this.iconStyle.width;
                        marginTopFromParent = marginTopFromParent + this.iconStyle.marginTop + this.iconStyle.height;
                    }
                }

                var marginLeftFromParent = currentWidth + this.iconStyle.marginLeft;
                $("#" + this.parentId).append("<img id=" + this.icons[index].id + " src=" + this.icons[index].thumbnail
                    + " style= 'width:" + this.iconStyle.width + "px; height:" + this.iconStyle.height + "px; margin-left:"
                    + marginLeftFromParent + "px; margin-top:" + marginTopFromParent + "px; cursor: pointer; position:absolute'; class ='gallery-item';"
                    + "alt='" + iconNames[index] + "' title='" + iconNames[index] + "' tabindex='1';/>");
                currentWidth = nextWidth;

                this.setIconClickListener(this.icons[index].id, index);
            }

            this.updatePaneBorder(this.currentIconId);
        }

        /**
          * Refreshes the list of the backed customizable items
          * This ought to be "protected" but unfortunately TypeScript doesn't support "protected" members when the source code is published.
         */
        public refreshList() {
            // Implement in sub-classes
        }

        /**
          * Implementing {@link IConfigurationChangeListener#onConfigurationChanged}
          */
        public onConfigurationChanged(key: string, value: any) {
            if ((key === this.configurationKey) && !this.reentryFlag) {
                this.currentIconId = <string>value;
            }
        }

        private updatePaneBorder(iconId: string) {
            for (var index = 0; index < this.icons.length; index++) {
                if (this.icons[index].id === iconId) {
                    $("#" + this.icons[index].id).removeClass("gallery-item");
                    $("#" + this.icons[index].id).addClass("gallery-item-click");
                }
                else {
                    $("#" + this.icons[index].id).removeClass("gallery-item-click");
                    $("#" + this.icons[index].id).addClass("gallery-item");
                }
            }
        }

        private setIconClickListener(iconId: string, index: number) {
            $("#" + iconId).off("click");
            $("#" + iconId)
                    .data("iconIndex", index)
                    .click((event: any) => {
                        this.iconClickAction(event, index)
                    })
                    .keydown((event: any) => {
                        if (event.which === 13) {
                            this.iconClickAction(event, index);
                        } // Check the enter key.
                          // Todo: We should have a keymap in the common code.
                    });
        }

        private iconClickAction(event: any, index: number) {
            var iconIndex: string = $(event.target).data("iconIndex");
            var iconId = this.icons[iconIndex].id;
            this.updatePaneBorder(iconId);
            this.apply(iconId);
        }

        private apply(iconId: string) {
            this.reentryFlag = true;
            DataViz.mainApp.Configuration.set(this.configurationKey, iconId);
            this.reentryFlag = false;
        }
    }

    /**
      * The theme gallery
      */
    export class ThemeGallery extends UX.Shared.BaseGallery {
        /**
          * Builds and returns a theme gallery instance
          * @returns {ThemeGallery} A theme gallery instance
          */
        public static build(): ThemeGallery {
            return new ThemeGallery("theme-pane", { marginLeft: 10, marginTop: 10, width: 90, height: 40 }, Config.wellKnownKeys.theme);
        }

        /* private */ constructor(parentId: string, iconStyle: IconStyle, configurationKey: string) {
            super(parentId, iconStyle, configurationKey);
        }

        /**
          * Overriding {@link BaseGallery#refreshList}
          */
        public refreshList() {
            this.icons = Decoration.ThemeProvider.Instance.enumerateForSku(SKUs.SKUProvider.Instance.CurrentSKUId)
            this.currentIconId = Decoration.ThemeProvider.Instance.CurrentThemeId;
        }
    }

    /**
      * The shape gallery
      */
    export class ShapeGallery extends UX.Shared.BaseGallery {
        /**
          * Builds and returns a shape gallery instance
          * @returns {ShapeGallery} A shape gallery instance
          */
        public static build(): ShapeGallery {
            return new ShapeGallery("shape-pane", { marginLeft: 10, marginTop: 10, width: 40, height: 40 }, Config.wellKnownKeys.shape);
        }

        /* private */ constructor(parentId: string, iconStyle: IconStyle, configurationKey: string) {
            super(parentId, iconStyle, configurationKey);
        }

        /**
          * Overriding {@link BaseGallery#refreshList}
          */
        public refreshList() {
            this.icons = Decoration.ShapeProvider.Instance.enumerateForSku(SKUs.SKUProvider.Instance.CurrentSKUId);
            this.currentIconId = Decoration.ShapeProvider.Instance.CurrentShapeId;
        }
    }

    /**
      * The chart type (SKU) gallery
      */
    export class TypeGallery extends UX.Shared.BaseGallery {
        /**
          * Builds and returns a chart type (SKU) gallery instance
          * @returns {TypeGallery} A chart type gallery instance
          */
        public static build(): TypeGallery {
            return new TypeGallery("type-pane", { marginLeft: 10, marginTop: 10, width: 190, height: 80 }, Config.wellKnownKeys.sku);
        }

        /* private */ constructor(parentId: string, iconStyle: IconStyle, configurationKey: string) {
            super(parentId, iconStyle, configurationKey);
        }

        /**
          * Overriding {@link BaseGallery#refreshList}
          */
        public refreshList() {
            this.icons = SKUs.SKUProvider.Instance.SKUs;
            this.currentIconId = SKUs.SKUProvider.Instance.CurrentSKUId;
        }
    }
}