sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finalproject.controller.Detail", {
        onInit: function () {
            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
            this._initModels();
        },

        _onObjectMatched: function (oEvent) {
            this._sCurrentSupplierID = oEvent.getParameter("arguments").SupplierID;
            
            // Cargar datos del proveedor y sus productos
            this.getView().bindElement({
                path: "/Suppliers(" + this._sCurrentSupplierID + ")",
                parameters: {
                    expand: "Products"
                }
            });
            
            // Cargar categorías si no están cargadas
            var oModel = this.getView().getModel();
            if (!oModel.getProperty("/Categories")) {
                oModel.read("/Categories", {
                    success: function(oData) {
                        oModel.setProperty("/Categories", oData.results);
                    }.bind(this),
                    error: function(oError) {
                        // Si falla, inicializar como array vacío
                        oModel.setProperty("/Categories", []);
                    }
                });
            }
        },

        onNavBack: function () {
            this._oRouter.navTo("RouteHome");
        },
        _initModels: function() {
            if (!this.getView().getModel("newProduct")) {
                this.getView().setModel(new JSONModel({
                    ProductName: "",
                    CategoryID: null, // Para el ComboBox
                    QuantityPerUnit: "",
                    UnitPrice: "",
                    UnitsInStock: ""
                }), "newProduct");
            }
        },
        onDialogButtonPress: function () {

            var oViewModel = this._oDialog.getModel("viewModel").getData();

            if (oViewModel.viewMode) {
                this.onCloseViewDialog();
            } else {
                this.onSaveProduct();
            }
        },


        onAddProduct: function() {
            if (!this.getView().getModel("newProduct")) {
                this._initModels();
            }
            
            // Resetear el modelo de nuevo producto
            this.getView().getModel("newProduct").setData({
                ProductName: "",
                CategoryID: null,
                QuantityPerUnit: "",
                UnitPrice: "",
                UnitsInStock: ""
            });
            
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment(
                    "com.bootcamp.sapui5.finalproject.view.fragments.ProductDialog",
                    this
                );
                this.getView().addDependent(this._oDialog);
            }
            
            this._oDialog.setModel(new JSONModel({
                viewMode: false,
                dialogTitle: "Nuevo Producto",
                dialogIcon: "sap-icon://add",
                editable: true,
                beginButtonText: "Guardar",
                beginButtonType: "Emphasized"
            }), "viewModel");
            
            this._oDialog.open();
        },
        onProductPress: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("rowContext");

            if (!oSelectedItem) return;

            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment(
                    "com.bootcamp.sapui5.finalproject.view.fragments.ProductDialog",
                    this
                );
                this.getView().addDependent(this._oDialog);
            }

            this._oDialog.setModel(new sap.ui.model.json.JSONModel({
                viewMode: true,
                dialogTitle: "Detalle del Producto",
                dialogIcon: "sap-icon://product",
                editable: false,
                beginButtonText: "Cerrar",
                beginButtonType: "Default"
            }), "viewModel");

            this._oDialog.bindElement({
                path: oSelectedItem.getPath(),
                parameters: {
                    expand: "Category"
                }
            });

            this._oDialog.open();
        },

        onCancelProductDialog: function () {
            this._oDialog.close();
        },

        onCloseViewDialog: function () {
            this._oDialog.close();
        },

        onSaveProduct: function() {
            var oNewProduct = this.getView().getModel("newProduct").getData();
            var oSupplierModel = this.getView().getModel();
            
            // Validar campos obligatorios
            if (!oNewProduct.ProductName || !oNewProduct.CategoryID) {
                MessageBox.error("Por favor complete los campos obligatorios");
                return;
            }
            
            // Obtener categoría seleccionada (con comprobación de seguridad)
            var aCategories = oSupplierModel.getProperty("/Categories") || [];
            var sCategoryName = "";
            
            // Buscar el nombre de la categoría (forma compatible)
            for (var i = 0; i < aCategories.length; i++) {
                if (aCategories[i].CategoryID == oNewProduct.CategoryID) {
                    sCategoryName = aCategories[i].CategoryName;
                    break;
                }
            }
            
            // Crear objeto de producto con formato compatible
            var oProductToAdd = {
                ProductID: "temp_" + Math.random().toString(36).substr(2, 9),
                ProductName: oNewProduct.ProductName,
                Category: {
                    CategoryID: oNewProduct.CategoryID,
                    CategoryName: sCategoryName
                },
                QuantityPerUnit: oNewProduct.QuantityPerUnit,
                UnitPrice: parseFloat(oNewProduct.UnitPrice) || 0,
                UnitsInStock: parseInt(oNewProduct.UnitsInStock) || 0
            };
            
            // Obtener productos actuales o inicializar array si no existe
            var sSupplierPath = "/Suppliers(" + this._sCurrentSupplierID + ")";
            var aProducts = oSupplierModel.getProperty(sSupplierPath + "/Products") || [];
            
            // Agregar el nuevo producto
            aProducts.push(oProductToAdd);
            
            // Actualizar el modelo
            oSupplierModel.setProperty(sSupplierPath + "/Products", aProducts);
            
            // Cerrar el diálogo
            this._oDialog.close();
            
            // Mostrar mensaje de éxito
            MessageBox.success("Producto agregado visualmente");
            
            // Forzar actualización de la tabla
            var oTable = this.byId("productsTable");
            if (oTable && oTable.getBinding("rows")) {
                oTable.getBinding("rows").refresh();
            }
        },
    });
});