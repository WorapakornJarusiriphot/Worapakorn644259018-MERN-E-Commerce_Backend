const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const productRouter = require("./routes/product.router");
const cartRouter = require("./routes/cart.router");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const admin = require('firebase-admin');
const serviceAccount = require('./mern-e-commerce-woja-firebase-adminsdk-rrao7-b60aec0627.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "RESTful API for SE Shop",
    version: "1.0.0",
    description: "This is a REST API application made with Express for SE Shop",
    license: {
      name: "Licensed Under MIT",
      url: "https://spdx.org/licenses/MIT.html",
    },
    contact: {
      name: "Worapakorn Jarusiriphot",
      url: "https://www.youtube.com/channel/UChBSP5RDoVu7jcA1lBK6aww",
      email: "644259018@webmail.npru.ac.th",
    },
  },
  externalDocs: {
    description: "Download Swagger.json",
    url: "/swagger.json",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
//config .env
dotenv.config();
const app = express();
const CLIENT_URL = process.env.CLIENT_URL;
app.use(cors({ credentials: true, origin: CLIENT_URL }));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/swagger.json", (req, res) => {
  res.header("Content-Type", "application/json");
  res.send(swaggerSpec);
});

//Database Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI);

app.get("/", (req, res) => {
  res.send("<h1>This is a RESTful API for SE Shop</h1>");
});
//Add Router
app.use("/products", productRouter);
app.use("/carts", cartRouter);
app.get('/all-users', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      isAnonymous: userRecord.isAnonymous,
      photoURL: userRecord.photoURL
    }));
    res.json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).send('Internal server error');
  }
});

//Run Server
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
