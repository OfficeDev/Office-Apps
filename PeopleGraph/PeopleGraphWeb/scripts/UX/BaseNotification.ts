/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

declare var $: any;

module DataViz.UX {
    /**
      * This class is the base class for notification and warning UI.
      */
    export class BaseNotification {
        private static textInnerHeight: number = 16;
        //translate jQuery
        private messageText: any;
        private notificationButton: any;
        private closeButton: any;
        private notificationPanel: any;

        /**
          * Constructor
          */
        constructor() {
            if ($("#notification").length === 0) {
                var content = '<div id = "notification" class = "notification-style" >' +
                    '<p id="notification-text" class = "notification-text" > </p>' +
                    '<div id="notification-close" class="notification-close" />' +
                    '<button id="notification-button" class = "notification-button button-green" ></button>' +
                    '</div >';
                $('body').append(content);
            }
            this.messageText = $("#notification-text");
            this.notificationButton = $("#notification-button");
            this.closeButton = $("#notification-close");
            this.notificationPanel = $("#notification");

            this.notificationPanel.css({ "top": window.innerHeight });

            $(window).bind("resize", () => {
                this.resizePanel();
            });
        }

        /**
          * Set a button for the panel. By default there exists no button on the panel.
          */
        public setButton(text: string, func?: any): BaseNotification {
            this.notificationButton.text(text);
            this.setEventHandler(func);
            this.notificationButton.show();
            return this;
        }

        /**
          * Set the message for the panel.
          */
        public setText(text: string): BaseNotification {
            this.messageText.text(text);
            return this;
        }

        /**
          * Show the panel.
          */
        public show() {
            this.notificationPanel.show();
            this.setHeight();
            this.notificationPanel.animate({ top: window.innerHeight }, 150);
            this.notificationPanel.animate({ top: window.innerHeight - this.notificationPanel.outerHeight() }, 50);
        }

        /**
          * This ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * Button get method.
          */
        public get Button(): any {
            return this.notificationButton;
        }

        /**
          * This ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * CloseButton get method.
          */
        public get Close(): any {
            return this.closeButton;
        }

        /**
          * This ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * Message text get method.
          */
        public get Text(): any {
            return this.messageText;
        }

        /**
          * This ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * Panel get method.
          */
        public get Panel(): any {
            return this.notificationPanel;
        }

        /**
          * This ought to be "protected" but unfortunately TypeScript does not support "protected" memebers by now.
          * Set the panel Height. Dynamically changed by resizing window.
          */
        public setHeight() {
            if (this.notificationButton.css("display") != "none") {
                var textBottom: number = this.messageText.position().top + this.messageText.height();
                var buttonTop: number = this.notificationButton.position().top;
                if (buttonTop > textBottom) {
                    this.closeButton.css({ top: 10 });
                    this.messageText.css({ "margin-bottom": "4px" });
                    this.notificationButton.css({ "margin-bottom": "27px", "right": "11px" });
                }
                else {
                    this.closeButton.css({ top: 19 });
                    this.messageText.css({ "margin-bottom": "20px" });
                    this.notificationButton.css({ "margin-bottom": "0", "right": "30px" });
                }
            }
            else {
                if (this.messageText.innerHeight() > BaseNotification.textInnerHeight)
                    this.closeButton.css({ top: 10 });
                else
                    this.closeButton.css({ top: 19 });
                this.messageText.css({ "margin-bottom": "20px" });
            }
        }

        private setEventHandler(func: any) {
            if (func) {
                this.notificationButton.off("click");
                this.notificationButton.click(() => {
                    func();
                });
            }
        }

        private resizePanel() {
            if (this.notificationPanel.css("display") != "none")
                this.notificationPanel.css({ "top": window.innerHeight - this.notificationPanel.outerHeight() });
                this.setHeight();
        }
    }
}