// Esta ruta delega el POST de usuarios al controlador de creación.
const express = require("express");
const { createUser, getUsers } = require("../controllers/user.controller");

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);

module.exports = router;
