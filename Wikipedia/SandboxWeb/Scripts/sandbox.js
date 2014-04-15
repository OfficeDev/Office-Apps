/* **************************************************************************************
Copyright (c), Microsoft Open Technologies, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***************************************************************************************** */

var Selectors = {
    clickableClassName: "ms_osf_clickable",
    // Section toc classes
    tocClassName: "ms_osf_toc",
    tocItemClassName: "ms_osf_tocItem",
    // Image classes
    imageClassName: "image",
    imageTableClassName: "img_table",
    imageContainerClassName: "ms_osf_imageContainer",
    // Category classes
    categoryMemberClassName: "ms_osf_categoryMember",
    // Search result classes
    searchResultClassName: "ms_osf_searchResult",
    searchTitleClassName: "ms_osf_searchTitle",
    searchSnippetClassName: "ms_osf_snippet",
    searchResultCountClassName: "ms_osf_searchResultCount",
};

// Used to filter out undesired images or other media that would otherwise 
// take up space in the images panel.
var ImageCheck = new function () {
    var list = ["jpg", "jpeg", "exif", "tiff", "raw", "png", "gif", "bmp", "svg"];
    // In Wikipedia "relevant" images are formatted 
    // exactly the same as icons and other meta-images. Here are some regex that
    // encapsulate the file formats of many of the informational images so that
    // they can be removed.
    var notShown = [/(\d*px-)?Ambox_.*\.(svg|png)/,
                    /\d*px-Commons-logo\.svg/,
                    /\d*px-Portal-puzzle\.svg/,
                    /\d*px-Padlock-.*\.svg/,
                    /\d*px-Symbol_book_class2\.svg/,
                    /\d*px-Wikiquote-logo\.svg/,
                    /\d*px-Increase_Negative\.svg/,
                    /\d*px-Folder_Hexagonal_Icon\.svg/,
                    /\d*px-Office-book\.svg/,
                    /\d*px-Text-x-.*.svg/,
                    /\d*px-Wiktionary-logo-([a-zA-Z]{2})?(-noslogan)?\.svg/,
                    /\d*px-Wikispecies-logo(-[a-zA-Z]{2})?(-noslogan)?\.svg/,
                    /\d*px-Wikibooks-logo(-[a-zA-Z]{2})?(-noslogan)?\.svg/,
                    /\d*px-Wikinews-logo(-[a-zA-Z]{2})?(-noslogan)?\.svg/,
                    /\d*px-Wikisource-logo(-[a-zA-Z]{2})?(-noslogan)?.svg/,
                    /\d*px-Wikiversity-logo(-[a-zA-Z]{2})?(-noslogan)?.svg/,
                    /\d*px-Wikiquote-logo(-[a-zA-Z]{2})?(-noslogan)?\.svg/,
                    /\d*px-People_icon(-[a-zA-Z]{2})?(-noslogan)?.svg/,
                    /\d*px-Openstreetmap_logo(-[a-zA-Z]{2})?(-noslogan)?.svg/,
                    /\d*px-(Loud)?[sS]peaker(link)?(_Icon)?(-[a-zA-Z]{2})?(-noslogan)?.svg/,
                    /[cC]rystal_[cC]lear_app_browser\.png/,
                    /\d*px-.*-icon.svg/,
                    /\d*px-P_.*\.svg/,
                    /\d*px-Symbol_support_vote.svg/,
                    /\d*px-US-.*_insignia.svg/,
                    /\d*px-(Increase|Decrease|Steady)\d.svg/,
                    /\d*px-Wiki_letter_w(_.*)?\.svg/,
                    /\d*px-Question_book(-new)?\.svg/,
                    /\d*px-Edit(-clear)?.svg/,
                    /\d*px-.*-featured.svg/,
                    /Nuvola_apps_.*/,
                    /Compass_rose_.*-[\d]*x[\d]*\./,
                    /\d*px-Boxed_.*_arrow\.svg/,
                    /\d*px-([sS]outh|[nN]orth|[eE]ast|[wW]est)\.svg/,
                    /\d*px-Symbol_list_class\.svg/,
                    /\d*px-Terrestrial_globe\.svg/,
                    /\d*px-Gnome-globe.svg/,
                    /\d*px-Factory_.*\.svg/,
                    /\d*px-Disambig(-|_).*\.svg/,
                    /\d*px-Gnome-mime.*\.svg/,
                    /Magnify-clip.png/,
                    /\d*px-Gtk-.*\.svg/];
    var notShownLength = notShown.length;

    // Checks the extension of a file to see if it is an image. Only 
    // allows media to be displayed that by default render as images in IE9.
    // Returns an appropriate boolean.
    // Parameters:
    //      url: The file that needs to be checked.
    this.isImage = function (url) {
        if (!url) {
            return false;
        }

        var ext = StrUtil.getExtension(url);

        return list.indexOf(ext) > -1;
    };

    // Make sure a given file is not blacklisted for removal. Returns true if
    // the image is article-specific, false if it is a common Wikipedia/media image.
    // Parameters:
    //      url: The file that needs to be checked.
    this.notWikimediaImage = function (url) {
        var imageAllowed = true;

        for (var index = 0; imageAllowed && index < notShownLength; index++) {
            if (notShown[index].test(url)) {
                imageAllowed = false;
            }
        }

        return imageAllowed;
    };
}();

