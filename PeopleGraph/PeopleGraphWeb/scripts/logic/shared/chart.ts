/* **************************************************************************************
Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. 
Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
***************************************************************************************** */

///<reference path="data.ts"/>
///<reference path="tool.ts"/>
///<reference path="config.ts"/>
///<reference path="layout.ts"/>
///<reference path="skus.ts"/>
///<reference path="validate.ts"/>

/**
  * This module contains the basic definitions, constants and base-classes related to rendering
  */
module DataViz.Chart {
    "use strict";

    /**
      * The ID of the root-most SVG element of the canvas
      */
    export var defaultSVGRootId = "#canvas-root";   // Should match the top svg node name used in the main HTML page

    /**
      * The ID of the root SVG element of the main chart (chart excluding stuffs like title, backdrop, separator and other decorations)
      */
    export var defaultChartRootId = "#chart-root";  // Should match the child svg node name used in layouts.js

    /**
      * This interface defines the layouter behavior, which takes care of the rendering/positioning/styling of non-quantitative elements on the chart.
      * Non-quantitative elements normally are things like title, backdrop, separator or some other decorative elements that are not bound to any particular data
      */
    export interface ILayouter extends DataViz.Tools.ITool, DataViz.Chart.ILayoutChangeListener, DataViz.Tools.IPausable {
        /**
          * Renders the layout.
          * @param {any} data The bound data to be visualized. The actual layouter might not need the data at all but we just provide it here just in case...
          */
        layout(data: any): void;
    }

    /**
      * This interface defines the plotter behavior, which takes care of the rendering/positioning/styling of quantitative elements on the chart.
      * Quantitiative elements include those such as labels, numbers, and shapes representing the data being bounded.
      */
    export interface IPlotter extends DataViz.Tools.ITool, DataViz.Tools.IPausable {
        /**
          * Plots the data to the chart.
          * @param {any} data The bound data to be plotterd.
          */
        plot(data: any): void;
    }

    /**
      * This interface defines the behavior of the visualization listener, which will be notified for events of the visualization life-cycle.
      */
    export interface IVisualizationListener {
        /**
          * The event when the visualization is being started
          */
        onStartVisualizing(): void;

        /**
          * The event when the visualization has been ended
          */
        onEndVisualizing(): void;
    }

    /**
      * A class that takes care of the visualization. 
      */
    export class Visualizer implements DataViz.Tools.ITool {
        private layouter: ILayouter;
        private plotter: IPlotter;
        private visualizationRequestPending: boolean;
        private cachedData: any;
        private visualizationListeners: IVisualizationListener[];

        /**
          * @param {@link ILayouter} layouter The layouter instance that will do the actual layout actions
          * @param {@link IPlotter} plotter The plotter instance that will do the actual plotting operations
          */
        constructor(layouter: ILayouter, plotter: IPlotter) {
            Validate.Validator.ensures(layouter).from("Visualizer::ctor [layouter]").isNotNull();
            Validate.Validator.ensures(plotter).from("Visualizer::ctor [plotter]").isNotNull();

            this.layouter = layouter;
            this.plotter = plotter;
            this.visualizationListeners = [];
            this.resetTool();
        }

        /**
          * Visualizes the data to the chart
            @param {any} data The data to be visualized
          */
        public visualize(data: any) {
            this.cachedData = data;

            if (!data) {
                this.resetTool();
            }

            this.revisualize();
        }

        /**
          * Registers a visualization listener. This method can be called for multiple times to register multiple listeners.
          * @param {IVisualizationListener} listener A visualization listener to be registered.
          */
        public registerListener(listener: IVisualizationListener) {
            Validate.Validator.ensures(listener).from("Visualizer::registerListener").isNotNull();
            if (this.visualizationListeners.indexOf(listener) === -1) {
                this.visualizationListeners.push(listener);
            }
        }

        /**
          * Unregisters a visualization listener.
          * @param {@link IVisualizationListener} listener: A visualization listener to be unregistered.
          */
        public unregisterListener(listener: IVisualizationListener) {
            Validate.Validator.ensures(listener).from("Visualizer::unregisterListener").isNotNull();
            DataViz.Utils.removeItemFromArray(this.visualizationListeners, listener);
        }

        /**
          * Implementing {@link ITool#resetTool}
          */
        public resetTool() {
            this.plotter.resetTool();
            this.layouter.resetTool();
            this.cachedData = null;
            this.visualizationRequestPending = false;
            this.visualizationListeners.length = 0;
        }

        private revisualize() {
            this.visualizationRequestPending = true;

            var thisVisualizer = this;
            var delay = 100;
            setTimeout(() => {
                // Repeatedly (< 100ms) invoked visualization requests will be merged into the last request to avoid waste of duplicate computing and rendering
                if (!thisVisualizer.visualizationRequestPending) {
                    return;
                }

                this.visualizationRequestPending = false;

                if (thisVisualizer.cachedData) {
                    this.visualizationListeners.forEach((listener: IVisualizationListener, index: number, array: IVisualizationListener[]) => {
                        listener.onStartVisualizing();
                    });

                    thisVisualizer.layouter.layout(thisVisualizer.cachedData);
                    thisVisualizer.plotter.plot(thisVisualizer.cachedData);

                    this.visualizationListeners.forEach((listener: IVisualizationListener, index: number, array: IVisualizationListener[]) => {
                        listener.onEndVisualizing();
                    });
                }
            },
            delay);
        }
    }
}