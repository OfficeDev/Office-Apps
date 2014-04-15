/* **************************************************************************************
Copyright (c), Microsoft Open Technologies, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***************************************************************************************** */

// The states represent the pages app displayed, and the attribute of state indicate
// the content of page.
function State(title) {
    this.topic = title;
    this.article = StrUtil.empty;
    this.toc = StrUtil.empty;
    this.articleInfobox = StrUtil.empty;
    this.type = State.TypeEnum.splash;
    this.articleView = this;
    this.isNewArticle = false;
    this.referenceID = 0;
    this.articleReady = false;
    this.tocReady = false;

    // Indicate the state(page) is ready to display
    this.isReady = function () {
        return this.articleReady && this.tocReady;
    };

    // Indicate current search item has Wikipedia article
    this.hasCorrespondingWikiPage = function () {
        return this.type === State.TypeEnum.article || !this.isSearch();
    };

    // This means this is a proper article with images and references
    this.belongsToAnArticle = function () {
        return this.type !== State.TypeEnum.search && this.type !== State.TypeEnum.splash
                && this.type !== State.TypeEnum.category && this.type !== State.TypeEnum.error;
    };

    this.isSearch = function () {
        return this.type === State.TypeEnum.search;
    };

    this.isSplash = function () {
        return this.type === State.TypeEnum.splash;
    };

    // Display current state(page), at first save previous displayed state into state stack if needed
    this.writeToPage = function (ifSaveState) {
        if (!this.isReady()) {
            return;
        }

        if (ifSaveState) {
            UI.selectCurrStateSubmenu(false);
            Navigation.saveState();
            UI.selectCurrStateSubmenu(true);
        }

        UI.writeFirstPage(this);
        UI.hideLoadingScreen();
    };
}

// The state(page) type
State.TypeEnum = {
    // The article of search
    article: "article",
    // Table of contents, means the chapter of current search article
    toc: "toc",
    // The images in current search article
    images: "images",
    // The infobox tables in current search article
    infobox: "infobox",
    // The reference of current search article
    reference: "reference",
    // Means the search is in process
    search: "search",
    // Indicate the welcome page
    splash: "splash",
    // Indicate no result found with current search
    error: "error",
    category: "category"
};

// Construct state in different state type
State.newTOCView = function () {
    var s = new State(GlobalVars.currState.topic);

    s.referenceID = GlobalVars.currState.referenceID;
    s.toc = GlobalVars.currState.toc;
    s.tocReady = true;
    s.type = State.TypeEnum.toc;
    s.articleView = GlobalVars.currState.articleView;
    s.articleInfobox = GlobalVars.currState.articleInfobox;

    return s;
};

State.newImagesGridView = function () {
    var s = new State(GlobalVars.currState.topic);

    s.referenceID = GlobalVars.currState.referenceID;
    s.toc = GlobalVars.currState.toc;
    s.articleInfobox = GlobalVars.currState.articleInfobox;
    s.tocReady = true;
    s.articleReady = true;
    s.articleView = GlobalVars.currState.articleView;
    s.type = State.TypeEnum.images;

    return s;
};

State.newInfoBoxView = function (infoboxHTML) {
    var s = new State(GlobalVars.currState.topic);

    s.referenceID = GlobalVars.currState.referenceID;
    s.toc = GlobalVars.currState.toc;
    s.articleInfobox = GlobalVars.currState.articleInfobox;
    s.tocReady = true;
    s.type = State.TypeEnum.infobox;
    s.articleView = GlobalVars.currState.articleView;
    s.article = infoboxHTML;
    s.articleReady = true;

    return s;
};

State.newSectionView = function () {
    var s = new State(GlobalVars.currState.topic);

    s.referenceID = GlobalVars.currState.referenceID;
    s.toc = GlobalVars.currState.toc;
    s.articleInfobox = GlobalVars.currState.articleInfobox;
    s.tocReady = true;
    s.type = State.TypeEnum.article;
    s.articleView = GlobalVars.currState.articleView;

    return s;
};

State.newErrorView = function (title) {
    var s = new State(title);

    s.referenceID = 0;
    s.article = StrUtil.empty;
    s.toc = StrUtil.empty;
    s.articleInfobox = GlobalVars.currState.articleInfobox;
    s.tocReady = true;
    s.type = State.TypeEnum.error;
    s.articleReady = true;

    return s;
};

