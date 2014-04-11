/* **************************************************************************************
Copyright (c), Microsoft Open Technologies, Inc.
All rights reserved.

Except for the third party material listed below, this code is licensed to you under the BSD 2-Clause License.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Third Party Notices

This code incorporates trademarks and logos of the Wikimedia Foundation (the "Wikimedia Marks").  The Wikimedia Marks are used by Microsoft with permission from the Wikimedia Foundation.  You must obtain permission from the Wikimedia Foundation if you wish to use the Wikimedia Marks.

***************************************************************************************** */

$(document).ready(function () {
    // Assign click listener to ellipses, ellipses reveals spillover menu
    $(".tabGroup .ellipses").click(function () {
        $(Selectors.tabMenu).show();
        GlobalVars.tabMenuOpen = true;
    });

    $(".tabGroup .ellipses").keydown(function (e) {
        if (e.keyCode === 13) {
            $(Selectors.tabMenu).show();
            GlobalVars.tabMenuOpen = true;
        }
    });

    GlobalVars.lastInnerWidth = GlobalVars.currInnerWidth;

    // If someone clicks on the ellipses and selects an option, the menu should close
    $(".tabMenu > div").click(function () {
        $(Selectors.tabMenu).hide();
        GlobalVars.tabMenuOpen = false;
    });
});

// Tabs are updated when window is resized
$(window).resize(function () {
    // If the window is being resized to be bigger while there are ellipses or if the tab group is too wide for the panel
    if ((GlobalVars.lastInnerWidth < GlobalVars.currInnerWidth && $(Selectors.ellipsesClass).is(":visible")) ||
        $(Selectors.tabGroup).width() > $("window").width()) {
        updateTabs();
    }
});


// Determines which tabs and menu options to show depending on width of containing element
function updateTabs() {
    var maxWidth = $(Selectors.tabGroup).width() - $(Selectors.ellipses).width();
    var combinedWidth = 0;

    $(".tabGroup .tab").each(function (index) {
        combinedWidth = combinedWidth + $(this).width();
        if (combinedWidth >= maxWidth) {
            $(this).hide();
            $(".tabMenu .options div:eq(" + index + ")").show();
        } else {
            $(this).show();
            $(".tabMenu .options div:eq(" + index + ")").hide();
        }

    });

    if (combinedWidth <= maxWidth) {
        $(Selectors.ellipses).hide();
        if ($(Selectors.tabMenu).is(":visible")) {
            $(Selectors.tabMenu).hide();
            GlobalVars.tabMenuOpen = false;
        }
    } else {
        $(Selectors.ellipses).show();
        GlobalVars.tabMenuOpen = true;
    }

    // Get window size
    GlobalVars.lastInnerWidth = GlobalVars.currInnerWidth;
}
