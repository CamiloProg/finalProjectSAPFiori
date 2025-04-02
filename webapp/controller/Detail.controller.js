sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (Controller, MessageBox, JSONModel, Fragment) {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finalproject.controller.Detail", {
        onInit: function () {
            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
            this._initModels();
            this._initTemporaryProductsModel();
            this._clearTemporaryProducts(); 
        },
        _initTemporaryProductsModel: function() {
            this._oTempProductsModel = new JSONModel({
                temporaryProducts: []
            });
            this.getView().setModel(this._oTempProductsModel, "tempProducts");
        },
        _onObjectMatched: function (oEvent) {
            this._sCurrentSupplierID = oEvent.getParameter("arguments").SupplierID;
            
            this.getView().bindElement({
                path: "/Suppliers(" + this._sCurrentSupplierID + ")",
                parameters: {
                    expand: "Products,Products/Category" 
                }
            });
        },

        onNavBack: function () {
    
            this._clearTemporaryProducts();
            this._oRouter.navTo("RouteHome");
        },
        

        _clearTemporaryProducts: function() {
            this._oTempProductsModel.setData({
                temporaryProducts: []
            });
            this._oTempProductsModel.refresh(true);
        },
        
        _initModels: function() {
            if (!this.getView().getModel("newProduct")) {
                this.getView().setModel(new JSONModel({
                    ProductName: "",
                    CategoryID: null,
                    QuantityPerUnit: "",
                    UnitPrice: "",
                    UnitsInStock: ""
                }), "newProduct");
            }
        },

        onAddProduct: function() {
            this._getDialog().then(function(oDialog) {

                this.getView().getModel("newProduct").setData({
                    ProductName: "",
                    CategoryID: null,
                    QuantityPerUnit: "",
                    UnitPrice: "",
                    UnitsInStock: ""
                });
                
                oDialog.setModel(new JSONModel({
                    viewMode: false,
                    dialogTitle: "Nuevo Producto",
                    dialogIcon: "sap-icon://add",
                    editable: true,
                    beginButtonText: "Guardar",
                    beginButtonType: "Emphasized"
                }), "viewModel");
                
                oDialog.open();
            }.bind(this));
        },

        onRowSelected: function(oEvent) {
            var oSelectedRow = oEvent.getParameter("rowContext");
            if (!oSelectedRow) return;
        
            this._getDialog().then(function(oDialog) {
                this._showProductDetails(oSelectedRow, oDialog);
            }.bind(this));
        },
        
        _getDialog: function() {
            if (this._oDialog) {
                return Promise.resolve(this._oDialog);
            }
            
            return Fragment.load({
                id: this.getView().getId(),
                name: "com.bootcamp.sapui5.finalproject.view.fragments.ProductDialog",
                controller: this
            }).then(function(oDialog) {
                this._oDialog = oDialog;
                this.getView().addDependent(this._oDialog);
                return this._oDialog;
            }.bind(this));
        },
        
        _showProductDetails: function(oRowContext, oDialog) {
            oDialog = oDialog || this._oDialog;
            
            var bIsTemporary = oRowContext.getObject().__temporary;
            
            oDialog.setModel(new JSONModel({
                viewMode: true,
                dialogTitle: bIsTemporary ? "Producto Temporal" : "Detalle del Producto",
                dialogIcon: bIsTemporary ? "sap-icon://temporary" : "sap-icon://product",
                editable: false,
                beginButtonText: "Cerrar",
                beginButtonType: "Default",
                isTemporary: bIsTemporary
            }), "viewModel");
        
            if (bIsTemporary) {
                oDialog.bindElement({
                    path: oRowContext.getPath(),
                    model: "tempProducts"
                });
            } else {
                oDialog.bindElement({
                    path: oRowContext.getPath(),
                    parameters: {
                        expand: "Category"
                    }
                });
            }
            
            oDialog.open();
        },

        onDialogButtonPress: function() {
            var oViewModel = this._oDialog.getModel("viewModel").getData();
            
            if (oViewModel.viewMode) {
                this.onCloseViewDialog();
            } else {
                this.onSaveProduct();
            }
        },

        onCancelProductDialog: function () {
            this._oDialog.close();
        },

        onCloseViewDialog: function () {
            this._oDialog.close();
        },

        onSaveProduct: function() {
            var oNewProduct = this.getView().getModel("newProduct").getData();
            

            if (!oNewProduct.ProductName || !oNewProduct.QuantityPerUnit || !oNewProduct.UnitPrice) {
                MessageBox.error("Por favor complete los campos obligatorios");
                return;
            }
            
            oNewProduct.ProductID = "temp-" + new Date().getTime();
            oNewProduct.SupplierID = this._sCurrentSupplierID;
            oNewProduct.__temporary = true;

            if (oNewProduct.CategoryID) {
                oNewProduct.Category = {
                    CategoryID: oNewProduct.CategoryID,
                    CategoryName: this._getSelectedCategoryName() || "Sin categoría"
                };
            }
            
            var oTempModel = this.getView().getModel("tempProducts");
            var aTempProducts = oTempModel.getProperty("/temporaryProducts") || [];
            
            aTempProducts.push(oNewProduct);
     
            oTempModel.setData({
                temporaryProducts: aTempProducts
            });
            console.log("Producto temporal agregado:", oNewProduct);
            console.log("Todos los productos temporales:", aTempProducts);
            oTempModel.refresh(true);
            
            this._oDialog.close();
            MessageBox.success("Producto agregado visualmente");
        },
        onTempRowSelected: function(oEvent) {
            var oSelectedRow = oEvent.getParameter("rowContext");
            if (!oSelectedRow) return;
        
            this._getDialog().then(function(oDialog) {
                this._showProductDetails(oSelectedRow, oDialog);
            }.bind(this));
        },
        _getSelectedCategoryName: function() {
            var oComboBox = Fragment.byId(this.getView().getId(), "categoryComboBox");
            return oComboBox ? oComboBox.getSelectedItem().getText() : null;
        }
    });
});