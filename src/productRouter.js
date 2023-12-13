const express = require("express");
const productRouter = express.Router();

module.exports = (productManager, io) => {
  productRouter.get("/", async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    try {
      const products = await productManager.getProducts(
        limit,
        page,
        sort,
        query
      );

      const totalPages = Math.ceil(products.total / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;

      const prevLink = hasPrevPage
        ? `/api/products?limit=${limit}&page=${
            page - 1
          }&sort=${sort}&query=${query}`
        : null;
      const nextLink = hasNextPage
        ? `/api/products?limit=${limit}&page=${
            page + 1
          }&sort=${sort}&query=${query}`
        : null;

      res.json({
        status: "success",
        payload: products.docs,
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page: parseInt(page),
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
      });
    } catch (error) {
      res.status(404).json({ status: "error", error: error.message });
    }
  });

  productRouter.get("/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
      const product = await productManager.getProductById(productId);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  productRouter.post("/", async (req, res) => {
    try {
      const newProduct = req.body;
      productManager.addProduct(newProduct);

      io.emit("productsUpdated", await productManager.getProducts());

      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  productRouter.put("/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
      const updatedProduct = req.body;
      productManager.updateProduct(productId, updatedProduct);

      io.emit("productsUpdated", await productManager.getProducts());

      res.json(updatedProduct);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  productRouter.delete("/:pid", async (req, res) => {
    const productId = parseInt(req.params.pid);
    try {
      productManager.deleteProduct(productId);

      io.emit("productsUpdated", await productManager.getProducts());

      res.status(204).end();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  return productRouter;
};