var StrUtil = {
    empty: "",

    trimWhiteSpace: function (str) {
        return str.replace(/^\s+|\s+$/g, "");
    },

    startsWith: function (original, prefix) {
        return StrUtil.trimWhiteSpace(original).indexOf(prefix) === 0;
    },

    processURI: function (term) {
        return encodeURIComponent(decodeURIComponent(term));
    },

    escapeQuotes: function (term) {
        return term.replace(/'/g, "\\'").replace(/"/g, '\\"');
    },

    replaceDoubleBackSlashWithHTTPS: function (str) {
        if (str && typeof str === "string") {
            return str.replace(/src="\/\//g, "src=\"https://").replace(/href="\/\//g, "href=\"https://");
        } else {
            return str;
        }
    },

    getExtension: function (url) {
        var postfix = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
        return postfix.lastIndexOf("/") > -1 ? postfix.substring(0, postfix.length - 1) : postfix;
    }
}

// These functions construct html content for the app
var CodeSnippet = {
    // The chapter(table of content) html content in Sections submenu
    newTOCEntry: function (obj) {
        if (obj.toclevel > 1) {
            return StrUtil.empty;
        }

        var entryDiv = document.createElement("div");

        entryDiv.setAttribute("class", Selectors.clickableClassName + " " + Selectors.tocItemClassName + " " + Selectors.tocClassName + obj.toclevel);
        entryDiv.setAttribute("onclick", "Navigation.updateSection(\"" + obj.index + "\")");        
        entryDiv.setAttribute("title", obj.line);
        entryDiv.setAttribute("tabindex", 100 + parseInt(obj.index));
        entryDiv.appendChild(document.createTextNode(obj.line));

        return entryDiv.outerHTML;
    },

    // The image html content in Images submenu
    newImageGrouping: function (img, url, title, size) {
        var imageGroupDiv = document.createElement("div");
        var imageLink = document.createElement("a");
        var image = document.createElement("img");

        image.setAttribute("src", img);
        image.setAttribute("alt", title);
        image.setAttribute("class", Selectors.imageTableClassName);
        imageLink.setAttribute("class", Selectors.imageClassName);
        imageLink.innerHTML = (image.outerHTML + CodeSnippet.storeDetailUrl(url)).toString();
        imageGroupDiv.setAttribute("style", "width:" + size + "px; max-width:96%");
        imageGroupDiv.setAttribute("class", Selectors.imageContainerClassName);
        imageGroupDiv.appendChild(imageLink);

        return imageGroupDiv.outerHTML;
    },

    // The hidden input html content in Images submenu
    storeDetailUrl: function (wikiUrl) {
        var input = document.createElement("input");

        if (wikiUrl.indexOf("https://") < 0) {
            wikiUrl = UIStrings.wikiMainURL + wikiUrl;
        }
        input.setAttribute("type", "hidden");
        input.setAttribute("value", "wikiUrl");

        return input.outerHTML;
    },

    // The new search html content when there is ambiguous meanings of search string
    newSearchSnippets: function (ele) {
        var searchResultDiv = document.createElement("div");
        var searchTitleDiv = document.createElement("div");
        var searchSnippetDiv = document.createElement("div");

        searchTitleDiv.setAttribute("class", Selectors.clickableClassName + " " + Selectors.searchTitleClassName);
        searchTitleDiv.setAttribute("onclick", "Navigation.updateArticle(\'" + StrUtil.escapeQuotes(ele.title) + "\')");
        searchTitleDiv.appendChild(document.createTextNode(ele.title));
        searchSnippetDiv.setAttribute("class", Selectors.searchSnippetClassName);
        searchSnippetDiv.innerHTML = ele.snippet;
        searchResultDiv.setAttribute("class", Selectors.searchResultClassName);
        searchResultDiv.appendChild(searchTitleDiv);
        searchResultDiv.appendChild(searchSnippetDiv);

        return searchResultDiv.outerHTML;
    },

    // The total html content of suggested results
    newSearchResultTotal: function (total, searchTerm) {
        var searchResultCountDiv = document.createElement("div");

        searchResultCountDiv.setAttribute("class", Selectors.clickableClassName);
        searchResultCountDiv.setAttribute("id", Selectors.searchResultCountClassName);
        searchResultCountDiv.setAttribute("onclick", "Navigation.openArticleInBrowser()");
        searchResultCountDiv.appendChild(document.createTextNode(UIStrings.searchResult(total)));

        return searchResultCountDiv.outerHTML;
    },

    newCatMemberEntry: function (title) {
        var newCatMemberEntryDiv = document.createElement("div");

        newCatMemberEntryDiv.setAttribute("class", Selectors.clickableClassName + " " + Selectors.categoryMemberClassName);
        newCatMemberEntryDiv.setAttribute("onclick", "Navigation.updateArticle(\'" + StrUtil.escapeQuotes(title) + "\')");
        newCatMemberEntryDiv.appendChild(document.createTextNode(title));

        return newCatMemberEntryDiv.outerHTML;
    },

    subcategoryTitle: function () {
        var subcategoryTitle = document.createElement("h2");

        subcategoryTitle.appendChild(document.createTextNode(UIStrings.subcategoryHeading));

        return subcategoryTitle.outerHTML;
    },

    categoryPagesTitle: function () {
        var categoryPagesTitle = document.createElement("h2");

        categoryPagesTitle.appendChild(document.createTextNode(UIStrings.categoryPagesTitle));

        return categoryPagesTitle.outerHTML;
    }
};

