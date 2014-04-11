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

"use strict";

// Flag indicating if the page change is due to a new search
window.freshSearch = false;
// Indicates where the last scroll location was so that the insert button can move
window.lastScrollTop = 0;

// Global vars
var GlobalVars = {
    currState: null,
    nextState: null,
    hasSubmenu: false,
    tabMenuOpen: false,
    currInnerWidth: window.innerWidth,
    lastInnerWidth: 0
};

// Toast error type
var ErrorType = {
    notFoundResult: "fishbowl",
    searchKeywordLimited: "error",
    warning: "warning",
    error: "error",
};

// Jquery selectors, include ID selectors, class selectors, class name 
// and Wikipedia dependent node selectors.
var Selectors = {
    // CSS ID Selectors
    logo: "#ms_osf_logo",
    // Search area
    backButton: "#ms_osf_backbutton",
    searchArea: "#ms_osf_navContainer",
    searchBarArea: "#ms_osf_searchBarInputWrapper",
    searchBar: "#ms_osf_searchBarInput",
    searchButton: "#ms_osf_searchButton",
    searchOptions: "#ms_osf_searchOptionsButton",
    // Search option area
    searchOptionPane: "#ms_osf_searchOptions",
    autosearchCheckbox: "#ms_osf_autosearch",
    autosearchCheckBoxIcon: "#ms_osf_autosearchCheckbox",
    browserArea: "#ms_osf_searchInBrowser",
    browserButton: "#ms_osf_searchInBrowserButton",
    // Submenu area
    ellipses: "#tabEllipses",
    actions: "#ms_osf_actions",
    // Loading area
    loadingMsg: "#ms_osf_loadingAnimation",
    // Content area
    content: "#ms_osf_content",
    article: "#ms_osf_article",
    mainPageHint: "#ms_osf_mainPageHint",
    suggests: "#ms_osf_suggestionMessage",
    toggleArticleButton: "#ms_osf_articleToggle",
    expandedSections: "#ms_osf_expandedSectionsContainer",
    backToMainButton: "#ms_osf_backToMain",
    coordinates: "#coordinates",
    fullArticleButton: "#ms_osf_wikisite",
    // Toast pane area
    aboutPane: "#ms_osf_aboutPane",
    aboutMessage: "#ms_osf_aboutMessage",
    errorPane: "#ms_osf_errorPane",
    errorHeading: "#ms_osf_errorHeader",
    errorMessage: "#ms_osf_errorMessage",
    // Insert items
    insertText: "#textInsert",
    imgToInsert: "#ms_osf_imageToBeInserted",
    textToInsert: "#ms_osf_textToBeInserted",

    // CSS Class Selectors
    // Submenu actionable buttons.
    tabGroup: ".tabGroup",
    ellipsesClass: ".ellipses",
    tabMenu: ".tabMenu",
    sectionsButton: ".ms_osf_sections",
    imagesButton: ".ms_osf_images",
    infoboxButton: ".ms_osf_infobox",
    referenceButton: ".ms_osf_reference",
    // Loading
    loading: ".ms_osf_loading",
    // Content area
    tocItemClass: ".ms_osf_tocItem",
    // Insert image area
    imageInsertArea: ".ms_osf_imageInsertArea",
    hoveredImg: ".ms_osf_imgOnHover",
    insertImgLoading: ".ms_osf_insertImageLoading",
    insertImage: ".ms_osf_insertButton",
    // Infobox table
    tableToggle: ".ms_osf_tableToggle",
    tableAutoExpand: ".table-autoexpand",

    // CSS Class name
    splashClassName: "ms_osf_splash",
    splashHintClassName: "ms_osf_searchBarInputHint",
    clickableClassName: "ms_osf_clickable",
    visibleClassName: "ms_osf_visible",
    invisibleClassName: "ms_osf_invisible",
    // Back button classes
    showBackButtonClassName: "ms_osf_showBackButton",
    hideBackButtonClassName: "ms_osf_hideBackButton",
    // Auto search checkbox classes
    autosearchCheckedClassName: "ms_osf_autosearchCheckbox_checked",
    autosearchUncheckedClassName: "ms_osf_autosearchCheckbox_unchecked",
    // Submenu area classes
    showActionsClassName: "ms_osf_actions_show",
    hideActionsClassName: "ms_osf_actions_hide",
    showTabClassName: "tab_show",
    hideTabClassName: "tab_hide",
    tabUnselectedClassName: "tab_unselected",
    tabSelectedClassName: "tab_selected",
    // Article area classes
    articleToggleClassName: "ms_osf_articleToggle",
    expandedSectionsContainerClassName: "ms_osf_expandedSectionsContainer",
    backToMainClassName: "ms_osf_backToMain",   
    fishbowlClassName: "ms_osf_fishbowl",
    contentUpClassName: "ms_osf_content_up",
    categoryMemberClassName: "ms_osf_categoryMember",
    // Image classes
    imageInsertAreaClassName: "ms_osf_imageInsertArea",
    imageInsertButtonClassName: "ms_osf_insertButton",
    imageInsertButtonIconClassName: "ms_osf_insertButton_icon",
    imageHoveredClassName: "ms_osf_imgOnHover",
    imageLoadingClassName: "ms_osf_insertImageLoading",
    imageClassName: "image",
    imageTableClassName: "img_table",
    imageContainerClassName: "ms_osf_imageContainer",
    // Infobox classes
    infoboxClassName: "infobox",
    tableAutoExpandClassName: "table-autoexpand",
    tableClassName: "ms_osf_collapseable",
    tableToggleClassName: "ms_osf_tableToggle",
    tableExpandedClassName: "ms_osf_tableToggle_expand",
    tableCollapsedClassName: "ms_osf_tableToggle_collapse",
    // Section toc classes
    tocClassName: "ms_osf_toc",
    tocItemClassName: "ms_osf_tocItem",
    // Sandbox
    sandboxClassName: "ms_osf_sandbox",

    // Wikipedia dependent nodes
    imageSelector: "a.image img",
    imageCaption: "thumbcaption",
    reference: ".reference",
    meta: ".metadata",
    ambox: ".ambox-content",
    err: ".error",
    audio: "span[title='pronunciation']",
    cite: "a[title='Wikipedia: Citation needed']",
    backLinks: ".mw-cite-backlink",
    jumpBackSection: ".section_anchors",
    infoBox: ".infobox",
    table: "table",
    audioClass: ".noexcerpt",
    mediaClass: ".mediaContainer",
    videoSelector: "video",
    editLinks: ".mw-editsection",
    tnoneClass: ".tnone",
    linksClassName: "internalLink",
    internalLinkSelector: "a[href^='/wiki/']",
    contentDownClassName: "ms_osf_content_down",
    warningCompactClassName: "hide-when-compact",
};
