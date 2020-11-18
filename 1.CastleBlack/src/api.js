const { Router } = require("express");
const api = Router();
const authMiddleware = require('./middlewares/auth.js');

// This will be your data source
var players = [
  { id: 1, name: "Jon Snow", age: 23, health: 100, bag: [1] },
  { id: 2, name: "Littlefinger", age: 35, health: 100, bag: [2] },
  { id: 3, name: "Daenerys Targaryen", age: 20, health: 100, bag: [3] },
  { id: 4, name: "Samwell Tarly", age: 18, health: 100, bag: [4] }
];
var objects = [
  { id: 1, name: "spoon", value: -1 },
  { id: 3, name: "sword", value: -20 },
  { id: 2, name: "knife", value: -10 },
  { id: 4, name: "potion", value: +20 },
  { id: 5, name: "staff", value: -20 }
];

// GLOBAL MIDDLEWARE
api.use(authMiddleware);    // Check Header Auth Bearer Token
// EXAMPLE ENDPOINT: LIST ALL OBJECTS
api.get("/objects", function(req, res) {
  res.json(objects);
});

module.exports = api;
