---
topic: sample
products:
- Excel
- Office 365
languages:
- TypeScript
extensions:
  contentType: samples
  technologies:
  - Add-ins
  createdDate: 3/18/2014 3:27:46 AM
---
## Modern Trend app for Microsoft Office ##

####Table of Contents####
- [Overview](#overview)
- [Structure of the source code](#structure-of-the-source-code)
- [APIs and libraries](#api-and-libraries)
- [Building projects](#building-projects)
- [More resources](#more-resources)

### Overview ###
This is a project for a real Microsoft app for Excel that can be downloaded free from [Office Store] (http://office.microsoft.com/en-us/store/). The app is developed using TypeScript. It interacts with data in Excel 2013 via Office.js, and renders a chart on D3.js.

With a few selections, your data is shown on an interactive trend chart. You can pin the specific data points on the chart, and add descriptions on the canvas.  

__Download the [Modern Trend](http://office.microsoft.com/en-us/store/modern-trend-WA104220390.aspx?redir=0) app for Excel and have a try.__

### Structure of the source code ###
ModernTrend/ModernTrendManifest

Name  | Description
------------- | -------------
ModernTrend.xml  | This is the app manifest file. This file declaratively describes how the app should be activated when an end user installs it. The html location needs to be set in tag &lt;SourceLocation&gt; and the app width and height should be set in tags &lt;RequestedWidth&gt; and &lt;RequestedHeight&gt;.

ModernTrendWeb

Name  | Description
------------- | -------------
content  | This folder contains the files that define all the styles used in the app.
images  | This folder contains all the images for the setting function.
layouts/layouts.json  | This file declares the layout style and the elements with it.
pages  | This folder contains the app user interface (UI) page.
resources  | This folder contains the resource file with all the strings used in the app.
scripts  | This folder contains all the files to handle UX & functional logic.
themes  | This folder contains all the theme thumbnails and styles, and a JSON file that defines the theme properties.

ModernTrendWeb/scripts

Name  | Description
------------- | -------------
Localizability/string.ts  | This file contains the helper code related to the string parser.
logic  | This folder contains the files to handle functional logic.
opensource/d3/d3.v3.min.js  | A third party JavaScript library to render UI.
strings/stringadapter.ts  | This file categorizes the strings into groups.
UX  | This folder contains files to handle UX logic. 
__app.ts__  | This file contains the __entry point__ of the app: Office.initialize, from which the app is launched.

ModernTrendWeb/scripts/logic/shared (This folder contains the shared logic files with basic functions. It can be shared with other projects which use similar functions.)

Name  | Description
------------- | -------------
chart.ts  | This file contains the basic definitions, constants and base-classes for rendering.
config.ts  | This file contains the basic definitions, interfaces and base classes for configuration.
controller.ts  | This file contains the controller implementation.
data.ts  | This file contains the basic definitions, constants, and base-classes of data related tasks.
decoration.ts  | This file contains the basic definitions, constants, and base-classes of customizable-decoration related tasks.
layout.ts  | This file contains the basic definitions, constants, and base-classes of layout related tasks.
skus.ts  | This file contains the basic definitions, constants, and base-classes of SKU related tasks.
tool.ts  | This file contains the basic definitions , and implementations of tools.
utils.ts  | This file contains some helper functions.
validate.ts  | This file contains the basic definitions, helpers for parameter validation.

ModernTrendWeb/scripts/logic

Name  | Description
------------- | -------------
configurator.agave.ts  | The app configurator.
data.binder.agave.ts  | The app data binder.
data.convertor.agave.ts  | The data convertor which converts the raw data to the specific data format of the app.
layouter.trends.ts  | The implementation of the layout logic which isn't related to data.
plotter.trends.ts  | The implementation of the plotter logic which is related to data.
predefinedSKUs.ts  | Pre-defined SKU configuration

ModernTrendWeb/scripts/UX/shared (This folder contains the shared UX logic files with basic functions about UX logic handling. It can be shared with other projects which use similar functions.)

Name  | Description
------------- | -------------
BindingPane.ts  | The basic binding pane.
Galleries.ts  | The galleries.

ModernTrendWeb/scripts/UX

Name  | Description
------------- | -------------
BindingPaneSpecific.ts  | The specific binding pane.
DataPane.ts  | The data pane.
Home.ts  | The main UX.
SettingPane.ts  | The setting pane.

### APIs and libraries ###
For more details of Office related APIs like [`Office.context.document.addHandlerAsync()`](http://msdn.microsoft.com/en-us/library/office/fp142201(v=office.1501401).aspx), [`Office.select()`](http://msdn.microsoft.com/en-us/library/office/fp161004(v=office.1501401).aspx), [`Office.context.document.bindings.addFromSelectionAsync()`](http://msdn.microsoft.com/en-us/library/office/fp142282(v=office.1501401).aspx), [`selection.getDataAsync()`](http://msdn.microsoft.com/en-us/library/office/fp161073(v=office.1501401).aspx), [`Office.context.document.settings.set(key, value)`](http://msdn.microsoft.com/en-us/library/office/fp161063(v=office.1501401).aspx), go to the website [JavaScript API for Office(v1.1)](http://msdn.microsoft.com/enus/library/fp142185.aspx).

For more details of D3 related APIs like [`d3.select()`](https://github.com/mbostock/d3/wiki/Selections#d3_select), [`selection.attr()`](https://github.com/mbostock/d3/wiki/Selections#attr), [`d3.scale.linear()`](https://github.com/mbostock/d3/wiki/Quantitative-Scales#linear), or [`d3.svg.line`](https://github.com/mbostock/d3/wiki/SVG-Shapes#line), go to the website [D3 API Reference](https://github.com/mbostock/d3/wiki/API-Reference).

### Buiding projects ###
__1.    Prerequisites:__  
&nbsp;&nbsp;&nbsp;&nbsp;Install the following components before you get started:  
&nbsp;&nbsp;&nbsp;&nbsp;a.  [Visual Studio 2013](http://msdn.microsoft.com/en-us/library/dd831853.aspx)  
&nbsp;&nbsp;&nbsp;&nbsp;b.  [TypeScript for Visual Studio 2012 and 2013](http://www.microsoft.com/en-us/download/details.aspx?id=34790)  
&nbsp;&nbsp;&nbsp;&nbsp;c.  Microsoft Excel 2013  

__2.    Debug and run the app:__  
&nbsp;&nbsp;&nbsp;&nbsp;a.  Launch Visual Studio 2013  
&nbsp;&nbsp;&nbsp;&nbsp;b.  Open the ModernTrend project  
&nbsp;&nbsp;&nbsp;&nbsp;c.  Add breakpoints in the typescript files and click _Start Debugging_ or press F5 to start debugging  

### More resources ###
- [How to: Create your first task pane or content app by using Visual Studio](http://msdn.microsoft.com/EN-US/library/office/apps/fp142161.aspx#FirstAppWordExcelVS_Create)  
- [Introduction of TypeScript](http://typescript.codeplex.com/)  
- [TypeScript: JavaScript Development at Application Scale](http://blogs.msdn.com/b/somasegar/archive/2012/10/01/typescript-javascript-development-at-application-scale.aspx)  
- [JavaScript API for Office(v1.1)](http://msdn.microsoft.com/en-us/library/fp142185.aspx)  
- [D3.js Official Site](http://d3js.org/)  
- [D3 API Reference](https://github.com/mbostock/d3/wiki/API-Reference)  