const express = require("express");
const app = express();
const shopify = require('./shopifyModule');


let startServer = () => {
  app.get('/', (req, res) => {
    res.send("Hey There");
    res.end();
  });

  app.get('/inventory', async (req, res) => {
    let inventory = await shopify.getInvetory();
    res.send(inventory);
    res.end();
  });

  const port = process.env.port || 8080;

  app.listen(port, () => console.log(`Listetning on port ${port} ... `));
}


startServer();