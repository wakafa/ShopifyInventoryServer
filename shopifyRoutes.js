module.exports.admin = {
    ALL_PRODUCTS: '/admin/api/2020-01/products.json',
    VARIANTS_OF_PRODUCT: (productId) => `/admin/api/2020-01/products/${productId}/variants.json`,
}

module.exports.DOMAIN = "fake-store-1234.myshopify.com";
