/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="BaseNotification.ts"/>
///<reference path="../logic/shared/cookie.ts"/>

module DataViz.UX {
    /**
    * This class is the Notification UI class. 
    */
    export class Notification extends DataViz.UX.BaseNotification {
        //time count
        private timeCounter: any;
        private timeDisplay: number;
        private timeDisapper: number;

        /**
          * Constructor
          */
        constructor() {
            super();
            this.Panel.hide();
        }

        /**
          * Set the panel's display time.
          * @param {number} timeOut The time the display can last if you don't hover it.
          * @param {number} timeDisapper The time the display can last after you hover the panel.
          */
        public setDisplayTime(timeOut: number = 3000, timeDisapper: number = 3000) {
            this.timeDisplay = timeOut;
            this.timeDisapper = timeDisapper;
        }

        /**
          * Show the notification UI.
          */
        public show() {
            super.show();
            clearTimeout(this.timeCounter);
            this.timeCounter = setTimeout(() => { this.hide() }, this.timeDisplay);
        }

        /**
          * Hide the notification panel.
          */
        public hide() {
            this.Panel.animate({ top: window.innerHeight }, "fast", () => {
                this.Panel.hide();
                this.Button.hide();
                this.Close.show();
                this.Panel.off("mouseenter");
                this.Panel.off("mouseleave");
                clearTimeout(this.timeCounter);
            });
        }

        /**
          * This method is taken as a protected method.
          */
        public setDefaultConfiguration() {
            this.Close.hide();
            this.setDisplayTime();
            this.Panel.mouseenter(() => {
                clearTimeout(this.timeCounter);
                this.Close.show();
            });
            this.Panel.mouseleave(() => {
                this.timeCounter = setTimeout(() => { this.hide() }, this.timeDisapper);
            });
            this.Close.off("click");
            this.Close.click(() => {
                this.hide();
            });
        }
    }

    /**
      * This class is the notification UI with a never show button on it. Such kind of class is always used.
      */
    export class NotificationWithNeverShowBtn extends Notification {
        private dontShowAgainKey: string;
        private dontShowAgainValue: string = "NeverShowAgain";
        private static instance: NotificationWithNeverShowBtn;

        /**
          * Get the single instance.
          */
        public static getInstance(): NotificationWithNeverShowBtn {
            if (!NotificationWithNeverShowBtn.instance) {
                NotificationWithNeverShowBtn.instance = new NotificationWithNeverShowBtn();
            }

            NotificationWithNeverShowBtn.instance.setDefaultConfiguration();
            NotificationWithNeverShowBtn.instance.setNeverShwoBtn();

            return NotificationWithNeverShowBtn.instance;
        }

        /**
          * Constructor.
          */
        constructor() {
            super();
        }

        /**
          * Set the key for cookie.
          */
        public setKey(dontShowAgainKey: string): NotificationWithNeverShowBtn {
            this.dontShowAgainKey = dontShowAgainKey;
            return this;
        }

        /**
          * Show the UI.
          */
        public show() {
            if (DataViz.Utils.isOnWac()) {
                if (window.localStorage.getItem(this.dontShowAgainKey) !== this.dontShowAgainValue) {
                    super.show();
                }
            }
            else {
                if (!DataViz.Cookie.checkCookie(this.dontShowAgainKey)) {
                    super.show();
                }
            }
        }

        private setNeverShwoBtn() {
            this.setButton(DataViz.Resources.Notification.dontShowAgain, () => {
                if (DataViz.Utils.isOnWac()) {
                    window.localStorage.setItem(this.dontShowAgainKey, this.dontShowAgainValue);
                }
                else {
                    DataViz.Cookie.setCookie(this.dontShowAgainKey, this.dontShowAgainValue);
                }

                this.hide();
            });
        }
    }
}