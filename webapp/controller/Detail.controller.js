sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], function(Controller, MessageBox) {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finalproject.controller.Detail", {
        onInit: function() {
            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            // Obtener el ProductID de la URL y enlazar el contexto
            let sSupplierID = oEvent.getParameter("arguments").SupplierID;


            this.getView().bindElement({
                path: "/Suppliers(" + sSupplierID + ")",
                parameters: {
                    expand: "Products"
                }
            })},
              onNavBack: function() {
            this._oRouter.navTo("RouteHome");
        },
        onAddProduct: function() {
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment(
                    "com.bootcamp.sapui5.finalproject.view.fragments.CreateProductDialog",
                    this
                );
                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.open();
        },
        onCancelProductDialog: function() {
            this._oDialog.close();
        },
        onProductPress: function(oEvent) {
            var oSelectedItem = oEvent.getParameter("rowContext");
            
            if (!oSelectedItem) return;
            
            if (!this._oViewDialog) {
                this._oViewDialog = sap.ui.xmlfragment(
                    "com.bootcamp.sapui5.finalproject.view.fragments.ViewProductDialog",
                    this
                );
                this.getView().addDependent(this._oViewDialog);
            }
            
            this._oViewDialog.bindElement({
                path: oSelectedItem.getPath(),
                parameters: {
                    expand: "Category" // Ensure Category data is loaded
                }
            });
            
            this._oViewDialog.open();
        },
        
        onCloseViewDialog: function() {
            this._oViewDialog.close();
        },

        // _onObjectMatched: function(oEvent) {
        //     try {
        //         const sSupplierID = oEvent.getParameter("arguments").SupplierID;
                
        //         if (!sSupplierID) {
        //             MessageBox.error("ID de proveedor no proporcionado");
        //             this._oRouter.navTo("RouteHome");
        //             return;
        //         }

        //         this.getView().setBusy(true);

        //         // Configurar binding para el proveedor - Sintaxis correcta para OData V2
        //         this.getView().bindElement({
        //             path: "/Suppliers(" + sSupplierID + ")",
        //             parameters: {
        //                 // Sintaxis correcta para expand en OData V2
        //                 expand: "Products"
        //             },
        //             events: {
        //                 change: this._onBindingChange.bind(this),
        //                 dataReceived: this._onDataReceived.bind(this)
        //             }
        //         });

        //     } catch (oError) {
        //         MessageBox.error("Error al cargar datos: " + oError.message);
        //         console.error(oError);
        //         this.getView().setBusy(false);
        //     }
        // },

        // _onDataReceived: function() {
        //     const oContext = this.getView().getBindingContext();
        //     if (oContext) {
        //         console.log("Datos del proveedor cargados:", oContext.getObject());
        //     }
        //     this.getView().setBusy(false);
        // },

        // _onBindingChange: function() {
        //     if (!this.getView().getBindingContext()) {
        //         MessageBox.error("No se encontró el proveedor solicitado");
        //         this._oRouter.navTo("RouteHome");
        //         this.getView().setBusy(false);
        //     }
        // },

        // onNavBack: function() {
        //     this._oRouter.navTo("RouteHome");
        // },

        // onProductDetailsPress: function(oEvent) {
        //     // Obtener el producto seleccionado
        //     const oContext = oEvent.getParameter("rowBindingContext");
        //     if (!oContext) return;
            
        //     // Crear diálogo si no existe
        //     if (!this._oProductDialog) {
        //         this._oProductDialog = sap.ui.xmlfragment(
        //             "com.bootcamp.sapui5.finalproject.view.fragments.ProductDetail",
        //             this
        //         );
        //         this.getView().addDependent(this._oProductDialog);
        //     }
            
        //     // Enlazar datos y mostrar diálogo
        //     this._oProductDialog.bindElement(oContext.getPath());
        //     this._oProductDialog.open();
        // },
        
        // onAddProduct: function() {
        //     // Crear diálogo de creación si no existe
        //     if (!this._oCreateDialog) {
        //         this._oCreateDialog = sap.ui.xmlfragment(
        //             "com.bootcamp.sapui5.finalproject.view.fragments.CreateProduct",
        //             this
        //         );
        //         this.getView().addDependent(this._oCreateDialog);
        //     }
            
        //     // Crear nuevo modelo para el producto temporal
        //     this.getView().setModel(new sap.ui.model.json.JSONModel({}), "newProduct");
        //     this._oCreateDialog.bindElement("newProduct>/");
        //     this._oCreateDialog.open();
        // },
        
        // onCloseDialog: function() {
        //     this._oProductDialog.close();
        // },
        
        // onCancelDialog: function() {
        //     this._oCreateDialog.close();
        // },
        
        // onSaveProduct: function() {
        //     // Validar campos obligatorios
        //     const oData = this.getView().getModel("newProduct").getData();
            
        //     if (!oData.ProductName || !oData.UnitPrice) {
        //         MessageBox.error("Complete todos los campos obligatorios");
        //         return;
        //     }
            
        //     // Simular guardado
        //     MessageBox.success("Producto creado exitosamente (simulación)");
        //     this._oCreateDialog.close();
        // }
    });
});