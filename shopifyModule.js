const secrets = require('./secrets');
const rp = require('request-promise')
const shopifyRoutes = require('./shopifyRoutes');
const parseLinkHeader = require('parse-link-header');

const DOMAIN = shopifyRoutes.DOMAIN;
const HTTPS_INDEX = 8;

let injectAuthToUrl = (url) => url.slice(0, HTTPS_INDEX) + `${secrets.API_KEY}:${secrets.PASSWORD}` + `@` + url.slice(HTTPS_INDEX, url.length);


let requestWithHeaders = async (uri) => {
    let options = {
        uri: injectAuthToUrl(uri),
        resolveWithFullResponse: true
    }
    return await rp.get(options);
}

let getAllProductsIds = async () => {
    let url = `https://${DOMAIN}${shopifyRoutes.admin.ALL_PRODUCTS}`;

    res = await requestWithHeaders(url)

    let products = JSON.parse(res.body).products;
    let productIds = products.map(product => product.id);

    let next = parseLinkHeader(res.headers.link) ? parseLinkHeader(res.headers.link).next : null;

    while (next) {
        res = await requestWithHeaders(next.url);
        products = JSON.parse(res.body).products;
        let idsBuffer = products.map(product => product.id);
        productIds = productIds.concat(idsBuffer);
        next = parseLinkHeader(res.headers.link).next;
    }
    return productIds;

}


let getAllProductVariants = async (productId) => {
    let url = `https://${DOMAIN}${shopifyRoutes.admin.VARIANTS_OF_PRODUCT(productId)}`;
    res = await requestWithHeaders(url);
    return JSON.parse(res.body).variants;
};

let getAllSKUByAmounts = (variant) => {
    ret = {};
    ret[variant.sku] = variant.inventory_quantity;
    return ret;
};

module.exports.getInvetory = async () => {
    let productIds = await getAllProductsIds();

    let getVariantPromises = productIds.map(id => {
        return async () => {
            let variants = await getAllProductVariants(id);
            return variants;
        };
    })

    let productVariants = await Promise.all(getVariantPromises.map(fn => fn()));
    productVariants = [].concat.apply([], productVariants);

    let inventory = productVariants.map(variant => getAllSKUByAmounts(variant));
    return inventory;
}