var WikipediaAppInteraction = {
    wikipediaHostURL: "",

    wikipediaSearchTitle: "",

    wikipediaSequenceNo: 0,

    initial: function () {
        // Check sandobx url and assign hosting url
        var hostUrl = document.location.hostname.toLowerCase();

        // test environment url
        // for production, the Wikipedia page and sandbox page
        // will be hosted on different domains
        if (hostUrl.indexOf("localhost") != -1) {
            WikipediaAppInteraction.wikipediaHostURL = "http://localhost:22712";
        }
    },

    wikipediaPostMessage: function (message, sequenceNo) {
        if (WikipediaAppInteraction.wikipediaSequenceNo === sequenceNo) {
            var messageSent = { "message": message, "sequence": sequenceNo };
            parent.postMessage(JSON.stringify(messageSent), WikipediaAppInteraction.wikipediaHostURL);
        }
    },

    wikipediaEventListener: function (event) {
        if (event.origin !== WikipediaAppInteraction.wikipediaHostURL) {
            return;
        }

        var messageJson;

        try{
            messageJson = JSON.parse(event.data);
        } catch (err) {
            postErrorMessage(Errors.JsonParseError, WikipediaAppInteraction + 1);
        }

        WikipediaAppInteraction.wikipediaSequenceNo = messageJson.sequence;

        switch (messageJson.message.function) {
            case "updateArticle":
                WikipediaAppInteraction.wikipediaSearchTitle = messageJson.message.title;       

                if (Wikipedia.isCategoryQuery(WikipediaAppInteraction.wikipediaSearchTitle)) {
                    Wikipedia.getCategoryMembers(WikipediaAppInteraction.wikipediaSearchTitle, JSONParser.updateCategoryCallback);
                } else {
                    // Get the introduction chapter of the article from Wikipedia
                    Wikipedia.getHTMLBySectionAsync(WikipediaAppInteraction.wikipediaSearchTitle, Wikipedia.INTRODUCTION_SECTION_ID, JSONParser.updateSectionCallback);
                    // Get the chapters(table of content) of the article from Wikipedia
                    Wikipedia.getTableOfContentAsync(WikipediaAppInteraction.wikipediaSearchTitle, JSONParser.updateTocCallback);
                }

                break;
            case "expandArticle":
                Wikipedia.getEntireArticle(messageJson.message.title, JSONParser.expandArticleCallback);

                break;
            case "updateSection":
                WikipediaAppInteraction.wikipediaSearchTitle = messageJson.message.title;    

                Wikipedia.getHTMLBySectionAsync(messageJson.message.title, messageJson.message.sectionID, JSONParser.updateSectionCallback);

                break;
            case "updateImagesGrid":
                Wikipedia.getImagesForArticle(messageJson.message.title, JSONParser.updateImagesGridCallback);

                break;
            case "updateFullSizedPicture":
                Wikipedia.getImage(messageJson.message.title, messageJson.message.maxImageWidth, JSONParser.updateFullSizedPictureCallback);

                break;
            case "updateReference":
                Wikipedia.getReferenceSectionForArticle(messageJson.message.title, messageJson.message.sectionID, JSONParser.updateReferenceCallback);

                break;
        }
    },

    postContentMessage: function (callbackName, content, sequenceNo) {
        var message = { "callback": callbackName, "content": content };
        WikipediaAppInteraction.wikipediaPostMessage(message, sequenceNo);
    },

    postTocMessage: function (callbackName, toc, tocLength, lastToc, referenceID, redirectTitle, sequenceNo) {
        var message;
        if (referenceID !== 0) {
            message = {
                "callback": callbackName, "toc": toc, "tocLength": tocLength,
                "lastToc": lastToc, "referenceID": referenceID, "redirectTitle": redirectTitle
            };
        } else {
            message = {
                "callback": callbackName, "toc": toc, "tocLength": tocLength,
                "lastToc": lastToc, "redirectTitle": redirectTitle
            };
        }
        WikipediaAppInteraction.wikipediaPostMessage(message, sequenceNo);
    },

    postFullSizeImageMessage: function (imgUrl, fileName, detailUrl, sequenceNo) {
        var message = {
            "callback": "updateFullSizedPictureCallback", "imgUrl": imgUrl,
            "fileName": fileName, "detailUrl": detailUrl
        };
        WikipediaAppInteraction.wikipediaPostMessage(message, sequenceNo);
    },

    postErrorMessage: function (errorMessage, sequenceNo) {
        var message = { "callback": "error", "errorMessage": errorMessage };
        WikipediaAppInteraction.wikipediaPostMessage(message, sequenceNo);
    },

    postNoResultMessage: function (errorMessage, sequenceNo) {
        var message = { "callback": "noResult", "errorMessage": errorMessage };
        WikipediaAppInteraction.wikipediaPostMessage(message, sequenceNo);
    },

    postSearchCancelMessage: function (sequenceNo) {
        var message = { "callback": "searchCancel" };
        WikipediaAppInteraction.wikipediaPostMessage(message, sequenceNo);
    }
}

