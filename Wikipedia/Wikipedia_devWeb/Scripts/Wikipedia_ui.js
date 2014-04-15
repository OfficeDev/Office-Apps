/* **************************************************************************************
Copyright (c), Microsoft Open Technologies, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***************************************************************************************** */

// UI using to handle the ui element's status and events in html page
var UI = new function () {
    var articlePaneAdjustment = 165;
    var clickErrorPane = false;
    var showErrorPane = false;
    var clickAboutPane = false;
    var showAboutPane = false;
    var clickOptionPane = false;
    var showOptionPane = false;
    var searchOptionsClicked = false;  // check if the click event has been responded by Selectors.searchOptions
    var showInsertTextButton = false;
    var imageClick = false;
    var infoboxAutoexpand = false;

    // Init the app page when the app first loading
    this.init = function () {
        // Set button titles
        $(Selectors.backButton).attr("title", UIStrings.backTitle);
        $(Selectors.searchButton).attr("title", UIStrings.searchTitle);
        $(Selectors.searchOptions).attr("title", UIStrings.searchOptionTitle);
        $(Selectors.autosearchCheckbox).attr("title", UIStrings.autosearchTitle);
        $(Selectors.browserArea).attr("title", UIStrings.browser);
        $(Selectors.sectionsButton).attr("title", UIStrings.sectionsTab);
        $(Selectors.imagesButton).attr("title", UIStrings.imagesTab);
        $(Selectors.infoboxButton).attr("title", UIStrings.infoboxTab);
        $(Selectors.referenceButton).attr("title", UIStrings.referenceTab);
        $(Selectors.insertText).attr("title", UIStrings.insert);
        
        // Set strings
        $(Selectors.mainPageHint).text(UIStrings.mainPageHint);
        $(Selectors.loadingMsg).text(UIStrings.loadingMessage);
        $(Selectors.errorHeading).html(UIStrings.errorHeading);
        $(Selectors.suggests).html(UIStrings.suggestionMessage);
        $(Selectors.sectionsButton).html(UIStrings.sectionsTab);
        $(Selectors.imagesButton).html(UIStrings.imagesTab);
        $(Selectors.searchBar).val(UIStrings.welcomeMessage);
        $(Selectors.browserButton).html(UIStrings.browser);
        $(Selectors.referenceButton).html(UIStrings.referenceTab);
        $(Selectors.infoboxButton).html(UIStrings.infoboxTab);
        $(Selectors.ellipses).html(UIStrings.ellipses);

        // Show the About info when click Wikipedia's logo
        $(Selectors.logo).click(function () {
            UI.writeAbout();
        });

        // Make users able to conduct searches when they press the search button or when they press enter while typing in the search box
        $(Selectors.searchBar).keydown(function (e) {
            if (e.keyCode === 13) {
                Navigation.updateArticleFromSearchBar(false);
            }
        });

        $(Selectors.searchButton).click(function (e) {
            Navigation.updateArticleFromSearchBar(false);
        });

        $(Selectors.searchButton).keydown(function (e) {
            if (e.keyCode === 13) {
                Navigation.updateArticleFromSearchBar(false);
            }
        });

        // Hide the shown toast panes when users click off of them
        $(document).click(function () {
            // Hide about pane
            if (clickAboutPane) {
                clickAboutPane = false;
            } else {
                UI.aboutExit();
            }

            // Hide tab menu pane
            if (GlobalVars.tabMenuOpen) {
                GlobalVars.tabMenuOpen = false;
            } else {
                $(Selectors.tabMenu).hide();
            }

            // Hide error pane
            if (clickErrorPane) {
                clickErrorPane = false;
            } else {
                UI.errorExit();
            }

            // Hide option pane
            if (clickOptionPane) {
                clickOptionPane = false;
                $(Selectors.searchOptionPane).fadeOut(100);
            }

            if (showOptionPane) {
                if (searchOptionsClicked) {
                    searchOptionsClicked = false;
                } else {
                    $(Selectors.searchOptionPane).fadeOut(100);
                    showOptionPane = false;
                }
            }
        });

        $(document).keydown(function (e) {
            if (e.keyCode === 13) {
                // Hide about pane
                if (clickAboutPane) {
                    clickAboutPane = false;
                } else {
                    UI.aboutExit();
                }

                // Hide tab menu pane
                if (GlobalVars.tabMenuOpen) {
                    GlobalVars.tabMenuOpen = false;
                } else {
                    $(Selectors.tabMenu).hide();
                }

                // Hide error pane
                if (clickErrorPane) {
                    clickErrorPane = false;
                } else {
                    UI.errorExit();
                }

                // Hide option pane
                if (clickOptionPane) {
                    clickOptionPane = false;
                    $(Selectors.searchOptionPane).fadeOut(100);
                }

                if (showOptionPane) {
                    if (searchOptionsClicked) {
                        searchOptionsClicked = false;
                    } else {
                        $(Selectors.searchOptionPane).fadeOut(100);
                        showOptionPane = false;
                    }
                }
            }
        });

        // Hide the text insert button and deselect the highlight text when the mouse down
        $(document).mousedown(function () {
            if (document.selection && showInsertTextButton) {
                document.selection.empty();
            } else if (window.selection && showInsertTextButton) {
                window.selection.empty();
            }

            UI.hideTextInsertionButton();
        });

        // Hide the text insert button and deselect the highlight text when the document area lose focus
        $(Selectors.content).blur(function () {
            if (document.selection && showInsertTextButton) {
                document.selection.empty();
            } else if (window.selection && showInsertTextButton) {
                window.selection.empty();
            }

            UI.hideTextInsertionButton();
        });

        // Show or hide the text insert button as the scroll bar scrolling
        $(Selectors.content).scroll(function () {
            // Animate the text insert button as the content scroll if there has any selected text
            if (UI.hasSelectedText()) {
                if (document.selection) {
                    if ((document.selection.createRange().offsetTop + document.selection.createRange().boundingHeight) > articlePaneAdjustment) {
                        UI.showTextInsertionButton(document.selection.createRange().offsetLeft, document.selection.createRange().offsetTop);
                    } else {
                        UI.hideTextInsertionButton();
                    }
                } else {
                    var selectionRanges;

                    if (window.getSelection) {
                        selectionRanges = window.getSelection().getRangeAt(0).getClientRects();
                    } else if (document.getSelection) {
                        selectionRanges = document.getSelection().getRangeAt(0).getClientRects();
                    }

                    var height = 0;
                    var rangeNo = selectionRanges.length;

                    for (var i = 0; i < rangeNo; i++) {
                        height += selectionRanges[i].height;
                    }

                    if ((selectionRanges[0].top + height) > articlePaneAdjustment) {
                        UI.showTextInsertionButton(selectionRanges[0].left, selectionRanges[0].top);
                    } else {
                        UI.hideTextInsertionButton();
                    }
                }
            }            
        });

        // Handle string in the search bar when the user interacts with it
        $(Selectors.searchBar).focus(function (e) {
            $(this).removeClass(Selectors.splashHintClassName);

            if ($(this).val() === UIStrings.welcomeMessage) {
                $(this).val(StrUtil.empty);
                $(this).focus();
            } else {
                $(this).select();
            }
        });

        $(Selectors.searchBar).blur(function (e) {
            if ($(this).val() === StrUtil.empty) {
                $(this).val(GlobalVars.currState.topic);
                
                if (GlobalVars.currState.type === State.TypeEnum.splash) {
                    $(this).addClass(Selectors.splashHintClassName);
                }
            }
        });

        // Set the browser button to open up the search term when clicked
        $(Selectors.browserArea).click(function () {
            Navigation.openArticleInBrowser();
            clickOptionPane = true;
        });

        $(Selectors.browserArea).keydown(function (e) {
            if (e.keyCode === 13) {
                Navigation.openArticleInBrowser();
                clickOptionPane = true;
            }
        });

        // Handle clicking on search options for autosearch
        $(Selectors.searchOptions).click(function () {
            if (showOptionPane) {
                $(Selectors.searchOptionPane).fadeOut(100);
                showOptionPane = false;
            } else {
                $(Selectors.searchOptionPane).fadeIn(100);
                showOptionPane = true;
            }
            searchOptionsClicked = true;
        });

        $(Selectors.searchOptions).keydown(function (e) {
            if (e.keyCode === 13) {
                if (showOptionPane) {
                    $(Selectors.searchOptionPane).fadeOut(100);
                    showOptionPane = false;
                } else {
                    $(Selectors.searchOptionPane).fadeIn(100);
                    showOptionPane = true;
                }
                searchOptionsClicked = true;
            }
        });

        // Init the status of auto search checkbox using office document's setting api and
        // bind click event to auto search area.
        UI.autoSearchInit();
        $(Selectors.autosearchCheckbox).click(function () {
            UI.toggleAutoSearch();
            clickOptionPane = true;
        });

        $(Selectors.autosearchCheckbox).keydown(function (e) {
            if (e.keyCode === 13) {
                UI.toggleAutoSearch();
                clickOptionPane = true;
            }
        });

        // Enable back button and hide it since its on the splash page
        $(Selectors.backButton).click(Navigation.back);

        $(Selectors.backButton).keydown(function (e) {
            if (e.keyCode === 13) {
                Navigation.back();
            }
        });

        $(Selectors.backButton).hover(
            function () {
                $(this).find("img").attr("src", "images/backbuttonhover_24x.png");
            },
            function () {
                $(this).find("img").attr("src", "images/backbutton_24x.png");
        });

        // Enable sections button in submenu
        $(Selectors.sectionsButton).click(function () {
            if (GlobalVars.currState.type !== State.TypeEnum.toc) {
                Navigation.updateTocView();
            }
        });

        $(Selectors.sectionsButton).keydown(function (e) {
            if (e.keyCode === 13) {
                if (GlobalVars.currState.type !== State.TypeEnum.toc) {
                    Navigation.updateTocView();
                }
            }
        });

        // Enable images button in submenu
        $(Selectors.imagesButton).click(function () {
            if (GlobalVars.currState.type !== State.TypeEnum.images) {
                Navigation.updateImagesGrid();
            }
        });

        $(Selectors.imagesButton).keydown(function (e) {
            if (e.keyCode === 13) {
                if (GlobalVars.currState.type !== State.TypeEnum.images) {
                    Navigation.updateImagesGrid();
                }
            }
        });

        // Enable infobox button in submenu
        $(Selectors.infoboxButton).click(function () {
            if (GlobalVars.currState.type !== State.TypeEnum.infobox) {
                Navigation.updateInfoBox();
            }
        });

        $(Selectors.infoboxButton).keydown(function (e) {
            if (e.keyCode === 13) {
                if (GlobalVars.currState.type !== State.TypeEnum.infobox) {
                    Navigation.updateInfoBox();
                }
            }
        });

        // Enable inserting text by show the text insert button after mouse up
        $(Selectors.content).mouseup(function (e) {
            // If there was text, position the insertion box and show
            if (UI.hasSelectedText()) {
                if (window.getSelection) {
                    $(Selectors.textToInsert).val(window.getSelection().toString());
                    UI.showTextInsertionButton(window.getSelection().getRangeAt(0).getClientRects()[0].left, window.getSelection().getRangeAt(0).getClientRects()[0].top);
                } else if (document.getSelection) {
                    $(Selectors.textToInsert).val(document.getSelection().toString());
                    UI.showTextInsertionButton(document.getSelection().getRangeAt(0).getClientRects()[0].left, document.getSelection().getRangeAt(0).getClientRects()[0].top);
                } else if (document.selection) {
                    $(Selectors.textToInsert).val(document.selection.createRange().text);
                    UI.showTextInsertionButton(selectedTextRange.offsetLeft, selectedTextRange.offsetTop);
                }
            }
        });

        // Insert text into office client when click the text insert button,
        // then hide the text insert button.
        $(Selectors.insertText).click(function () {
            Client.insertText($(Selectors.textToInsert).val());
            UI.hideTextInsertionButton();
        });

        // Make sure the article pane is the same size consistently
        $(Selectors.content).height(window.innerHeight - articlePaneAdjustment);
        window.onresize = function () {
            $(Selectors.content).height(window.innerHeight - articlePaneAdjustment);
        };

        $(Selectors.aboutPane).click(function () {
            clickAboutPane = true;
        });

        $(Selectors.errorPane).click(function () {
            clickErrorPane = true;
        });

        // Update the submenu area
        updateTabs();
    };

    this.hasSelectedText = function () {
        if (window.getSelection && StrUtil.trimWhiteSpace(window.getSelection().toString()) !== ""
            || document.getSelection && StrUtil.trimWhiteSpace(document.getSelection().toString()) !== ""
            || document.selection && StrUtil.trimWhiteSpace(document.selection.createRange().text) !== "") {
            return true;
        }

        return false;
    }

    // Write content into the error pane
    // Parameters
    //      message: the content will be write to the error pane
    //      errorType: there are three error type.
    this.writeError = function (message, errorType) {
        if (errorType === ErrorType.notFoundResult) {
            // No result found for search term
            GlobalVars.nextState = State.newErrorView(UI.getSearchBarValue());
            GlobalVars.nextState.article = CodeSnippet.noResultErrorMessageContainer(message);
            GlobalVars.nextState.writeToPage(true);
        } else if (errorType === ErrorType.searchKeywordLimited) {
            // Search keyword is limited to 100 characters.
            $(Selectors.errorHeading).html(UIStrings.warningHeading);
            $(Selectors.errorMessage).html(message);
            $(Selectors.errorPane).fadeIn();
        } else if (errorType === ErrorType.warning) {
            // Warning content in the article
            $(Selectors.errorHeading).html(UIStrings.warningHeading);
            var messageHTML = "";
            var messageTitle = document.createElement("h4");
            var messageList = document.createElement("ul");
            var index = 0;

            for (index in message) {
                if (index === 0) {
                    messageTitle.appendChild(document.createTextNode(message[index]));
                    messageHTML += messageTitle.outerHTML;
                } else {
                    var messageListItem = document.createElement("li");
                    messageListItem.appendChild(document.createTextNode(message[index]));
                    messageList.appendChild(messageListItem);
                }

                index++;
            }

            if (index > 0) {
                messageHTML += messageList.outerHTML;
            }

            $(Selectors.errorMessage).html(messageHTML);
            $(Selectors.errorPane).fadeIn();
        } else {
            // Error
            $(Selectors.errorHeading).html(UIStrings.errorHeading);
            $(Selectors.errorMessage).html(message);
            $(Selectors.errorPane).fadeIn();
        }

        showErrorPane = true;
        UI.hideLoadingScreen();
    };

    // Deselect the highlight text and hide error pane
    this.errorExit = function () {
        if (showErrorPane) {
            if (document.selection) {
                document.selection.empty();
            } else if (window.selection) {
                window.selection.empty();
            }

            showErrorPane = false;
            $(Selectors.errorPane).fadeOut();
        }
    };

    // Show the about pane
    this.writeAbout = function () {
        $(Selectors.aboutMessage).html(UIStrings.aboutMessage);
        $(Selectors.aboutPane).fadeIn();	    
        clickAboutPane = true;
        showAboutPane = true;
        UI.hideLoadingScreen();
    };

    // Hide the about pane
    this.aboutExit = function () {
        if (showAboutPane) {
            if (document.selection) {
                document.selection.empty();
            } else if (window.selection) {
                window.selection.empty();
            }

            showAboutPane = false;
            $(Selectors.aboutPane).fadeOut();
        }
    };

    // Get the search term from search bar
    this.getSearchBarValue = function () {
        return $(Selectors.searchBar).val();
    };

    // Update the search string of the search bar
    this.updateSearchBar = function (value) {
        $(Selectors.searchBar).val(value);
    };

    // When hover or click the image area, add the image insert button on the bottom of the image
    // and hide other image's insert button.
    this.imageAreaFocus = function (imageArea) {
        var img = imageArea.find("img");

        // Hide all other insert image buttons before displaying it over this one
        if (!img.hasClass(Selectors.imageHoveredClassName)) {
            $(Selectors.imageHoveredClassName).click(function () { });
            UI.hideBottomBar();
        }

        // Generate the button for the image if necessary and bind the click to insert the image
        if (img.siblings(Selectors.insertImage).size() === 0) {
            img.after(CodeSnippet.insertImageBox);

            img.siblings(Selectors.insertImage).click(function () {
                if (img.siblings(Selectors.insertImgLoading).size() === 0) {
                    img.before(CodeSnippet.insertImageCover);
                }

                UI.showInsertLoadingImage(imageArea, img);
                Navigation.updateFullSizedPicture($(Selectors.imgToInsert).val());
                $(Selectors.hoveredImg).removeClass(Selectors.imageHoveredClassName);
                UI.hideBottomBar();
            });

            // Make sure the black box is the width of the image
            img.siblings(Selectors.insertImage).width("100%");
        }

        // Handle decor
        $(Selectors.imgToInsert).val(StrUtil.parseImageTitleFromUrl(img[0].src));
        $(Selectors.hoveredImg).removeClass(Selectors.imageHoveredClassName);
        img.addClass(Selectors.imageHoveredClassName);
        UI.showBottomBar(img);
    };

    // Makes images insertable and handles general article decorations 
    // including video, audio, warning, table, internal links and so on.
    this.processSection = function (ele) {
        // If the content is toc of the article, make them tabable and bind keydown event to them.
        var tocItems = $(ele).find(Selectors.tocItemClass);
        tocItems.each(function () {
            $(this).keydown(function (e) {
                if (e.keyCode === 13) {
                    Navigation.updateSection(($(this).attr("tabindex") - 100).toString());
                }
            });
        });

        // If the content contains expand/collapse toggle or backToMain toggle, add keydown event to them
        if ($(ele).find(Selectors.toggleArticleButton).length > 0) {
            $(Selectors.toggleArticleButton).keydown(function (e) {
                if (e.keyCode === 13) {
                    Navigation.expandArticle();
                }
            });
        }

        if ($(ele).find(Selectors.backToMainButton).length > 0) {
            $(Selectors.backToMainButton).keydown(function (e) {
                if (e.keyCode === 13) {
                    Navigation.backToArticle();
                }
            });
        }

        // Remove maps
        var maps = $(ele).find("map");
        maps.each(function () {
            var siblings = $(this).siblings();
            $(this).remove();

            siblings.each(function () {
                if ($(this).attr("usemap")) {
                    $(this).wrap("<a/>");
                    $(this).parent().addClass("image");
                    UI.resizeHTMLContent($(this));
                } else {
                    $(this).remove();
                }
            });
        });

        // Remove audios and replace videos with images
        $(ele).find(Selectors.audioClass).remove();
        var mediaContainers = $(ele).find(Selectors.mediaClass);

        mediaContainers.each(function () {
            if ($(this).find(Selectors.videoSelector).length > 0) {
                var a = document.createElement("a");
                var videoImage = document.createElement("img");
                a.setAttribute("class", "image");
                videoImage.setAttribute("src", "http:" + $(this).find(Selectors.videoSelector)[0].getAttribute("poster"));
                a.appendChild(videoImage);
                $(this).after(a);
            }

            $(this).remove();
        });

        // Make images insertable
        var images = $(ele).find(Selectors.imageSelector);
        var index = 0;

        images.each(function () {
            var image = $(this);

            if ($(this).parent().attr("href")) {
                image.after(CodeSnippet.storeDetailUrl($(this).parent().attr("href")));
                $(this).parent().removeAttr("href");
            }

            // If you can insert images into the office client, 
            // add the image insert area into this image.
            if (Office.context.document.customXmlParts) {
                image.wrap("<div/>");
                image.parent().addClass(Selectors.imageInsertAreaClassName);
                $(Selectors.imageInsertArea).width(image.width + 4);
                $(Selectors.imageInsertArea).height(image.height + 4);
                $(Selectors.imageInsertArea).attr("tabindex", 400 + index++);
            }
        });

        // When hover in the image insert area, show the image insert button
        // by call imageAreaFocus function; and when hover out the image insert
        // area, will hide the image insert button.
        $(Selectors.imageInsertArea).hover(
            function () {
                UI.imageAreaFocus($(this));
            },
            function () {
                if (!imageClick) {
                    $(Selectors.hoveredImg).removeClass(Selectors.imageHoveredClassName);
                    UI.hideBottomBar();
                }
            }
        );

        // When click the image insert area, show the image insert button
        $(Selectors.imageInsertArea).mousedown(function () {
            imageClick = true;
            UI.imageAreaFocus($(this));
        });

        $(Selectors.imageInsertArea).keydown(function (e) {
            if (e.keyCode === 13) {
                var img = $(this).find("img");

                if (img.siblings(Selectors.insertImgLoading).size() === 0) {
                    img.before(CodeSnippet.insertImageCover);
                }

                UI.showInsertLoadingImage($(this), img);
                Navigation.updateFullSizedPicture($(Selectors.imgToInsert).val());
                $(Selectors.hoveredImg).removeClass(Selectors.imageHoveredClassName);
                UI.hideBottomBar();
            }
        });

        $(Selectors.imageInsertArea).focus(function () {
            UI.imageAreaFocus($(this));
        });

        $(Selectors.imageInsertArea).blur(function () {
            if (!imageClick) {
                $(Selectors.hoveredImg).removeClass(Selectors.imageHoveredClassName);
                UI.hideBottomBar();
            }
        });

        // Write the warning box into error pane
        if ($(ele).find(Selectors.ambox) && $(ele).find(Selectors.ambox).length > 0) {
            var spans = $(ele).find(Selectors.ambox).find("span");
            var message = [];
            var index = 0;

            spans.each(function () {
                var span = $(this);

                if (!span.hasClass(Selectors.warningCompactClassName)) {
                    message[index++] = span.text();
                }
            });

            UI.writeError(message, ErrorType.warning);
        }

        // Remove some other stuff as well
        $(ele).find(Selectors.reference).remove();
        $(ele).find(Selectors.err).remove();
        $(ele).find(Selectors.meta).remove();
        $(ele).find(Selectors.cite).remove();
        $(ele).find(Selectors.coordinates).remove();
        $(ele).find(Selectors.backLinks).remove();
        $(ele).find(Selectors.editLinks).remove();
        $(ele).find(Selectors.jumpBackSection).remove();

        // Make all the tables toggleable
        var tables = $(ele).find(Selectors.table);

        tables.each(function () {
            var table = $(this);

            // Add the toggle bar before each table
            if (!table.hasClass(Selectors.tableClassName) && table.text().trim().length > 0) {
                table.wrap("<div/>");

                if (table.hasClass(Selectors.tableAutoExpandClassName)) {
                    table.before(CodeSnippet.newTableCollapse);
                } else {
                    table.before(CodeSnippet.newTableExpand);
                }

                table.addClass(Selectors.tableClassName);
            }

            // Check if the table is expand or collapse
            var parentExpandIndex = $(this).parent().html().indexOf(UIStrings.tableExpand);
            var parentCollapseIndex = $(this).parent().html().indexOf(UIStrings.tableCollapse);

            if (parentExpandIndex >= 0 &&
                (parentCollapseIndex >= 0 && parentExpandIndex < parentCollapseIndex || parentCollapseIndex < 0)) {
                table.hide();
            } else {
                table.show();
            }
        });

        $(Selectors.tableToggle).unbind("click");
        $(Selectors.tableToggle).click(function () {
            $(this).siblings(Element.table).toggle();

            // Toggle expand/collapse
            if ($(this).html().indexOf(UIStrings.tableExpand) < 0) {
                toggleSelectorstyle($(this), Selectors.tableCollapsedClassName, Selectors.tableExpandedClassName);
                $(this).text(UIStrings.tableExpand);
                $(this).attr("title", UIStrings.tableExpand);
            } else {
                toggleSelectorstyle($(this), Selectors.tableExpandedClassName, Selectors.tableCollapsedClassName);
                $(this).text(UIStrings.tableCollapse);
                $(this).attr("title", UIStrings.tableCollapse);
            }
        });

        // Adjust float right images
        $(ele).find(Selectors.tnoneClass).parent().css("float", "none");

        // Make internal links in the article can be search through Wikipedia when click them.
        var internalLinks = $(ele).find(Selectors.internalLinkSelector);

        internalLinks.each(function () {
            var url = this.getAttribute("href");
            var id = StrUtil.parseIDFromUrl(url);
            this.setAttribute("id", id);
            this.removeAttribute("href");
            $(this).attr("onclick", "Navigation.updateArticle('" + id + "')");
            $(this).addClass(Selectors.linksClassName);
        });
    };

    // Resize the content inside the element
    this.resizeHTMLContent = function (element) {
        if (element.outerWidth() > window.innerWidth) {
            element.width("100%");
            element.height("100%");
            UI.resizeHTMLContent(element.parent());
        }
    }

    // Show the welcome page
    this.showSplashPage = function () {
        UI.hideFullArticleButton();
        $(Selectors.logo).addClass(Selectors.splashClassName);
        $(Selectors.searchBar).val(UIStrings.welcomeMessage);
        $(Selectors.searchBar).addClass(Selectors.splashHintClassName);
    };

    // Show the image insert button
    this.showBottomBar = function (img) {
        $(img).next().stop().animate({ top: "0px" }, { queue: false, duration: 200 });
    };

    // Hide the image insert button
    this.hideBottomBar = function (img) {
        imageClick = false;
        $(Selectors.insertImage).stop().animate({ top: "30px" }, { queue: false, duration: 100 });
        $(Selectors.imgToInsert).val(StrUtil.empty);
    };

    // Show the text insert button when the user moused up.
    // Parameters
    //      (x,y): the coordinate of the highlight selection text.
    this.showTextInsertionButton = function (x, y) {
        if (y < articlePaneAdjustment) {
            // If the selected text's y coordinate is above the content area, 
            // show the insert button in the left and top of the content.
            x = 10;
            y = articlePaneAdjustment;
        }

        $(Selectors.insertText).css("top", y - $(Selectors.insertText).height());
        // +5 to prevent the insert button from being overlapped by the agave boundary
        $(Selectors.insertText).css("left", x - $(Selectors.insertText).width() / 2 + 5);
        $(Selectors.insertText).addClass(Selectors.clickableClassName);
        $(Selectors.insertText).fadeIn("fast");
        showInsertTextButton = true;
    };

    // Hide the text insert button.
    this.hideTextInsertionButton = function () {
        $(Selectors.insertText).fadeOut("fast");
        showInsertTextButton = false;
    };

    // Write the content of current state into the html page
    this.writeFirstPage = function (ele) {
        var title = ele.topic;
        var articleText = ele.article;

        $(Selectors.logo).removeClass(Selectors.splashClassName);
        $(Selectors.searchBar).val(title);
        $(Selectors.article).html(StrUtil.replaceDoubleBackSlashWithHTTPS(articleText));
        UI.scrollReset();
        // Process the article content
        UI.processSection($(Selectors.article));

        if (!ele.hasCorrespondingWikiPage()) {
            UI.hideFullArticleButton();
        } else {
            UI.showFullArticleButton();
        }

        if (ele.belongsToAnArticle()) {
            UI.showActionButtons();
        } else {
            UI.hideActionButtons();
        }

        if (ele.isSearch()) {
            UI.showSuggestionMessage();
        } else {
            UI.hideSuggestionMessage();
        }

        if (ele.isSplash()) {
            UI.hideBackButton();
        } else {
            UI.showBackButton();
        }

        if (window.freshSearch) {
            // Hide all submenu tabs.
            UI.hideSectionTab();
            UI.hideImageTab();
            UI.hideInfoboxTab();
            UI.removeReferenceTab();

            if (!ele.isSearch()) {
                UI.moveUpArticleContent();
            }

            // If there are tocs, show the section tab.
            if (ele.toc) {
                var tocs = $("<div>" + ele.toc + "</div>").find(Selectors.tocItemClass);
                if (tocs.length === 1) {
                    var expandArticle = $(Selectors.article).find(Selectors.toggleArticleButton);
                    // Remove expand article button if there is no more article.
                    expandArticle.remove();
                } else if (tocs.length > 2 || tocs.length === 2 && tocs[1].title !== UIStrings.seeAlsoHeader) {
                    UI.showSectionTab();
                    UI.showImageTab();
                }
            }

            // If there is an infobox in the article, 
            // show it again and save the infobox so that it can be accessable from any tab.
            if (articleText.indexOf(Selectors.infoboxClassName) >= 0) {
                UI.showInfoboxTab();
                GlobalVars.currState.articleInfobox = $("<div>" + articleText + "</div>").find(Selectors.infoBox).html();
            } else if (ele.articleInfobox !== "") {
                UI.showInfoboxTab();
            }

            // If there are references for the article, update the tab and show it again.
            if (ele.referenceID !== 0) {
                UI.addReferenceTab(ele.referenceID);
            }

            infoboxAutoexpand = false;
            window.freshSearch = false;
        }

        // Update the submenu tabs
        updateTabs();
    };

    // Make the scroll be the top of content area.
    this.scrollReset = function () {
        $(Selectors.content).scrollTop(0);
    };

    // Show the suggestion area if the search term has suggestion articles
    this.showSuggestionMessage = function () {
        $(Selectors.suggests).show();
        $(Selectors.content).height($(Selectors.content).height() - $(Selectors.suggests).height());
        UI.moveDownArticleContent();
    };

    // Hide the suggestion area
    this.hideSuggestionMessage = function () {
        $(Selectors.content).height($(Selectors.content).height() + $(Selectors.suggests).height());
        $(Selectors.suggests).hide();
    };

    // Show the back button if the state stack has history pages.
    this.showBackButton = function () {
        toggleSelectorstyle($(Selectors.searchArea), Selectors.hideBackButtonClassName, Selectors.showBackButtonClassName);
        toggleSelectorstyle($(Selectors.searchBarArea), Selectors.hideBackButtonClassName, Selectors.showBackButtonClassName);
        $(Selectors.backButton).show();
    };

    // Hide back button if there is in the welcome page.
    this.hideBackButton = function () {
        $(Selectors.backButton).hide();
        toggleSelectorstyle($(Selectors.searchArea), Selectors.showBackButtonClassName, Selectors.hideBackButtonClassName);
        toggleSelectorstyle($(Selectors.searchBarArea), Selectors.showBackButtonClassName, Selectors.hideBackButtonClassName);
    };

    // Show or hide the submenu tabs
    this.showActionButtons = function () {
        toggleSelectorstyle($(Selectors.actions), Selectors.hideActionsClassName, Selectors.showActionsClassName);
    };

    this.hideActionButtons = function () {
        toggleSelectorstyle($(Selectors.actions), Selectors.showActionsClassName, Selectors.hideActionsClassName);
    };

    // Show or hide the full article button
    this.showFullArticleButton = function () {
        $(Selectors.fullArticleButton).addClass(Selectors.visibleClassName);
    };

    this.hideFullArticleButton = function () {
        $(Selectors.fullArticleButton).removeClass(Selectors.visibleClassName);
    };

    // Get the content displayed in the current page
    this.getCurrentArticleView = function () {
        return $(Selectors.article).html();
    };

    // Judge if the auto search checkbox has been selected
    this.autoSearchIsOn = function () {
        if (Office.context === undefined || Office.context.document.settings.get(UIStrings.autosearch) === null) {
            return true;
        } else {
            return Office.context.document.settings.get(UIStrings.autosearch);
        }
    };

    // Init the auto search status
    this.autoSearchInit = function () {
        if (UI.autoSearchIsOn()) {
            CheckboxUtil.checkBoxCheck();
        } else {
            CheckboxUtil.checkBoxNotCheck();
        }
    };

    // Changes the UI to reflect the autosearch status
    this.toggleAutoSearch = function () {
        if (UI.autoSearchIsOn()) {
            CheckboxUtil.checkBoxNotCheck();
            Office.context.document.settings.set(UIStrings.autosearch, false);
        } else {
            CheckboxUtil.checkBoxCheck();
            Office.context.document.settings.set(UIStrings.autosearch, true);
        }
        Office.context.document.settings.saveAsync();
    };

    // Gets the table's infobox html, wraps it in a table so it renders 
    // properly, and display it.
    this.createInfoBoxView = function () {
        if ($(Selectors.infoBox)) {
            if (!infoboxAutoexpand) {
                GlobalVars.currState.articleInfobox = $(CodeSnippet.wrapInInfoBox(GlobalVars.currState.articleInfobox)).wrap("<div/>");
                var tables = $(GlobalVars.currState.articleInfobox).find("table");

                tables.each(function () {
                    var table = $(this);

                    if (!table.hasClass(Selectors.tableAutoExpandClassName)) {
                        table.addClass(Selectors.tableAutoExpandClassName);
                    }
                });

                infoboxAutoexpand = true;
            }

            GlobalVars.nextState = State.newInfoBoxView(GlobalVars.currState.articleInfobox.parent().html());
            GlobalVars.nextState.writeToPage(true);
            $(Selectors.tableAutoExpand).show();
        }
    };

    // Release focus from any text boxes as it shows through and show the loading screen
    this.showLoadingScreen = function () {
        $(Selectors.loading).fadeIn();
    };

    // Fades the loading screen away and scrolls the article to the top of 
    // the displayed content.
    this.hideLoadingScreen = function () {
        $(Selectors.content).height(window.innerHeight - articlePaneAdjustment);
        $(Selectors.loading).fadeOut();
    };

    // Show the loading screen cover the image which is inserting.
    this.showInsertLoadingImage = function (frame, image) {
        $(Selectors.insertImgLoading).width(frame.width());
        $(Selectors.insertImgLoading).height(frame.height());
    };

    this.hideInsertLoadingImage = function () {
        $(Selectors.insertImgLoading).remove();
    };

    // Show the reference submenu tab in the submenu area if the article has references.
    this.addReferenceTab = function (sectionID) {
        // Show the reference page of the article when click the reference tab
        $(Selectors.referenceButton).click(function () {
            if (GlobalVars.currState.type !== State.TypeEnum.reference) {
                Navigation.updateReference(sectionID);
            }
        });

        $(Selectors.referenceButton).keydown(function (e) {
            if (e.keyCode === 13) {
                if (GlobalVars.currState.type !== State.TypeEnum.reference) {
                    Navigation.updateReference(sectionID);
                }
            }
        });

        toggleSelectorstyle($(Selectors.referenceButton).parent().parent(), Selectors.hideTabClassName, Selectors.showTabClassName);
        $(Selectors.referenceButton).show();

        if (!GlobalVars.hasSubmenu) {
            UI.moveDownArticleContent();
            GlobalVars.hasSubmenu = true;
        }
    };

    // Removes the references tab from the screen
    this.removeReferenceTab = function () {
        $(Selectors.referenceButton).unbind("click");
        $(Selectors.referenceButton).hide();
        toggleSelectorstyle($(Selectors.referenceButton).parent().parent(), Selectors.showTabClassName, Selectors.hideTabClassName);
    };

    // Show or hide the infoxbox submenu tab in the submenu area if the article has infobox.
    this.showInfoboxTab = function () {
        toggleSelectorstyle($(Selectors.infoboxButton).parent().parent(), Selectors.hideTabClassName, Selectors.showTabClassName);
        $(Selectors.infoboxButton).show();

        if (!GlobalVars.hasSubmenu) {
            UI.moveDownArticleContent();
            GlobalVars.hasSubmenu = true;
        }
    };

    this.hideInfoboxTab = function () {
        $(Selectors.infoboxButton).hide();
        toggleSelectorstyle($(Selectors.infoboxButton).parent().parent(), Selectors.showTabClassName, Selectors.hideTabClassName);
    };

    // Show or hide the section submenu tab in the submenu area.
    this.showSectionTab = function () {
        toggleSelectorstyle($(Selectors.sectionsButton).parent().parent(), Selectors.hideTabClassName, Selectors.showTabClassName);
        $(Selectors.sectionsButton).show();

        if (!GlobalVars.hasSubmenu) {
            UI.moveDownArticleContent();
            GlobalVars.hasSubmenu = true;
        }
    };

    this.hideSectionTab = function () {
        $(Selectors.sectionsButton).hide();
        toggleSelectorstyle($(Selectors.sectionsButton).parent().parent(), Selectors.showTabClassName, Selectors.hideTabClassName);
    };

    // Show or hide the images submenu tab in the submenu area.
    this.showImageTab = function () {
        toggleSelectorstyle($(Selectors.imagesButton).parent().parent(), Selectors.hideTabClassName, Selectors.showTabClassName);
        $(Selectors.imagesButton).show();

        if (!GlobalVars.hasSubmenu) {
            UI.moveDownArticleContent();
            GlobalVars.hasSubmenu = true;
        }
    };

    this.hideImageTab = function () {
        $(Selectors.imagesButton).hide();
        toggleSelectorstyle($(Selectors.imagesButton).parent().parent(), Selectors.showTabClassName, Selectors.hideTabClassName);
    };

    // Adjust content area if there is no submenu tabs show.
    this.moveUpArticleContent = function () {
        GlobalVars.hasSubmenu = false;
        toggleSelectorstyle($(Selectors.content), Selectors.contentDownClassName, Selectors.contentUpClassName);
    };

    this.moveDownArticleContent = function () {
        toggleSelectorstyle($(Selectors.content), Selectors.contentUpClassName, Selectors.contentDownClassName);
    };

    // If the submenu tab selection changes, color the new selected submenu
    // tab and reset the previous selected submenu tab.
    this.selectCurrStateSubmenu = function (select) {
        if (select) {
            switch (GlobalVars.currState.type) {
                case State.TypeEnum.toc:
                    SubmenuStyle.submenuSelected($(Selectors.sectionsButton));
                    break;
                case State.TypeEnum.images:
                    SubmenuStyle.submenuSelected($(Selectors.imagesButton));
                    break;
                case State.TypeEnum.infobox:
                    SubmenuStyle.submenuSelected($(Selectors.infoboxButton));
                    break;
                case State.TypeEnum.reference:
                    SubmenuStyle.submenuSelected($(Selectors.referenceButton));
                    break;
                default:
                    break;
            }
        } else {
            switch (GlobalVars.currState.type) {
                case State.TypeEnum.toc:
                    SubmenuStyle.submenuNotSelected($(Selectors.sectionsButton));
                    break;
                case State.TypeEnum.images:
                    SubmenuStyle.submenuNotSelected($(Selectors.imagesButton));
                    break;
                case State.TypeEnum.infobox:
                    SubmenuStyle.submenuNotSelected($(Selectors.infoboxButton));
                    break;
                case State.TypeEnum.reference:
                    SubmenuStyle.submenuNotSelected($(Selectors.referenceButton));
                    break;
                default:
                    break;
            }
        }
    };

    // Expand or contract the whole article
    this.toggleArticleButton = function () {
        var label = $(Selectors.toggleArticleButton).text();
        if (label === UIStrings.expandArticle) {
            $(Selectors.expandedSections).show();
            $(Selectors.toggleArticleButton).text(UIStrings.contractArticle);
            $(Selectors.toggleArticleButton).attr("title", UIStrings.contractArticle);
        } else {
            $(Selectors.expandedSections).hide();
            $(Selectors.toggleArticleButton).text(UIStrings.expandArticle);
            $(Selectors.toggleArticleButton).attr("title", UIStrings.expandArticle);
        }
    };

    // Add the expanded area for the article content
    this.activateArticleExpansionContainer = function () {
        if ($(Selectors.expandedSections).length === 0) {
            $(CodeSnippet.expandedSectionsContainer()).insertBefore(Selectors.toggleArticleButton);

            return true;
        }

        return false;
    };

    // Write the extra article content into the expanded area
    this.writeToArticleExpansionContainer = function (toWrite) {
        UI.scrollReset();
        $(Selectors.expandedSections).html(toWrite);
        this.processSection(Selectors.expandedSections);
    };

}();

