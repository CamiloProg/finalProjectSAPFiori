sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "com/bootcamp/sapui5/finalproject/utils/HomeHelper",
     "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter"
], (Controller, HomeHelper, FilterOperator, Filter,) => {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finalproject.controller.Home", {
        onInit: async function() {
            try {
                let oDatos = await HomeHelper.getDataProducts(); 
                await HomeHelper.setProductModel(this, oDatos[0].results);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
              
            }
        },

        onPress: async function () {
            let oFilter = [];
            let sValue = this.byId("inputFilter").getValue();
            let values = this.getOwnerComponent().getModel("LocalDataModel").getData();
        
            if (sValue) {
                if (isNaN(sValue)) { 
                    oFilter.push(new Filter("CompanyName", FilterOperator.Contains, sValue));
                } else { 
                    oFilter.push(new Filter("SupplierID", FilterOperator.EQ, sValue));
                }
            }   
            
            if (values.selectedKeyMulti && Array.isArray(values.selectedKeyMulti) && values.selectedKeyMulti.length > 0) {
                values.selectedKeyMulti.forEach(element => {
                    oFilter.push(new Filter("City", FilterOperator.EQ, element)); 
                });
            }
            
            let oDatos = await HomeHelper.getDataProducts(oFilter);
            await HomeHelper.setProductModel(this, oDatos[0].results);
        },
      
        onItemPress: function(oEvent) {

            var oBindingContext = oEvent.getParameter("rowBindingContext");
            
            if (!oBindingContext) {
                console.error("No se pudo obtener el binding context");
                return;
            }
      
            var oCustomer = oBindingContext.getObject();
            
            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                SupplierID: oCustomer.SupplierID
            });
        }
    });
});