// The functions in Wikipedia are used to query article content through Wikipedia's API.
var Wikipedia = new function () {
    this.INTRODUCTION_SECTION_ID = "0";
    var wikiAPIEntry = "https://" + LANGUAGE + ".wikipedia.org/w/api.php?format=json&";
    // Prefix for all images.
    this.filePrefix = "File:";
    this.categoryPrefix = "Category:";

    // Query Wikipedia.
    // Parameters:
    //      address: query url
    //      callback: the result of the query after success
    function makeQuery(address, callback) {
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;

        if (address.length <= 0) {
            return;
        }

        // Using query ajax function to query Wikipedie. Get async result to callback when query succeeds,
        // and get error status when query fails.
        $.ajax({
            url: address,
            dataType: "jsonp",
            timeout: 30000,
            success: callback,
            error: function (xhr) {
                if (xhr.statusText === "timeout") {
                    WikipediaAppInteraction.postErrorMessage(Errors.timeout, sequenceNo);
                } else {
                    WikipediaAppInteraction.postErrorMessage(Errors.wikipedia, sequenceNo);
                }
            }
        });
    }

    // Query HTML content for specific search title
    // Parameters:
    //      pageTitle: the search string
    //      sectionID: the chapter id of the searching article
    //      callback: the query result
    this.getHTMLBySectionAsync = function (pageTitle, sectionID, callback) {
        var _queryString = wikiAPIEntry + "action=parse&redirects&prop=text&mobileformat=html";
        var query = _queryString + "&page=" + StrUtil.processURI(pageTitle) + "&section=" + sectionID;

        makeQuery(query, callback);
    };

    // Query chapters(table of content) of the article
    this.getTableOfContentAsync = function (pageTitle, callback) {
        var _queryString = wikiAPIEntry + "action=mobileview&redirects&prop=sections|normalizedtitle&sectionprop=toclevel|line|index&page=";

        makeQuery(_queryString + StrUtil.processURI(pageTitle), callback);
    };

    // Query HTML content for the entire article
    this.getEntireArticle = function (pageTitle, callback) {
        var _queryString = wikiAPIEntry + "action=mobileview&prop=text&sections=all&redirect=yes&page=";

        makeQuery(_queryString + StrUtil.processURI(pageTitle), callback);
    };

    // Query all images of the article
    this.getImagesForArticle = function (title, callback) {
        var _queryString = wikiAPIEntry + "action=query&prop=images&imlimit=500&redirects=&titles=";
        makeQuery(_queryString + StrUtil.processURI(title), callback);
    };

    // Query the specific full size image
    // Parameters:
    //      title: image title
    //      widthLimit: image's maximum width
    this.getImage = function (title, widthLimit, callback) {
        var _queryString = wikiAPIEntry + "action=query&prop=imageinfo&iiprop=url|parsedcomment&iilimit=1&iiurlwidth=" + widthLimit + "&titles=";

        makeQuery(_queryString + StrUtil.processURI(title), callback);
    };

    // Query HTML content for reference of the article
    this.getReferenceSectionForArticle = function (pageTitle, sectionID, callback) {
        var _queryString = wikiAPIEntry + "action=mobileview&prop=text&redirect=yes&page=";
        var query = _queryString + StrUtil.processURI(pageTitle) + "&sections=" + sectionID;

        makeQuery(query, callback);
    };

    // Query suggested article for the specific search term
    this.getResultsBySearchTermAsync = function (searchTerm, callback) {
        var _searchLimit = 10;
        var _queryString = wikiAPIEntry + "action=query&list=search&srnamespace=0&srlimit=" + _searchLimit.toString() + "&srsearch=";

        makeQuery(_queryString + StrUtil.processURI(searchTerm), callback);
    };

    this.getCategoryMembers = function (category, callback) {
        var _queryString = wikiAPIEntry + "action=query&list=categorymembers&cmprop=title|type&cmtype=page|subcat&cmlimit=500&cmtitle=";
        makeQuery(_queryString + StrUtil.processURI(category), callback);
    };

    this.isCategoryQuery = function (queryTitle) {
        return StrUtil.startsWith(queryTitle.toLocaleLowerCase(), this.categoryPrefix.toLocaleLowerCase());
    };

    this.isAFile = function (fileTitle) {
        return StrUtil.startsWith(fileTitle, this.filePrefix);
    };
}();

