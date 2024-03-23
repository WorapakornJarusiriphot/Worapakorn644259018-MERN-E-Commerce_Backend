/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *              - name
 *              - email
 *              - photoURL
 *          properties:
 *              name:
 *                  type: string
 *                  description: The name of the user
 *              email:
 *                  type: string
 *                  description: The email of the user
 *              photoURL:
 *                  type: string
 *                  description: The URL of the user's photo
 *              role:
 *                  type: string
 *                  description: The role of the user
 *          example:
 *              name: Worapakorn Jarusiriphot
 *              email: "worapakorn@gmail.com"
 *              photoURL: "https://source.unsplash.com/random/100x100/?worapakornjarusiriphot.jpg"
 *              role: user
 */
const express = require("express");
const router = express.Router();
const UserModel = require("../models/User.model");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

/**
 * @swagger
 * /users:
 *  get:
 *      summary: Retrieve a list of all users.
 *      tags: [Users]
 *      responses:
 *          200:
 *              description: A list of users.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/User'
 */
router.get("/", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *  get:
 *      summary: Get a user by ID
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: The user ID
 *      responses:
 *          200:
 *              description: A single user object.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          404:
 *              description: User not found
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // console.log(email);
    const user = await UserModel.findById(id);

    if (!user) {
      res.status(404).json({ message: "User is not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users:
 *  post:
 *      summary: Create a new user
 *      tags: [Users]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          201:
 *              description: The user was successfully created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          302:
 *              description: User already exists
 */
router.post("/", async (req, res) => {
  const user = req.body;
  try {
    const existingUser = await UserModel.findOne({
      email: user.email,
    });
    if (existingUser) {
      return res.status(302).json({ message: "User already exists" });
    }
    if (!req.body.photoURL) {
      req.body.photoURL =
        "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg";
    }
    if (!req.body.role) {
      req.body.role = "user";
    }
    const newUser = new UserModel(user);
    // console.log(newUser);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *  put:
 *      summary: Update a user by ID
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: The user ID
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          200:
 *              description: The user was successfully updated.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          404:
 *              description: User not found
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  //   console.log(id, data);
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *  delete:
 *      summary: Delete a user by ID
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: The user ID
 *      responses:
 *          200:
 *              description: The user was successfully deleted.
 *          404:
 *              description: User not found
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/admin/{email}:
 *  get:
 *      summary: Check if a user is an admin
 *      tags: [Users]
 *      parameters:
 *          - in: path
 *            name: email
 *            required: true
 *            schema:
 *              type: string
 *            description: The user's email
 *      responses:
 *          200:
 *              description: Returns whether the user is an admin.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              isAdmin:
 *                                  type: boolean
 *          500:
 *              description: Server error
 */
//Check if a user is an admin
router.get("/admin/:email", verifyToken, async (req, res) => {
  try {
    const { email } = req.params;
    const user = await UserModel.findOne({ email });
    let isAdmin = false;
    if (user.role === "admin") {
      isAdmin = true;
    }
    res.json({ isAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/user/{id}:
 *  patch:
 *      summary: Change an admin user to a regular user role
 *      tags: [Users]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: The user's ID
 *      responses:
 *          200:
 *              description: User role updated to 'user'.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          404:
 *              description: User not found
 *          500:
 *              description: Server error
 */
//Change Admin to User Role
router.patch("/user/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        role: "user",
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/admin/{id}:
 *  patch:
 *      summary: Change a regular user to an admin role
 *      tags: [Users]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: string
 *            description: The user's ID
 *      responses:
 *          200:
 *              description: User role updated to 'admin'.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          404:
 *              description: User not found
 *          500:
 *              description: Server error
 */
//Change User to Admin Role
router.patch("/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        role: "admin",
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;