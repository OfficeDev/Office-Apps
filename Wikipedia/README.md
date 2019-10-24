---
page_type: sample
products:
- office-excel
- office-powerpoint
- office-word
- office-365
languages:
- typescript
extensions:
  contentType: samples
  technologies:
  - Add-ins
  createdDate: 3/18/2014 3:27:46 AM
description: "This project helps you quickly access Wikipedia content from Office and simplifies the process of referencing text and images."
urlFragment: wikipedia-app-for-microsoft-office
---

# Wikipedia app for Microsoft Office

**Table of Contents**
- [Overview](#overview)
- [Structure of the source code](#structure-of-the-source-code)
- [APIs and libraries](#api-and-libraries)
- [Building projects](#building-projects)
- [More resources](#more-resources)

## Overview

This project is a Microsoft app for Office used in Word 2013 and Excel 2013. It helps you quickly access Wikipedia content from Office and simplifies the process of referencing text and images.  
The Wikipedia app will automatically search topics based on the selection in your Office document and display results in the Task Pane. Wikipedia content in the Task Pane is optimized for easy navigation and reading. Content is organized into sections, and tabs allow you to focus on text and images or just images.  
Inserting Wikipedia content is a snap: simply select the Wikipedia content you are interested in, and with one click the app will instantly insert a quotation into your document.  

>[!NOTE]
>This is a taskpane add-in that is launched from the ribbon. When you press F5 in Visual Studio, Word or Excel will open. On the **Home** tab of the ribbon, there will be a new group called **Wikipedia** with an **Open** button. Press **Open** to launch the add-in.

_Download [Wikipedia](http://office.microsoft.com/store/wikipedia-WA104099688.aspx?queryid=b014c521%2D8618%2D4975%2D963f%2D19f5b451ced9&css=wikipedia&CTT=1) app and have a try._

## Structure of the source code

In the project, Wikipedia_devWeb is responsible for UI handling and interaction with user, SandboxWeb is dedicated to calling Wikipedia APIs for search.
The communication between them depends on iframe postMessage with sandbox tag that makes the cross-domain communication possible. 

+ Wikipedia_devWeb that is responsible for UI handling, sending search keywords to SandboxWeb and receiving search results from SandboxWeb.

File  | Description
------------- | -------------
Scripts/en-us/Strings.js  | Defines all the string contants
Scripts/Wikipedia_navigation.js  | Handles the page's navigation with the existing state, for example, go back to the previous page
Scripts/Wikipedia_tabs.js  | Determines which tabs(Sections, Images, Infobox, References) and menu options to show depending on the width of containing element
Scripts/Wikipedia_ui.js  | Handles the UI element's status and events in html page and interacts with the Office client
Scripts/Wikipedia_utils.js  | Constructs html contents and handles strings
Scripts/Wikipedia_vars.js  | Sets all the variables
Styles/App.css  | Defines the specific style of the app
Styles/OxgAgaveStyle.css  | Defines the general style for the app
Styles/OxgNavigationStyle.css  | The style defitions of Navigation UI control
Wikipedia_dev.html  | The app's UI page

+ SandboxWeb that calls Wikipedia APIs for search and returns the valid results to Wikipedia_devWeb.

File  | Description
------------- | -------------
Scripts/en-us/sandbox_strings.js  | Defines all the string contants in the Sandbox side
Scripts/sandbox.js  | Querys the article contents through Wikipedia's API and filters out the undesired images or other media that will be posted back
sandbox.html  | 

## APIs and libraries

1. `this.tryUpdatingSelectedWord = function (autoSearchIsOn, milliSecond)` at line 1222 in Wikipedia_ui.js  
If you want to use Office.context.document.getSelectedDataAsync to get the text selected by the user in Office client, you can refer to this. Please pay attention to the differences of string handling between Word & Excel.

2. `this.insertText = function (text)` at line 1317 in Wikipedia_ui.js  
If you want to use Office.context.document.setSelectedDataAsync to insert text into Office client, you can refer to this. Please pay attention to the differences of inserted content handling between Office.CoercionType.Html & Office.CoercionType.Text.

3. `this.insertImage = function (fullHTML)` at line 1331 in Wikipedia_ui.js  
&nbsp;You can refer to this for inserting image into Word.

## Buiding projects

### 1.    Prerequisites:

&nbsp;&nbsp;&nbsp;&nbsp;Install the following components before you get started:  
&nbsp;&nbsp;&nbsp;&nbsp;a.    Visual Studio 2012 and Microsoft Office Developer Tools for Visual Studio 2012.  
_&nbsp;&nbsp;&nbsp;&nbsp;For information about downloading Visual Studio 2012 or later, see "Tools" on http://msdn.microsoft.com/en-US/office/apps/fp123627._  
&nbsp;&nbsp;&nbsp;&nbsp;b.    Word 2013 or Excel 2013.  

### 2.    Set up for debugging and run the Wikipedia app:

&nbsp;&nbsp;&nbsp;&nbsp;a.    Start Visual Studio.  
&nbsp;&nbsp;&nbsp;&nbsp;b.    Launch the Wikipedia_dev project.  
&nbsp;&nbsp;&nbsp;&nbsp;c.    Update the URLs of Wikipedia_devWeb and Sandbox:  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I.    Check the URL of Wikipedia_devWeb to make sure that it matches the wikipediaHostURL at line 277 of file sandbox.js.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II.    Check the URL of Sandbox to make sure that it matches the sandBoxHostURL at line 278 of file Wikipedia_utils.js.  
&nbsp;&nbsp;&nbsp;&nbsp;d.    Click Start Debugging or press the F5 key.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I.   All the .js files started with Wikipedia_ will be compiled as one file Wikipedia_dev.js in the same folder when you start running. You can see it after clicking 'Show All Files'.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II.  If you want to know how to compile several .js files into one file. You can check Project Properties - Compile - Build Events...  
`copy /b $(ProjectDir)\Scripts\Wikipedia_vars.js+$(ProjectDir)\Scripts\Wikipedia_utils.js+$(ProjectDir)\Scripts\Wikipedia_navigation.js+$(ProjectDir)\Scripts\Wikipedia_sandbox.js+$(ProjectDir)\Scripts\Wikipedia_tabs.js+$(ProjectDir)\Scripts\Wikipedia_ui.js $(ProjectDir)\Scripts\Wikipedia_dev.js`

## More resources
[Run an app for Office consistently in different browsers](http://blogs.msdn.com/b/officeapps/archive/2013/09/02/run-an-app-for-office-consistently-in-different-browsers.aspx)  
[Use Visual Studio 2012 to debug JavaScript code outside the running project](http://blogs.msdn.com/b/officeapps/archive/2013/08/30/use-visual-studio-2012-to-debug-javascript-code-outside-the-running-project.aspx)  
[Use two-domain design for more secure communication with external content](http://blogs.msdn.com/b/officeapps/archive/2013/09/10/use-two-domain-design-for-more-secure-communication-with-external-content.aspx)  
[Writing data from apps to Office documents](http://blogs.msdn.com/b/officeapps/archive/2013/08/28/writing-data-from-apps-to-office-documents.aspx)  

