/// <reference path="../App.js" />

(function () {
    "use strict";

    window.bindingID = 'myBinding';
    var binding = null;

    //Sample data
    var sampleHeaders = [['Stage', 'Percent']];
    var sampleRows = [
        ['Applied', 100],
        ['Phone Interview', 80],
        ['On-site Interview', 45],
        ['Given Offer', 30],
        ['Accepted Offer', 12]];
        
    window.animationSpeed = 1000;

    // The initialize function must be run each time a new page is loaded
    Office.initialize = function (reason) {
        $(document).ready(function () {
            app.initialize();
            
            window.animationSpeed = Office.context.document.settings.get('animationSpeed') ? Office.context.document.settings.get('animationSpeed') : 1000;

            $('#sampleButton').click(insertSampleData);
            $('#get-data-from-selection').click(getDataFromSelection);
            $('#animationButton').click(function () {
                if (window.animationSpeed == 3) {
                    window.animationSpeed = 1000;
                    setAndSave('animationSpeed', 1000);
                } else {
                    window.animationSpeed = 3;
                    setAndSave('animationSpeed', 3);
                }
                if (binding) {
                    displayDataForBinding(binding);
                }
            })
        });
    };
    
    //Takes in a string of settingName and string, number, or object of settingValue
    //Creates new corresponding setting, then saves settings to the document
    function setAndSave(settingName, settingValue) {
        if (Office.context.document.settings) {
            Office.context.document.settings.set(settingName, settingValue);
            Office.context.document.settings.saveAsync();
        }
    }

    //Creates TableData of sample data, writes it to selected cell in chart, and binds to it
    function insertSampleData() {
        var sampleData = new Office.TableData(
            sampleRows, sampleHeaders);
        Office.context.document.setSelectedDataAsync(sampleData,
            function (asyncResult) {
                if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                    app.showNotification('Could not insert sample data', 'Please choose a different selection range.');
                } else {
                    Office.context.document.bindings.addFromSelectionAsync(
                        Office.BindingType.Table, { id: window.bindingID },
                        function (asyncResult) {
                            if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                                displayExistingData();
                            } else {
                                app.showNotification(result.error.name, result.error.message);
                            }
                        }
                    );
                }
            }
        );
    }

    // Reads data from current document selection and displays a notification
    function getDataFromSelection() {
        Office.context.document.bindings.addFromPromptAsync(
            Office.BindingType.Table, { id: window.bindingID },
            function (result) {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    displayExistingData();
                } else {
                    app.showNotification(result.error.name, result.error.message);
                }
            }
        );
    }

    //Called once by initialize, plus when new binding is created
    //Simply retrieves the current binding (or defaults) and passes it along to displayDataForBinding
    function displayExistingData() {
        Office.context.document.bindings.getByIdAsync(
            window.bindingID,
            function (result) {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    binding = result.value;
                    displayDataForBinding(binding);
                    // add data-changed event handler to the binding
                    binding.addHandlerAsync(
                        Office.EventType.BindingDataChanged,
                        function () {
                            displayDataForBinding(binding);
                        }
                    );
                } else {
                    //Cannot retrieve binding (error or none exists), so pass null binding
                    displayDataForBinding(null);
                }
            });
    }

    //Takes in binding, calls helper function on the binding's data if it's not null, else calls helper on default data
    function displayDataForBinding(binding) {
        if (binding) {
            binding.getDataAsync({ coercionType: Office.CoercionType.Matrix, valueFormat: Office.ValueFormat.Unformatted, filterType: Office.FilterType.OnlyVisible },
                function (result) {
                    if (result.status === Office.AsyncResultStatus.Succeeded) {
                        displayDataHelper(result.value);
                    } else {
                        app.showNotification("Error retrieving data from binding.", "Bind to a different range and try again.");
                    }
                }
            );
        } else { //No binding exists, dislay default
            var defaultData = [['Category', 'Number'], ['Clicks', 768], ['Free Downloads', 455], ['Purchases', 211], ['Repeat Purchases', 134]];
            displayDataHelper(defaultData);
        }
    }

    //If data meets requirements, this makes associated FunnelChart, clears container, and draws new chart
    function displayDataHelper(data) {
        if (data.length <= 1 || data[0].length !== 2) {
            app.showNotification("Improper data", "Please select two columns and at least two rows and try again");
        } else {
            var chart = new FunnelChart({
                data: data,
                width: 400,
                height: 250
            });
            $('#container').empty();
            chart.draw('#container', window.animationSpeed);
        }
    }

})();
