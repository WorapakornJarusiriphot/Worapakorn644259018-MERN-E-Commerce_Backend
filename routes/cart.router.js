/**
 * @swagger
 * components:
 *  schemas:
 *      Cart:
 *          type: object
 *          required:
 *              -   productId
 *              -   name
 *              -   email
 *              -   price
 *              -   image
 *              -   quantity
 *          properties:
 *              productId:
 *                  type: string
 *                  description: The id of the product
 *              name:
 *                  type: string
 *                  description: The name of the product
 *              email:
 *                  type: string
 *                  description: The email of the user
 *              image:
 *                  type: string
 *                  description : The image of the product
 *              price:
 *                  type: number
 *                  description: The price of the product
 *              quantity:
 *                  type: number
 *                  description: The quantiy of the product
 *          example:
 *              productId:  "60c5xxxxx"
 *              name: "Macbook Pro"
 *              price: 2000
 *              email: "worapakorn@gmail.com"
 *              image: "https://source.unsplash.com/random/100x100/?macbook"
 *              quantity: 5
 * tags:
 *  name: Carts
 *  description: The cart items managing API
 */
const express = require("express");
const router = express.Router();
const CartModel = require("../models/Cart.model");

/**
 * @swagger
 * /carts:
 *  get:
 *      summary: Retrieve a list of all cart items.
 *      tags: [Carts]
 *      responses:
 *          200:
 *              description: A list of cart Items.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Cart'
 *          500:
 *              description: Some error happened
 */
router.get("/", async (req, res) => {
  try {
    const carts = await CartModel.find();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /carts/{email}:
 *  get:
 *      summary: Get cart items by email
 *      tags: [Carts]
 *      parameters:
 *          -   in: path
 *              name: email
 *              required: true
 *              schema:
 *                  type: string
 *              description: The user email
 *      responses:
 *          200:
 *              description: The cart items by email.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Cart'
 *          404:
 *              description: Cart item not found
 *          500:
 *              description: Some error happened
 */
router.get("/:email", async (req, res) => {
  const { email } = req.params;
  try {
    // console.log(email);
    const carts = await CartModel.find({ email });

    if (!carts) {
      res.status(404).json({ message: "Cart item not found" });
    }
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /carts:
 *  post:
 *      summary: Create a cart item
 *      tags: [Carts]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Cart'
 *      responses:
 *          200:
 *              description: The cart Items is successfully updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Cart'
 *          201:
 *              description: The cart Items is successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Cart'
 *          500:
 *              description: Some error happened
 */
router.post("/", async (req, res) => {
  const cart = req.body;
  try {
    const existingCart = await CartModel.findOne({
      productId: cart.productId,
      email: cart.email,
    });
    if (existingCart) {
      //Existing
      existingCart.quantity += cart.quantity;
      await existingCart.save();
      return res.status(200).json(cart);
    }
    const newCart = new CartModel(cart);
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /carts/{id}:
 *  put:
 *      summary: Update the cart item details
 *      tags: [Carts]
 *      parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              schema:
 *                  type: string
 *              description: The cart id
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Cart'
 *      responses:
 *          200:
 *              description: The cart by id.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Cart'
 *          404:
 *              description: Cart not found
 *          500:
 *              description: Some error happened
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  console.log(id, data);
  try {
    const cart = await CartModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /carts/{id}:
 *  delete:
 *      summary: Delete cart item by id
 *      tags: [Carts]
 *      parameters:
 *          -   in: path
 *              name: id
 *              required: true
 *              schema:
 *                  type: string
 *              description: The cart item id
 *      responses:
 *          200:
 *              description: The cart item is deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Cart'
 *          404:
 *              description: Cart not found
 *          500:
 *              description: Some error happened
 */
router.delete("/:id", async (req, res) => {
  try {
    const cart = await CartModel.findByIdAndDelete(req.params.id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /carts/{email}:
 *  delete:
 *      summary: Delete all cart items by email
 *      tags: [Carts]
 *      parameters:
 *          -   in: path
 *              name: email
 *              required: true
 *              schema:
 *                  type: string
 *              description: The user email
 *      responses:
 *          200:
 *              description: The all cart items are deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Cart'
 *          404:
 *              description: Empty cart
 *          500:
 *              description: Some error happened
 */
router.delete("/clear/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const deletedCart = await CartModel.deleteMany({ email });
    if (deletedCart.deletedCount > 0) {
      return res.status(200).json(deletedCart);
    }
    //Cannot deleted
    res.status(404).json({ message: "Empty cart" });
  } catch (error) {
    //Internal Server Error
    //Error Handling
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;