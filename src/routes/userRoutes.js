// Esta ruta delega el POST de usuarios al controlador de creación.
const express = require("express");
const { createUser } = require("../controllers/user.controller");

const router = express.Router();

router.post("/", createUser);

module.exports = router;
