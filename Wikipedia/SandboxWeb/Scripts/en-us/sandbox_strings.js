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
    wikipedia: "Error occurred while fetching from Wikipedia. Please try again.",
    timeout: "We cannot connect to Wikipedia. Please try again later.",
    category: "We can't find any members in this category.  Please use another term to search again.",
    emptySearResult: "We can’t find any relevant article. Please try another term.  ",
    imageInsertionFailure: "We can’t insert the image into the document. ",
    noImageFound: "This article does not contain any image.",
    JsonParseError: "Json paser error."
};

var UIStrings = {
    introductionHeader: "Overview",
    referenceTab: "References",
    subcategoryHeading: "Subcategories",
    categoryPagesTitle: "Pages",
    wikiMainURL: "https://" + LANGUAGE + ".wikipedia.org",
    
    searchResult: function (total) {
        return "We found " + total + " article" + (total > 1 ? "s" : UIStrings.ellipses) + ".";
    }
};
