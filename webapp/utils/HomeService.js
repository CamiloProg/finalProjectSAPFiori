sap.ui.define([
], function () {
    "use strict";

    return {
        readProducts: async function (oModel, oFilter) {
            const aRequestsPromises = [
                new Promise(function (resolve, reject) {
                    oModel.read('/Suppliers', {
                        filters: oFilter,
                        success: resolve,
                        error: reject,
                    })
                }.bind(this))
            ];

            return Promise.all(aRequestsPromises);
        },
    }
});