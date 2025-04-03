sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
], function (Controller, MessageBox, JSONModel, Fragment, ) {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finalproject.controller.Detail", {
        onInit: function () {
            this._oRouter = this.getOwnerComponent().getRouter();
            this._oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
            
            this._loadCategories();
            this._initLocalModels();
        },
        _loadCategories: function() {
            let oModel = this.getOwnerComponent().getModel();
            oModel.read("/Categories", {
                success: function(oData) {
                    let oCategoriesModel = new JSONModel(oData.results);
                    this.getView().setModel(oCategoriesModel, "categories");
                    
            
                    if (this._oDialog) {
                        this._oDialog.setModel(oCategoriesModel, "categories");
                    }
                }.bind(this),
                error: function(oError) {
                    console.error("Error loading categories:", oError);
                }
            });
        },
        _initLocalModels: function() {
    
            this.getView().setModel(new JSONModel({
                products: [],
                temporaryProducts: [],
                newProduct: {
                    ProductName: "",
                    CategoryID: null,
                    QuantityPerUnit: "",
                    UnitPrice: "",
                    UnitsInStock: ""
                }
            }), "localModel");
        },

        _onObjectMatched: function (oEvent) {
            this._sCurrentSupplierID = oEvent.getParameter("arguments").SupplierID;
            console.log("SupplierID matched:", this._sCurrentSupplierID);
            
    
            this.getView().bindElement({
                path: "/Suppliers(" + this._sCurrentSupplierID + ")"
            });
            

            this._loadSupplierProducts();
        },

     
        _loadSupplierProducts: function() {
            let oModel = this.getOwnerComponent().getModel();
            let sPath = "/Suppliers(" + this._sCurrentSupplierID + ")/Products";
            
            console.log("Cargando productos desde:", sPath);
            
      
            oModel.read(sPath, {
                urlParameters: {
                    "$expand": "Category"
                },
                success: function(oData) {
                    console.log("Productos cargados correctamente:", oData);
                    
                    let aProducts = oData.results || [];
                    console.log("Productos parseados:", aProducts);
        
                    let oLocalModel = this.getView().getModel("localModel");
                    let aTempProducts = oLocalModel.getProperty("/temporaryProducts") || [];
       
                    let aCombinedProducts = aProducts.concat(aTempProducts);
                    oLocalModel.setProperty("/products", aCombinedProducts);
                    
                    oLocalModel.refresh(true);
                }.bind(this),
                error: function(oError) {
                    console.error("Error al cargar productos:", oError);
                    MessageBox.error("Error al cargar productos: " + (oError.message || "Unknown error"));
                }
            });
        },

        onNavBack: function() {

            let oLocalModel = this.getView().getModel("localModel");
            oLocalModel.setProperty("/temporaryProducts", []);
            oLocalModel.setProperty("/products", []);
            
  
            this._oRouter.navTo("RouteHome");
        },

        onAddProduct: function() {
            this._getDialog().then(function(oDialog) {
           
                this.getView().getModel("localModel").setProperty("/newProduct", {
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
                
          
                let oBeginButton = oDialog.getBeginButton();
                if (oBeginButton) {
                    oBeginButton.setEnabled(true); 
                }
                
                oDialog.open();
            }.bind(this));
        },

        onRowSelected: function(oEvent) {
            let oSelectedRow = oEvent.getParameter("rowContext");
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
                
             
                this._oDialog.setModel(this.getView().getModel("localModel"), "localModel");
                this._oDialog.setModel(this.getView().getModel("categories"), "categories");
                
                return this._oDialog;
            }.bind(this));
        },
        
        _showProductDetails: function(oRowContext, oDialog) {
            let oLocalModel = this.getView().getModel("localModel");
            let oProduct = oLocalModel.getProperty(oRowContext.getPath());
            let bIsTemporary = oProduct.__temporary;
            

            oDialog.setModel(new JSONModel({
                viewMode: true,
                dialogTitle: bIsTemporary ? "Producto Temporal" : "Detalle del Producto",
                dialogIcon: bIsTemporary ? "sap-icon://temporary" : "sap-icon://product",
                editable: false,
                beginButtonText: "Cerrar",
                beginButtonType: "Default",
                isTemporary: bIsTemporary
            }), "viewModel");
      
            oDialog.setModel(oLocalModel, "localModel");
            
     
            oDialog.bindElement({
                path: oRowContext.getPath(),
                model: "localModel"
            });
            
            oDialog.open();
        },

        onSaveProduct: function() {
            let oLocalModel = this.getView().getModel("localModel");
            let oNewProduct = oLocalModel.getProperty("/newProduct");
            if (!oNewProduct.ProductName || !oNewProduct.QuantityPerUnit || !oNewProduct.UnitPrice) {
                MessageBox.error("Por favor complete los campos obligatorios");
                return;
            }
      
            oNewProduct.ProductID =  new Date().getTime();
            oNewProduct.SupplierID = this._sCurrentSupplierID;
            oNewProduct.__temporary = true;
            
            if (oNewProduct.CategoryID) {
                oNewProduct.Category = {
                    CategoryID: oNewProduct.CategoryID,
                    CategoryName: this._getSelectedCategoryName() || "Sin categoría"
                };
            }
            

            let aTempProducts = oLocalModel.getProperty("/temporaryProducts") || [];
            aTempProducts.push(oNewProduct);
            oLocalModel.setProperty("/temporaryProducts", aTempProducts);
            

            this._loadSupplierProducts();
            
            this._oDialog.close();
            MessageBox.success("Producto agregado visualmente");
        },

        _getSelectedCategoryName: function() {
            let oComboBox = Fragment.byId(this.getView().getId(), "categoryComboBox");
            return oComboBox ? oComboBox.getSelectedItem().getText() : null;
        },

        onDialogButtonPress: function() {
            let oViewModel = this._oDialog.getModel("viewModel").getData();
            
            if (oViewModel.viewMode) {
                this.onCloseViewDialog();
            } else {
                this.onSaveProduct();
            }
        },

        onCancelProductDialog: function() {
            this._oDialog.close();
        },

        onCloseViewDialog: function() {
            this._oDialog.close();
        }
    });
});