// These functions are using to handle the state(page)'s navigation 
var Navigation = new function () {
    // The max width of full size image when insert into office client
    var maxImageWidth = 600;
    
    // The stack store history navigations
    var stack = new (function () {
        var arr = new Array();

        this.push = function (state) {
            arr.push(state);
        };

        this.pop = function () {
            return arr.pop();
        };

        this.isEmpty = function () {
            return arr.length === 0;
        };

        this.peek = function () {
            if (this.isEmpty()) {
                return null;
            }

            return arr[arr.length - 1];
        };
    })();
    
    // Initialize the current state to welcome page
    GlobalVars.currState = new State(UIStrings.welcomeMessage);
    GlobalVars.currState.articleReady = true;
    GlobalVars.currState.tocReady = true;
    GlobalVars.nextState = new State(StrUtil.empty);

    // Back to the previous page when click the back button
    this.back = function () {
        var lastStateTopic = GlobalVars.currState.topic;
        UI.selectCurrStateSubmenu(false);
        GlobalVars.currState = stack.pop();
        UI.selectCurrStateSubmenu(true);
        GlobalVars.nextState = new State(GlobalVars.currState.topic);

        if (lastStateTopic !== GlobalVars.currState.topic) {
            window.freshSearch = true;
        }

        GlobalVars.currState.writeToPage(false);

        if (stack.isEmpty()) {
            UI.showSplashPage();
            GlobalVars.currState = new State(UIStrings.welcomeMessage);
            GlobalVars.currState.articleReady = true;
            GlobalVars.currState.tocReady = true;
            GlobalVars.nextState = new State(StrUtil.empty);
        }
    };

    // Takes the user from the state they are currently on back to the main article page.
    this.backToArticle = function () {
        var tempArr = new Array();
        var lastStateTopic = GlobalVars.currState.topic;
        var lastStateType = GlobalVars.currState.type;

        var tempState = stack.peek();
        while (tempState) {
            if (tempState.topic === lastStateTopic && tempState.type === lastStateType) {
                GlobalVars.nextState = tempState;
                while (tempArr.length > 0) {
                    tempState = tempArr.pop();
                    stack.push(tempState);
                }
                GlobalVars.nextState.writeToPage(true);
                break;
            } else {
                tempArr.push(stack.pop());
                tempState = stack.peek();
            }
        }
    };

    // Save the current page and move to the next page
    this.saveState = function () {
        // Only save if the page has changed since the last save
        if (stack.isEmpty() || GlobalVars.currState.topic !== stack.peek().topic || GlobalVars.currState.article !== stack.peek().article) {
            GlobalVars.currState.article = UI.getCurrentArticleView();
            stack.push(GlobalVars.currState);
        }

        GlobalVars.currState = GlobalVars.nextState;
        GlobalVars.nextState = new State(GlobalVars.currState.topic);
    };

    // Update article from the item in search bar
    this.updateArticleFromSearchBar = function (autoSearch) {
        if (GlobalVars.currState.type === State.TypeEnum.splash && UI.getSearchBarValue() === UIStrings.welcomeMessage) {
            return;
        }

        Navigation.updateArticle(UI.getSearchBarValue());
        GlobalVars.nextState.type = State.TypeEnum.article;
        GlobalVars.nextState.articleView = GlobalVars.nextState;
    };

    // Update article for search item
    this.updateArticle = function (title) {
        window.freshSearch = true;
        window.lastScrollTop = 0;
        title = StrUtil.trimWhiteSpace(title);

        if (title.length === 0) {
            return;
        }

        GlobalVars.nextState.topic = decodeURIComponent(title);
        GlobalVars.nextState.isNewArticle = true;
        SandboxInteraction.postSearchArticleMessage(GlobalVars.nextState.topic);
        // Scroll to top of screen
        $(Selectors.content).animate({ scrollTop: 0 }, "medium");
    };

    // Fetches all chapters of the article
    this.expandArticle = function () {
        if (UI.activateArticleExpansionContainer()) {
            SandboxInteraction.postEntireArticleMessage(GlobalVars.currState.topic);
        } else {
            UI.scrollReset();
        }

        UI.toggleArticleButton();
    };

    // Fetches a single section(chapter) of current article and displays it on the screen.
    this.updateSection = function (sectionID) {
        SandboxInteraction.postSectionMessage(GlobalVars.nextState.topic, sectionID);
    };

    // Fetches chapters for the article and display them
    this.updateTocView = function () {
        GlobalVars.nextState = State.newTOCView();
        GlobalVars.nextState.article = GlobalVars.nextState.toc;
        GlobalVars.nextState.articleReady = true;
        GlobalVars.nextState.writeToPage(true);
    };

    // Fetches infobox tables for the article and display them
    this.updateInfoBox = function () {
        UI.createInfoBoxView();
    };

    // Fetches images for the article and display them on page
    this.updateImagesGrid = function () {
        GlobalVars.nextState = State.newImagesGridView();
        SandboxInteraction.postImageMessage(GlobalVars.currState.topic);
    };

    // Fetches the full size image when insert the image into the office client
    this.updateFullSizedPicture = function (title) {
        SandboxInteraction.postFullSizedImageMessage(title, maxImageWidth);
    };

    // Fetches references of current article
    this.updateReference = function (sectionID) {
        SandboxInteraction.postReferenceMessage(GlobalVars.nextState.topic, sectionID);
    };

    // Conducts a Wikipedia search and opens it in the browser.
    this.openArticleInBrowser = function () {
        // The string that the user entered when searching.
        var searchTerm = UI.getSearchBarValue();

        if (searchTerm === UIStrings.welcomeMessage) {
            return;
        }

        var searchURL = (UIStrings.browserUrlPrefix + searchTerm).toString();

        window.open(searchURL);
    };

}();
