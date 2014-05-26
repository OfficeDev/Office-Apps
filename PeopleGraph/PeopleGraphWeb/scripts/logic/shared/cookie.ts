/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

/**
  * This module contains the cookie implementation
  */
module DataViz.Cookie {
    /**
      * check if there already exists this cookie.
      */
    export function checkCookie(cookieName: string): boolean {
        if (document.cookie.indexOf(cookieName) !== -1) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
      * set the cookie.
      */
    export function setCookie(cookieName: string, cookieValue: string, effectiveTime: number = 365) {
        var today = new Date();
        var endDay = new Date();
        endDay.setDate(today.getDate() + effectiveTime);
        document.cookie = cookieName + "=" + cookieValue + "; expires=" + endDay.toUTCString();
    }
}