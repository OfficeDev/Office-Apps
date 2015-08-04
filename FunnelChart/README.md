## Funnel Tutorial Add-in for Microsoft Office ##

####Table of Contents####
- [Overview](#overview)
- [Structure of the source code](#structure-of-the-source-code)
- [APIs and libraries](#api-and-libraries)
- [Building projects](#building-projects)
- [More resources](#more-resources)

### Overview ###
This is a project for a tutorial Microsoft Office Add-in for Excel. It interacts with data in Excel 2013 via Office.js, and renders a funnel chart on D3.js.
 

### Structure of the source code ###
Funnel Tutorial/Funnel

Name  | Description
------------- | -------------
Funnel.xml  | This is the add-in manifest file. This file declaratively describes how the add-in should be activated when an end user installs it. The html location needs to be set in tag &lt;SourceLocation&gt; and the width and height should be set in tags &lt;RequestedWidth&gt; and &lt;RequestedHeight&gt;.

FunnelWeb

Name  | Description
------------- | -------------
App  |  This folder contains all of the code for the Home page, the visualization, and the add-in CSS and JavaScript.
App/Home  |  This folder contains the code for the Home html page, as well as all of the JavaScript logic for the add-in.
Scripts  | This folder contains the jquery and Office.js files necessary to run the code and use the Office API.
Home.html  |  This file contains references to all of the necessary js and css files, and it lays out the elements seen when the add-in is run.
Home.js  |  This file contains all of the specific logic for this add-in, including inserting sample data, retrieving selected data, parsing data to create the visualization, and custom settings.
App.js  |  This file defines the notification messages in the add-in.
App.css  |  This file defines common styles for the add-in.
d3-funnel-charts.js  | This file contains the logic for creating an SVG visualization from data provided.
scripts  | This folder contains all the files to handle UX & functional logic.
themes  | This folder contains all the theme thumbnails and styles, and a JSON file that defines the theme properties.

### APIs and libraries ###
For more details of d3-funnel-charts visualization, go to the [GitHub page](https://github.com/smilli/d3-funnel-charts)

For more details of Office related APIs like [`Office.context.document.addHandlerAsync()`](http://msdn.microsoft.com/en-us/library/office/fp142201(v=office.1501401).aspx), [`Office.select()`](http://msdn.microsoft.com/en-us/library/office/fp161004(v=office.1501401).aspx), [`Office.context.document.bindings.addFromSelectionAsync()`](http://msdn.microsoft.com/en-us/library/office/fp142282(v=office.1501401).aspx), [`Office.context.document.settings.set(key, value)`](http://msdn.microsoft.com/en-us/library/office/fp161063(v=office.1501401).aspx), go to the website [JavaScript API for Office(v1.1)](http://msdn.microsoft.com/en-us/library/fp142185.aspx).

For more details of d3 related APIs like [`d3.select()`](https://github.com/mbostock/d3/wiki/Selections#d3_select), [`selection.attr()`](https://github.com/mbostock/d3/wiki/Selections#attr), [`selection.remove()`](https://github.com/mbostock/d3/wiki/Selections#remove), or [`selection.transition()`](https://github.com/mbostock/d3/wiki/Selections#transition), go to the website [D3 API Reference](https://github.com/mbostock/d3/wiki/API-Reference).

### Buiding projects ###
__1.    Prerequisites:__  
&nbsp;&nbsp;&nbsp;&nbsp;Install the following components before you get started:  
&nbsp;&nbsp;&nbsp;&nbsp;a.  [Visual Studio 2013](http://msdn.microsoft.com/en-us/library/dd831853.aspx)    
&nbsp;&nbsp;&nbsp;&nbsp;b.  Microsoft Excel 2013  

__2.    Debug and run the app:__  
&nbsp;&nbsp;&nbsp;&nbsp;a.  Launch Visual Studio 2013  
&nbsp;&nbsp;&nbsp;&nbsp;b. Open the Funnel project  
&nbsp;&nbsp;&nbsp;&nbsp;c.  Add breakpoints in the typescript files and click _Start Debugging_ or press F5 to start debugging  

### References ###
- [How to: Create your first task pane or content app by using Visual Studio](http://msdn.microsoft.com/EN-US/library/office/apps/fp142161.aspx#FirstAppWordExcelVS_Create)  
- [JavaScript API for Office(v1.1)](http://msdn.microsoft.com/en-us/library/fp142185.aspx)
