/**
 * @swagger
 * components:
 *  schemas:
 *      Product:
 *          type: object
 *          required:
 *              -   name
 *              -   price
 *              -   description
 *              -   image
 *              -   category
 *          properties:
 *              name:
 *                  type: string
 *                  description: The name of the product
 *              price:
 *                  type: number
 *                  description: The price of the product
 *              description:
 *                  type: string
 *                  description: The description of the product
 *              image:
 *                  type: string
 *                  description : The image of the product
 *              category:
 *                  type: string
 *                  description: The category of the product
 *          example:
 *              name: "Macbook Pro"
 *              price: 2000
 *              description: "A great laptop"
 *              image: "https://source.unsplash.com/random/100x100/?macbook"
 *              category: "Electronics"
 * tags:
 *  name: Products
 *  description: The products managing API
 */
const express = require("express");
const router = express.Router();
const ProductModel = require("../models/Product.model");

/**
 * @swagger
 * /products:
 *  get:
 *      summary: Retrieve a list of product.
 *      tags: [Products]
 *      responses:
 *          200:
 *              description: A list of products.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Product'
 *          500:
 *              description: Some error happened
 */
router.get("/", async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *  get:
 *      summary: Get product by id
 *      tags: [Products]
 *      parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              schema:
 *                  type: string
 *              description: The product id
 *      responses:
 *          200:
 *              description: The product by id.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Product'
 *          404:
 *              description: Product not found
 *          500:
 *              description: Some error happened
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /products:
 *  post:
 *      summary: Create a new product
 *      tags: [Products]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Product'
 *      responses:
 *          201:
 *              description: The product is successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Product'
 *          500:
 *              description: Some error happened
 */
router.post("/", async (req, res) => {
  const newProduct = new ProductModel(req.body);
  try {
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *  put:
 *      summary: Update the product details
 *      tags: [Products]
 *      parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              schema:
 *                  type: string
 *              description: The product id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Product'
 *      responses:
 *          200:
 *              description: The product by id.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Product'
 *          404:
 *              description: Product not found
 *          500:
 *              description: Some error happened
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  console.log(id, data);
  try {
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *  delete:
 *      summary: Delete product by id
 *      tags: [Products]
 *      parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              schema:
 *                  type: string
 *              description: The product id
 *      responses:
 *          200:
 *              description: The product is deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Product'
 *          404:
 *              description: Product not found
 *          500:
 *              description: Some error happened
 */
router.delete("/:id", async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