// Client is using to interact with office client
var Client = new function () {
    var _doc;
    var ignoreDocument = false;

    // Init method called when user insert the Wikipedia app into the Office client
    this.init = function () {
        _doc = Office.context.document;

        _doc.addHandlerAsync(Office.EventType.DocumentSelectionChanged, function () {
            // Hide the about and error toast pane
            UI.aboutExit();
            UI.errorExit();

            Client.tryUpdatingSelectedWord(UI.autoSearchIsOn(), 0);
        });
    };

    // Executes when event is raised on user's selection changes, and at initialization time. 
    // Gets the current selection and passes that to asynchronous callback method.
    this.tryUpdatingSelectedWord = function (autoSearchIsOn, milliSecond) {
        if (_doc.customXmlParts) {
            // Handle the selection changed event of the word, the selection's type is text
            _doc.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) {
                if (ignoreDocument) {
                    // If auto search is on, after user insert the text or image, the app will
                    // search the highlighted text or image just insert.
                    // This handles the case where text and image is inserted and automatically highlighted.
                    ignoreDocument = false;
                    return;
                }

                if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                    if (StrUtil.trimWhiteSpace(asyncResult.value) === StrUtil.empty) {
                        return;
                    }

                    // If the search term's length is larger than maxlength attribute the 
                    // search input bar set, the app will tell error. Or the search bar will be 
                    // updated and can be auto search if the auto search is on.
                    if (asyncResult.value.length <= $(Selectors.searchBar).attr("maxlength")) {
                        UI.updateSearchBar(asyncResult.value);

                        if (autoSearchIsOn) {
                            setTimeout(function () { Navigation.updateArticleFromSearchBar(true) }, milliSecond);
                        }
                    } else {
                        // The search text is limited to 100 characters.
                        UI.writeError(UIStrings.searchKeywordLimitMessage, ErrorType.searchKeywordLimited);
                    }
                }
            });
        } else {
            // Handle the selection changed event of the excel, the selection's type is matrix
            _doc.getSelectedDataAsync(Office.CoercionType.Matrix, function (asyncResult) {
                if (ignoreDocument) {
                    ignoreDocument = false;
                    return;
                }

                if (asyncResult.status === Office.AsyncResultStatus.Succeeded && asyncResult.value
                        && asyncResult.value.length === 1 && asyncResult.value[0].length === 1) {
                    var result = asyncResult.value[0][0];

                    // if the type of asyncResult.value[0][0] is number, change it to string type.
                    if (typeof result === "number") {
                        result = result.toString();
                    }
                    
                    if (StrUtil.trimWhiteSpace(result) === StrUtil.empty) {
                        return;
                    }

                    if (result.length <= $(Selectors.searchBar).attr("maxlength")) {
                        UI.updateSearchBar(result);

                        if (autoSearchIsOn) {
                            setTimeout(function () { Navigation.updateArticleFromSearchBar(true) }, milliSecond);
                        }
                    } else {
                        // The search text is limited to 100 characters.
                        UI.writeError(UIStrings.searchKeywordLimitMessage, ErrorType.searchKeywordLimited);
                    }
                }
            });
        }
    };

    // Insert things into the office client
    // Parameters
    //      toBeInserted: the content to be inserted
    //      cType: the type of content to be inserted.
    function insert(toBeInserted, cType) {
        if (_doc.mode === Office.DocumentMode.ReadOnly) {
            UI.writeError(Errors.docCodeError, ErrorType.error);
            return;
        }

        _doc.setSelectedDataAsync(toBeInserted, { coercionType: cType }, function (asyncResult) {
            ignoreDocument = true;

            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                if (asyncResult.error.code === 2002) {
                    UI.writeError(Errors.textInsertionFailureForMultiCell, ErrorType.error);
                } else {
                    UI.writeError(asyncResult.error.message, ErrorType.error);
                }
            }

            UI.hideInsertLoadingImage();
        });
    }

    // Inserts highlighted text into the document at the cursor.
    // Parameters(text): the text to place into the document.
    this.insertText = function (text) {
        if (Office.context.document.customXmlParts) {
            var textInHTML = "<html><head><body><br/>"
                + CodeSnippet.insertText(text, GlobalVars.currState.topic)
                + "<br/></body></html>";
            insert(textInHTML, Office.CoercionType.Html);
        } else {
            var excelText = text.trim() + "\n" + UIStrings.source + GlobalVars.currState.topic +
                " - https://" + LANGUAGE + ".wikipedia.org";
            insert(excelText, Office.CoercionType.Text);
        }
    };

    // Insert image into Office client
    this.insertImage = function (fullHTML) {
        insert(fullHTML, Office.CoercionType.Html);
    };
}();

// The initialize function must be run each time a new page is loaded
Office.initialize = function (reason) {
    // Checks for the DOM to load using the jQuery ready function.
    $(document).ready(function () {

        // After the DOM is loaded, app-specific code can run.
        // Display initialization reason.

        // Initial Wikipedia sandbox
        SandboxInteraction.initialSandbox();
        window.addEventListener("message", SandboxInteraction.sandboxEventListener, false);

        // Initial Office Client and then Agave UI
        // In both of init() methods, AppsTelemetry.sendLog is called. 
        // So AppsTelemetry.init needs to be put ahead of them.
        Client.init();
        UI.init();

        // App is opened from dictionary
        // The timeout is used to wait the sandbox page is ready.
        // Consider the differnt network condition and set the timetout to 1 second.
        Client.tryUpdatingSelectedWord(true, 1000);
    });
};
