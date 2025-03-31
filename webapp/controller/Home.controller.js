sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "com/bootcamp/sapui5/finalproject/utils/HomeHelper",
     "sap/ui/model/FilterOperator",
     "sap/ui/model/FilterType",
     "sap/ui/model/Filter",
], (Controller, HomeHelper, FilterOperator, FilterType, Filter,) => {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finalproject.controller.Home", {
        onInit: async function() {
            try {
                let oDatos = await HomeHelper.getDataProducts(); 
                await HomeHelper.setProductModel(this, oDatos[0].results);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
                // Puedes agregar aquí manejo de errores, como mostrar un mensaje al usuario
            }
        },

        onPress: async function (oEvent) {

            let oFilter = [];
            //let sValue = this.byId("idLabel1").getValue();
            //let sValueCombo = this.byId("comboboxID").getSelectedKey();

            // let oTable = this.getView().byId("idProductsTable");
            // let oBinding = oTable.getBinding("items");

            let values = this.getOwnerComponent().getModel("LocalDataModel").getData();
            console.log(values);

            
            if(values.selectedKey){
                oFilter.push(new Filter("SupplierID", FilterOperator.EQ, values.selectedKey));
            }          
            
            if(values.selectedKeyMulti.length > 0){
                
                values.selectedKeyMulti.forEach(element => {
                    oFilter.push(new Filter("City", FilterOperator.EQ, element)); 
                });
                
            }
            if(values.selectedItem){
                oFilter.push(new Filter("CompanyName", FilterOperator.EQ, values.selectedItem));
            }      
            
                
           
         
       
            let oDatos = await HomeHelper.getDataProducts(oFilter);
            await HomeHelper.setProductModel(this, oDatos[0].results);
        },

      
        onItemPress: function(oEvent) {
            // Obtiene el contexto de binding del elemento clickeado
            var oBindingContext = oEvent.getParameter("rowBindingContext");
            
            if (!oBindingContext) {
                console.error("No se pudo obtener el binding context");
                return;
            }
            
            // Obtiene los datos del elemento
            var oCustomer = oBindingContext.getObject();
            
            // Navegar a la vista de detalle
            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                SupplierID: oCustomer.SupplierID
            });
        }
    });
});