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

// Utility functions for string handling
var StrUtil = {
    empty: "",

    trimWhiteSpace: function (str) {
        return str.replace(/^\s+|\s+$/g, "");
    },

    replaceDoubleBackSlashWithHTTPS: function (str) {
        if (str && str.replace) {
            return str.replace(/src="\/\//g, "src=\"https://").replace(/href="\/\//g, "href=\"https://");
        } else {
            return str;
        }
    },

    parseIDFromUrl: function (url) {
        return url.replace(/\/wiki\//g, StrUtil.empty).replace(/_/g, " ");
    },

    parseImageTitleFromUrl: function (url) {
        var lastSlashPosition = url.lastIndexOf("/");
        var secondLastSlashPosition = url.lastIndexOf("/", lastSlashPosition - 1);
        var title = url.substring(secondLastSlashPosition + 1, lastSlashPosition);

        if (title.length === 2) {
            title = url.substring(lastSlashPosition + 1);
        }

        return "File:" + title.replace(/_/g, " ");
    },

    //  Handle the non-ANSI characters to follow ANSI compliance
    encodeTextWithHTMLEntities: function (text) {
        var encodedText = "";
        var encodedArray = [];
        var len = text.length;

        for (var i = 0; i < len; i++) {
            if (text.charAt(i).charCodeAt(0) > 127) {
                encodedText = "&#" + text.charAt(i).charCodeAt(0) + ";";
            }
            else {
                encodedText = text.charAt(i);
            }
            encodedArray.push(encodedText);
        }

        return encodedArray.join("");
    }
};

// These functions construct html content for the app
var CodeSnippet = {
    // The inserted image and source html content
    insertedImage: function (src, fileName, detailPage) {
        var imageDiv = document.createElement("div");
        var image = document.createElement("img");
        var sourceDir = document.createElement("div");
        var source = document.createElement("i");
        var sourceLink = document.createElement("a");

        image.setAttribute("src", src);
        imageDiv.appendChild(image);
        sourceLink.setAttribute("href", detailPage);
        sourceLink.appendChild(document.createTextNode(UIStrings.wikiMainURL));
        source.appendChild(document.createTextNode(UIStrings.source + " " + fileName + " - "));
        source.appendChild(sourceLink);
        sourceDir.appendChild(source);

        return "<br/>" + imageDiv.outerHTML + sourceDir.outerHTML + "<br/>";
    },

    // The insert image button html content
    insertImageBox: function () {
        var imageInsertDiv = document.createElement("div");
        var imageInsertButton = document.createElement("div");
        var imageInsertIcon = document.createElement("img");

        imageInsertDiv.setAttribute("class", Selectors.clickableClassName + " " + Selectors.imageInsertButtonClassName);
        imageInsertButton.setAttribute("class", Selectors.imageInsertButtonIconClassName);
        imageInsertButton.setAttribute("title", UIStrings.insert);
        imageInsertIcon.setAttribute("src", "images/insettodoc_image_24x.png");
        imageInsertButton.appendChild(imageInsertIcon);
        imageInsertDiv.appendChild(imageInsertButton);

        return imageInsertDiv.outerHTML;
    },

    // The insert image loading html content
    insertImageCover: function () {
        var imageInsertCoverDiv = document.createElement("div");

        imageInsertCoverDiv.setAttribute("class", Selectors.imageLoadingClassName);

        return imageInsertCoverDiv.outerHTML;
    },

    // The inserted text and source html content
    insertText: function (text, title) {
        var textInsertedDiv = document.createElement("div");
        var sourceDiv = document.createElement("div");
        var source = document.createElement("i");
        var sourceLink = document.createElement("a");

        textInsertedDiv.appendChild(document.createTextNode("\"" + text.trim() + "\""));
        sourceLink.setAttribute("href", (UIStrings.browserUrlPrefix + title).toString());
        sourceLink.appendChild(document.createTextNode(UIStrings.wikiMainURL));
        source.appendChild(document.createTextNode(UIStrings.source + " " + title + " - "));
        source.appendChild(sourceLink);
        sourceDiv.appendChild(source);

        return StrUtil.encodeTextWithHTMLEntities(textInsertedDiv.outerHTML + sourceDiv.outerHTML);
    },

    // The hidden input html content in images submenu
    storeDetailUrl: function (wikiUrl) {
        var input = document.createElement("input");

        if (wikiUrl.indexOf("https://") < 0) {
            wikiUrl = UIStrings.wikiMainURL + wikiUrl;
        }

        input.setAttribute("type", "hidden");
        input.setAttribute("value", "wikiUrl");

        return input.outerHTML;
    },

    // The expand table link html content
    newTableExpand: function () {
        var tableToggleDiv = document.createElement("div");
        var tableToggleImage = document.createElement("img");

        tableToggleDiv.setAttribute("class", Selectors.clickableClassName + " " + Selectors.tableToggleClassName + " " + Selectors.tableExpandedClassName);
        tableToggleDiv.setAttribute("title", UIStrings.tableExpand);
        tableToggleDiv.appendChild(document.createTextNode(UIStrings.tableExpand));

        return tableToggleDiv.outerHTML;
    },

    // The collapse table link html content
    newTableCollapse: function () {
        var tableToggleDiv = document.createElement("div");

        tableToggleDiv.setAttribute("class", Selectors.clickableClassName + " " + Selectors.tableToggleClassName + " " + Selectors.tableCollapsedClassName);
        tableToggleDiv.setAttribute("title", UIStrings.tableCollapse);
        tableToggleDiv.appendChild(document.createTextNode(UIStrings.tableCollapse));

        return tableToggleDiv.outerHTML;
    },

    // The infobox table toggle html content
    wrapInInfoBox: function (html) {
        var infobox = document.createElement("table");

        infobox.setAttribute("class", Selectors.infoboxClassName + " " + Selectors.tableAutoExpandClassName);
        infobox.innerHTML = html;

        return infobox.outerHTML;
    },

    // The no result error message container html content
    noResultErrorMessageContainer: function (message) {
        var noResultErrorMessageContainer = document.createElement("span");

        noResultErrorMessageContainer.setAttribute("class", Selectors.fishbowlClassName);
        noResultErrorMessageContainer.innerHTML = "";
        noResultErrorMessageContainer.appendChild(document.createTextNode(message));

        return noResultErrorMessageContainer.outerHTML;
    },

    // The expand and contract article button
    toggleArticleButton: function () {
        var articleToggleDiv = document.createElement("div");

        articleToggleDiv.setAttribute("id", Selectors.articleToggleClassName);
        articleToggleDiv.setAttribute("class", Selectors.clickableClassName);
        articleToggleDiv.setAttribute("onclick", "Navigation.expandArticle()");
        articleToggleDiv.setAttribute("title", UIStrings.expandArticle);
        articleToggleDiv.setAttribute("tabindex", 200);
        articleToggleDiv.innerHTML = UIStrings.expandArticle;

        return articleToggleDiv.outerHTML;
    },

    // The back to main article button
    backToMainArticleButton: function () {
        var backToMainDiv = document.createElement("div");

        backToMainDiv.setAttribute("id", Selectors.backToMainClassName);
        backToMainDiv.setAttribute("class", Selectors.clickableClassName);
        backToMainDiv.setAttribute("onclick", "Navigation.backToArticle()");
        backToMainDiv.setAttribute("title", UIStrings.backToMain);
        backToMainDiv.setAttribute("tabindex", 300);
        backToMainDiv.innerHTML = UIStrings.backToMain;

        return backToMainDiv.outerHTML;
    },

    // The expanded article area html content
    expandedSectionsContainer: function () {
        var expandedSectionsContainerDiv = document.createElement("div");

        expandedSectionsContainerDiv.setAttribute("id", Selectors.expandedSectionsContainerClassName);

        return expandedSectionsContainerDiv.outerHTML;
    }
};

// To change the css style for the checkbox to indicate it has been checked or unchecked
var CheckboxUtil = {
    checkBoxCheck: function () {
        $(Selectors.autosearchCheckBoxIcon).attr("src", "images/checkmarkchecked_16x.png");
    },

    checkBoxNotCheck: function () {
        $(Selectors.autosearchCheckBoxIcon).attr("src", "images/checkmarknotcheckedd_16x.png");
    }
};

// To change the css style for the submenu tab to indicate it has been selected
var SubmenuStyle = {
    submenuSelected: function (tab) {
        toggleSelectorstyle(tab, Selectors.tabUnselectedClassName, Selectors.tabSelectedClassName);
    },

    submenuNotSelected: function (tab) {
        toggleSelectorstyle(tab, Selectors.tabSelectedClassName, Selectors.tabUnselectedClassName);
    }
};

// This function is used to change the css style for the html item to which the parameter "tag" pointed.
var toggleSelectorstyle = function (tag, oldStyle, newStyle) {
    if (tag.hasClass(oldStyle)) {
        tag.removeClass(oldStyle);
    }
    tag.addClass(newStyle);
};

var SandboxInteraction = {
    sandBoxHostURl: "",

    messageSequenceNo: 0,

    sandboxSequenceNo: 0,

    sandboxTimeout: null,

    initialSandbox: function () {
        // Check hosting url and assign sandbox url
        var hostUrl = document.location.hostname.toLowerCase();

        // test environment url
        // for production, the Wikipedia page and sandbox page
        // will be hosted on different domains
        if (hostUrl.indexOf("localhost") != -1) {
            SandboxInteraction.sandBoxHostURl = "http://localhost:10707";
        }

        // Create iFrame to host Sandbox web site
        var iFrame = document.createElement("iframe");
        iFrame.setAttribute("id", "ms_osf_sandbox");
        iFrame.setAttribute("sandbox", "allow-scripts allow-same-origin");
        iFrame.setAttribute("tabindex", "-1");
        iFrame.setAttribute("src", SandboxInteraction.sandBoxHostURl.concat("/sandbox.html"));
        document.body.appendChild(iFrame);

    },

    resetMessageIndex: function () {
        if (SandboxInteraction.messageSequenceNo >= 0xffff) {
            SandboxInteraction.messageSequenceNo = 0;
        }
    },

    sandboxEventListener: function (event) {
        if (event.origin !== SandboxInteraction.sandBoxHostURl) {
            return;
        } else {
            clearTimeout(SandboxInteraction.sandboxTimeout);
        }

        var messageJson;
        try{
            messageJson = JSON.parse(event.data);
        } catch (err) {
            UI.writeError(Errors.jsonParseError, ErrorType.error);
        }

        SandboxInteraction.sandboxSequenceNo = messageJson.sequence;

        if (SandboxInteraction.sandboxSequenceNo !== SandboxInteraction.messageSequenceNo) {
            return;
        }

        switch (messageJson.message.callback) {
            case "updateSectionCallback":
                if (!GlobalVars.nextState.isNewArticle) {
                    GlobalVars.nextState = State.newSectionView();
                }

                GlobalVars.nextState.article = messageJson.message.content;

                if (GlobalVars.nextState.isNewArticle) {
                    GlobalVars.nextState.article += CodeSnippet.toggleArticleButton();
                } else {
                    GlobalVars.nextState.article += CodeSnippet.backToMainArticleButton();
                    GlobalVars.nextState.tocReady = true;
                }

                GlobalVars.nextState.articleReady = true;
                GlobalVars.nextState.writeToPage(true);
                UI.showFullArticleButton();
                UI.hideLoadingScreen();

                break;
            case "updateTocCallback":
                if (messageJson.message.referenceID && messageJson.message.referenceID !== 0) {
                    GlobalVars.nextState.referenceID = messageJson.message.referenceID;
                }

                GlobalVars.nextState.topic = decodeURIComponent(messageJson.message.redirectTitle);
                GlobalVars.nextState.toc = messageJson.message.toc;
                GlobalVars.nextState.tocReady = true;
                GlobalVars.nextState.type = State.TypeEnum.article;
                GlobalVars.nextState.writeToPage(true);

                break;
            case "expandArticleCallback":
                UI.writeToArticleExpansionContainer(messageJson.message.content);
                UI.hideLoadingScreen();

                break;
            case "updateImagesGridCallback":
                if (GlobalVars.nextState.type === State.TypeEnum.images
                    && GlobalVars.currState.type !== State.TypeEnum.images) {
                    GlobalVars.nextState.writeToPage(true);
                }

                if (GlobalVars.nextState.type !== State.TypeEnum.images
                    && GlobalVars.currState.type !== State.TypeEnum.images) {
                    SandboxInteraction.sandboxPostMessage("cancel");

                    return;
                }

                $(Selectors.article).append(messageJson.message.content);
                UI.processSection($(Selectors.article).children().last());

                break;
            case "updateFullSizedPictureCallback":
                // The only reason full size image is fetched is insertion to a document.
                Client.insertImage(CodeSnippet.insertedImage(messageJson.message.imgUrl, messageJson.message.fileName, messageJson.message.detailUrl));

                break;
            case "updateReferenceCallback":
                GlobalVars.nextState = State.newSectionView();
                GlobalVars.nextState.type = State.TypeEnum.reference;
                GlobalVars.nextState.article = messageJson.message.content;
                GlobalVars.nextState.articleReady = true;
                GlobalVars.nextState.writeToPage(true);

                break;
            case "updateCategoryCallback":
                GlobalVars.nextState.article = messageJson.message.content;
                GlobalVars.nextState.toc = StrUtil.empty;
                GlobalVars.nextState.tocReady = true;
                GlobalVars.nextState.articleReady = true;
                GlobalVars.nextState.type = State.TypeEnum.category;
                GlobalVars.nextState.writeToPage(true);

                break;
            case "searchWikiCallback":
                UI.hideFullArticleButton();
                GlobalVars.nextState.article = messageJson.message.content;
                GlobalVars.nextState.articleReady = true;
                GlobalVars.nextState.tocReady = true;
                GlobalVars.nextState.type = State.TypeEnum.search;
                GlobalVars.nextState.writeToPage(true);

                break;
            case "searchCancel":
                UI.hideLoadingScreen();

                break;
            case "noResult":
                GlobalVars.nextState.topic = GlobalVars.currState.topic;
                GlobalVars.nextState.isNewArticle = false;
                UI.writeError(messageJson.message.errorMessage, ErrorType.notFoundResult);

                break;
            case "error":
                UI.writeError(messageJson.message.errorMessage, ErrorType.error);

                break;
        }
    },

    sandboxPostMessage: function (message, showLoading) {
        if (showLoading) {
            UI.showLoadingScreen();
        }

        SandboxInteraction.resetMessageIndex();
        var messageSent = { "message": message, "sequence": ++SandboxInteraction.messageSequenceNo };
        document.getElementById(Selectors.sandboxClassName).contentWindow.postMessage(JSON.stringify(messageSent), SandboxInteraction.sandBoxHostURl);
        SandboxInteraction.sandboxTimeout = setTimeout("UI.writeError(Errors.sandboxServiceDown, ErrorType.error)", 30000);
    },

    postSearchArticleMessage: function (title) {
        var message = { "function": "updateArticle", "title": title };
        SandboxInteraction.sandboxPostMessage(message, true);
    },

    postEntireArticleMessage: function (title) {
        var message = { "function": "expandArticle", "title": title };
        SandboxInteraction.sandboxPostMessage(message, true);
    },

    postSectionMessage: function (title, sectionID) {
        var message = { "function": "updateSection", "title": title, "sectionID": sectionID };
        SandboxInteraction.sandboxPostMessage(message, true);
    },

    postImageMessage: function (title) {
        var message = { "function": "updateImagesGrid", "title": title };
        SandboxInteraction.sandboxPostMessage(message, true);
    },

    postFullSizedImageMessage: function (title, maxImageWidth) {
        var message = { "function": "updateFullSizedPicture", "title": title, "maxImageWidth": maxImageWidth };
        SandboxInteraction.sandboxPostMessage(message, false);
    },

    postReferenceMessage: function (title, sectionID) {
        var message = { "function": "updateReference", "title": title, "sectionID": sectionID };
        SandboxInteraction.sandboxPostMessage(message, true);
    }
}
