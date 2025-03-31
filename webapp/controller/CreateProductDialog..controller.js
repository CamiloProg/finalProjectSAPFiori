sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.bootcamp.sapui5.finalproject.view.controller.CreateProductDialog", {
        
        // Para abrir el diálogo de detalle
        onProductPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext("productsModel");
            
            if (!this._oProductDialog) {
                this._oProductDialog = sap.ui.xmlfragment(
                    "com.bootcamp.sapui5.finalproject.view.fragments.ProductDetailDialog",
                    this
                );
                this.getView().addDependent(this._oProductDialog);
            }
            
            this._oProductDialog.bindElement({
                path: oBindingContext.getPath(),
                model: "productsModel"
            });
            
            this._oProductDialog.open();
        },
        
        onCloseAddItemDialog: function() {
            this._oProductDialog.close();
        },
        
        // Para abrir el diálogo de creación
        onCreateProductPress: function() {
            // Verifica si el modelo existe, si no, créalo
            if (!this.getView().getModel("newProduct")) {
                this.getView().setModel(new JSONModel(), "newProduct");
            }
            
            var oViewModel = this.getView().getModel("viewModel") || new JSONModel();
            oViewModel.setProperty("/editMode", false);
            this.getView().setModel(oViewModel, "viewModel");
            
            var oNewProductModel = this.getView().getModel("newProduct");
            oNewProductModel.setData({
                ProductID: 0,
                ProductName: "",
                SupplierID: this.getView().getBindingContext().getProperty("SupplierID"), // Asigna el SupplierID del proveedor actual
                CategoryID: "",
                QuantityPerUnit: "",
                UnitPrice: "",
                Currency: "USD",
                UnitsInStock: 0,
                UnitsOnOrder: 0
            });
            
            if (!this._oCreateDialog) {
                this._oCreateDialog = sap.ui.xmlfragment(
                    "com.bootcamp.sapui5.finalproject.view.fragments.CreateProductDialog",
                    this
                );
                this.getView().addDependent(this._oCreateDialog);
            }
            
            this._oCreateDialog.open();
        },
        
        // Para editar un producto existente
        onEditProductPress: function() {
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/editMode", true);
            
            var oSelectedProduct = this.getView().getModel("productsModel").getProperty(this._oProductDialog.getBindingContext("productsModel").getPath());
            
            var oNewProductModel = this.getView().getModel("newProduct");
            oNewProductModel.setData(oSelectedProduct);
            
            if (!this._oCreateDialog) {
                this._oCreateDialog = sap.ui.xmlfragment(
                    "com.bootcamp.sapui5.finalproject.view.fragments.CreateProductDialog",
                    this
                );
                this.getView().addDependent(this._oCreateDialog);
            }
            
            this._oProductDialog.close();
            this._oCreateDialog.open();
        },
        
        // Para guardar/validar el producto
        onSaveProduct: function() {
            var oNewProduct = this.getView().getModel("newProduct").getData();
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            
            // Validaciones mejoradas
            if (!oNewProduct.ProductName || oNewProduct.ProductName.trim() === "") {
                MessageBox.error(oBundle.getText("productNameRequired"));
                return;
            }
            
            if (!oNewProduct.CategoryID || isNaN(oNewProduct.CategoryID)) {
                MessageBox.error(oBundle.getText("categoryRequired"));
                return;
            }
            
            if (!oNewProduct.UnitPrice || isNaN(oNewProduct.UnitPrice)) {
                MessageBox.error(oBundle.getText("priceRequired"));
                return;
            }
            
            // Convertir tipos de datos
            oNewProduct.UnitPrice = parseFloat(oNewProduct.UnitPrice);
            oNewProduct.UnitsInStock = parseInt(oNewProduct.UnitsInStock) || 0;
            
            // Aquí deberías agregar la lógica para guardar en el backend
            // Por ahora simulamos el guardado
            
            // Actualizar la tabla de productos (simulación)
            var oProductsModel = this.getView().getModel("productsModel");
            var aProducts = oProductsModel.getData() || [];
            
            if (oNewProduct.ProductID === 0) {
                // Nuevo producto - asignar nuevo ID
                oNewProduct.ProductID = aProducts.length > 0 ? 
                    Math.max(...aProducts.map(p => p.ProductID)) + 1 : 1;
                aProducts.push(oNewProduct);
            } else {
                // Editar producto existente
                var iIndex = aProducts.findIndex(p => p.ProductID === oNewProduct.ProductID);
                if (iIndex >= 0) {
                    aProducts[iIndex] = oNewProduct;
                }
            }
            
            oProductsModel.setData(aProducts);
            
            MessageToast.show(oBundle.getText("productSavedSuccessfully"));
            this._oCreateDialog.close();
        },
        
        onCancelProductDialog: function() {
            this._oCreateDialog.close();
        },
        
        onExit: function() {
            if (this._oProductDialog) {
                this._oProductDialog.destroy();
            }
            if (this._oCreateDialog) {
                this._oCreateDialog.destroy();
            }
        }
    });
});