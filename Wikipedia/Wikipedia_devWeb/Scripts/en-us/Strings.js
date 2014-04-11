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

var LANGUAGE = "en";

var Errors = {
    textInsertionFailureForMultiCell: "We can't insert the text into multiple cells. Please select one single cell.",
    docCodeError: "This document is in Read-Only mode. Please enable editing before insertion.",
    sandboxServiceDown: "The content doesn’t exist or is not accessible due to connectivity issues.",
    jsonParseError: "Json parse error."
};

var UIStrings = {
    mainPageHint: "The app can search from Wikipedia automatically and insert seamlessly the information to your document.",
    welcomeMessage: "I want to know...",
    loadingMessage: "Loading...",
    insert: "Insert",
    seeAlsoHeader: "See also",
    backTitle: "Back",
    searchTitle: "Search",
    searchOptionTitle: "Search Options",
    autosearch: "autoSearch",
    autosearchTitle: "AutoSearch",
    browser: "Search in browser",
    sectionsTab: "Sections",
    imagesTab: "Images",
    infoboxTab: "Infobox",
    referenceTab: "References",    
    ellipses: "",
    expandArticle: "Expand Article",
    contractArticle: "Collapse Article",
    backToMain: "Back to Article",
    tableExpand: "Show this table",
    tableCollapse: "Hide this table",
    errorHeading: "There is a problem.",
    warningHeading: "Warning",
    suggestionMessage: "No results found. <br />Suggestions:",
    source: "Source:",
    aboutMessage: "Wikipedia trademarks are used with permission from the Wikimedia Foundation",
    searchKeywordLimitMessage: "The search text is limited to 100 characters",
    wikiMainURL: "https://" + LANGUAGE + ".wikipedia.org",
    browserUrlPrefix: "https://" + LANGUAGE + ".wikipedia.org/wiki/special:search/"
};