// The functions in JSONParser handle the ajax async callback that is returned by query through Wikipedia API
var JSONParser = new function () {
    // The result of the article's specific chapter
    this.updateSectionCallback = function (json) {  
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;

        if (json.error) {
            Wikipedia.getResultsBySearchTermAsync(WikipediaAppInteraction.wikipediaSearchTitle, JSONParser.searchWikiCallback);
        } else if (json.parse && json.parse.text) {
            if (json.parse.title.toLocaleLowerCase() === WikipediaAppInteraction.wikipediaSearchTitle.toLocaleLowerCase()
                || json.parse.redirects && json.parse.redirects[0] && json.parse.redirects[0].from.toLocaleLowerCase() === WikipediaAppInteraction.wikipediaSearchTitle.toLocaleLowerCase()) {
                WikipediaAppInteraction.postContentMessage("updateSectionCallback", StrUtil.replaceDoubleBackSlashWithHTTPS(json.parse.text), sequenceNo);
            }  
        } else {
            WikipediaAppInteraction.postErrorMessage(Errors.wikipedia, sequenceNo);
        }
    };

    // The result of chapters and the reference chapter ID of the article
    this.updateTocCallback = function (json) {
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;

        if (json.mobileview && json.mobileview.sections) {
            var content = json.mobileview.sections;
            var redirectTitle = WikipediaAppInteraction.wikipediaSearchTitle;
            var referenceID = 0;  
            var toc = CodeSnippet.newTOCEntry({
                toclevel: 1,
                index: Wikipedia.INTRODUCTION_SECTION_ID,
                line: UIStrings.introductionHeader
            });

            for (var i in content) {
                var obj = content[i];
                var toclevel = obj.toclevel;

                if (toclevel) {
                    if (obj.line === UIStrings.referenceTab) {
                        referenceID = obj.index;
                    } else {
                        toc += CodeSnippet.newTOCEntry(obj);
                    }
                }
            }            

            if (json.mobileview.redirected) {
                redirectTitle = json.mobileview.redirected;
            } else if (json.mobileview.normalizedtitle) {
                redirectTitle = json.mobileview.normalizedtitle;
            }

            if (content.length > 1) {
                WikipediaAppInteraction.postTocMessage("updateTocCallback", toc, content.length, content[1].line, referenceID, redirectTitle, sequenceNo);
            } else {
                WikipediaAppInteraction.postTocMessage("updateTocCallback", toc, content.length, UIStrings.introductionHeader, referenceID, redirectTitle, sequenceNo);
            }
        }
    };

    // The result of the entire article
    this.expandArticleCallback = function (json) {
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;

        if (json.mobileview && json.mobileview.sections) {
            var content = json.mobileview.sections;
            var toWrite = StrUtil.empty;

            for (var i in content) {
                var obj = content[i];
                if (obj.id !== 0) {
                    toWrite += StrUtil.replaceDoubleBackSlashWithHTTPS(obj.text);
                }
            }

        }

        WikipediaAppInteraction.postContentMessage("expandArticleCallback", toWrite, sequenceNo);
    };

    // The result of all images of the article
    this.updateImagesGridCallback = function (json) {
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;

        if (json.query && json.query.pages) {
            var pages = json.query.pages;

            for (var i in pages) {
                var obj = pages[i];

                if (obj.images) {
                    if (obj.images.length === 0) {
                        WikipediaAppInteraction.postErrorMessage(Errors.noImageFound, sequenceNo);

                        break;
                    } else {
                        var imageNumber = obj.images.length;

                        for (var j = 0; j < imageNumber; j++) {
                            var _widthLimit = window.innerWidth;

                            Wikipedia.getImage(obj.images[j].title, _widthLimit, function (result) {
                                var imgUrl, imgTitle, descriptionUrl;
                                var imageEntry = StrUtil.empty;

                                if (result.query && result.query.pages) {
                                    var imagePages = result.query.pages;

                                    // Go through all the images and get the url. 
                                    // Only show the image on the page, if its url passes all the media/image checks.
                                    // (see ImageCheck for details)
                                    for (var k in imagePages) {
                                        // In case some imagepage has no imageinfo
                                        if (imagePages[k].imageinfo) {
                                            imgUrl = imagePages[k].imageinfo[0].thumburl;
                                            imgTitle = imagePages[k].title;

                                            if (ImageCheck.isImage(imgUrl) && ImageCheck.notWikimediaImage(imgUrl)) {
                                                descriptionUrl = imagePages[k].imageinfo[0].descriptionurl;
                                                imageEntry = CodeSnippet.newImageGrouping(imgUrl, descriptionUrl, imgTitle, _widthLimit);
                                            }

                                            break;
                                        }
                                    }
                                    
                                    if (imageEntry !== StrUtil.empty) {
                                        WikipediaAppInteraction.postContentMessage("updateImagesGridCallback", imageEntry, sequenceNo);
                                    }
                                }

                            });
                        }                        
                    }
                    return;
                }
            }
        }
    };

    // The result of full size image
    this.updateFullSizedPictureCallback = function (json) {
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;
        var imgUrl, fileName, detailUrl;

        if (json.query && json.query.pages) {
            var pages = json.query.pages;

            for (var i in pages) {
                if (pages[i].imageinfo) {
                    fileName = pages[i].title;
                    imgUrl = pages[i].imageinfo[0].thumburl;
                    detailUrl = pages[i].imageinfo[0].descriptionurl;
                    WikipediaAppInteraction.postFullSizeImageMessage(imgUrl, fileName, detailUrl, sequenceNo);

                    break;
                } else {
                    WikipediaAppInteraction.postErrorMessage(Errors.imageInsertionFailure, sequenceNo);
                }
            }
        }

    };

    // The result of the article's reference
    this.updateReferenceCallback = function (json) {
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;

        if (json.mobileview && json.mobileview.sections) {
            var content = json.mobileview.sections[0];
            if (content.id > 0) {
                WikipediaAppInteraction.postContentMessage("updateReferenceCallback", StrUtil.replaceDoubleBackSlashWithHTTPS(content.text), sequenceNo);
            }
        }
    };

    // The query result of suggested article result
    this.searchWikiCallback = function (json) {
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;
        var hasArticle = (json.query.searchinfo && json.query.searchinfo.totalhits > 0);

        if (json.error) {
            WikipediaAppInteraction.postErrorMessage(Errors.wikipedia + " " + json.error.code + ": " + json.error.info, sequenceNo);
        } else if (hasArticle) {
            hasArticle = false;
            var results = json.query.search;
            var content = CodeSnippet.newSearchResultTotal(json.query.searchinfo.totalhits, WikipediaAppInteraction.wikipediaSearchTitle);

            for (var i = 0; i < results.length; i++) {
                if (!Wikipedia.isAFile(results[i].title)) {
                    content += CodeSnippet.newSearchSnippets(results[i]);
                    hasArticle = true;
                }
            }

            if (hasArticle) {
                WikipediaAppInteraction.postContentMessage("searchWikiCallback", content, sequenceNo);

                return;
            }
        }

        WikipediaAppInteraction.postNoResultMessage(Errors.emptySearResult, sequenceNo);
    };

    // The query result of the category term
    this.updateCategoryCallback = function (json) {
        var sequenceNo = WikipediaAppInteraction.wikipediaSequenceNo;

        if (json.query && json.query.categorymembers && json.query.categorymembers.length > 0) {
            var subcat = StrUtil.empty;
            var pages = StrUtil.empty;
            var members = json.query.categorymembers;
            var article = "";

            for (var i = 0; i < members.length; i++) {
                if (members[i].type === "page") {
                    pages += CodeSnippet.newCatMemberEntry(members[i].title);
                } else if (members[i].type === "subcat") {
                    subcat += CodeSnippet.newCatMemberEntry(members[i].title);
                }
            }

            if (subcat !== StrUtil.empty) {
                article = CodeSnippet.subcategoryTitle() + subcat;
            }

            if (pages !== StrUtil.empty) {
                article += CodeSnippet.categoryPagesTitle() + pages;
            }

            WikipediaAppInteraction.postContentMessage("updateCategoryCallback", article, sequenceNo);
        } else {
            WikipediaAppInteraction.postErrorMessage(Errors.category, sequenceNo);
        }

    };

}();

window.onload = function () {

    WikipediaAppInteraction.initial();

    window.addEventListener("message", WikipediaAppInteraction.wikipediaEventListener, false);
};
