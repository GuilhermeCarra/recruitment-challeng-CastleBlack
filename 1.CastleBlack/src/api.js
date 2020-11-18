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
api.get("/objects", checkObjectsDb, function(req, res) {

  if(objects.length === 0) {
    return res
    .status(200)
    .json({ data: null, error: 'No content: No objects registered' });
  }

  return res
    .status(200)
    .json({ data: objects, error: null });
});

// LIST ALL PLAYERS
api.get("/players", checkPlayersDb, function(req, res) {

  if(players.length === 0) {
    return res
    .status(200)
    .json({ data: null, error: 'No content: No players registered' });
  }

  return res
    .status(200)
    .json({ data: players, error: null });
});

// ADD NEW PLAYER
api.post("/players", checkPlayersDb, getNewPlayerId, function(req, res) {
  if (req.body.name == null) {
    return res
      .status(400)
      .json({ data: null, error: 'Bad Request: Missing name attribute' });
  }

  if (req.body.age == null) {
    return res
      .status(400)
      .json({ data: null, error: 'Bad Request: Missing age attribute' });
  }

  if (req.body.health == null) {
    return res
      .status(400)
      .json({ data: null, error: 'Bad Request: Missing health attribute' });
  }

  players = [...players, {
    id: req.body.id,
    name: req.body.name,
    age: req.body.age,
    health: req.body.health,
    bag: [],
  }]

  return res
    .status(201)
    .json({ data: 'Player successfully registered!', error: null });
});

// GET PLAYER BY ID
api.get("/players/:id", checkPlayersDb, findPlayer, function(req, res) {
  return res
    .status(200)
    .json({data: req.body.player, error: null});
});

// ARM PLAYER
api.patch("/players/:id/equip",
  checkPlayersDb,
  checkObjectsDb,
  findPlayer,
  findObject,
  checkDead,
  function(req, res) {
    const object = req.body.object;
    const player = req.body.player;

    if (!player.bag.includes(object.id)) {
      return res
      .status(400)
      .json({ data: null, error: 'Bad Request: Player does not have this item in your bag' });
    }

    let bag = player.bag.filter((obj) => obj !== object.id) // Removing the item from the bag

    if (player.equipped !== undefined) {
      bag.push(player.equipped)                             // Return to the bag if player was armed with an object previously
    }

    players.find( ({id}) => id === player.id )              // Updating player equipped item
      .equipped = object.id;

    players.find( ({id}) => id === player.id )              // Updating player bag
      .bag = bag;

    return res
    .status(200)
    .json({ data: `${player.name} equipped ${object.name}`, error: null });
});

// KILL A PLAYER
api.patch("/players/:id/kill",
  checkPlayersDb,
  findPlayer,
  function(req, res) {
    const player = req.body.player

    players.find( ({id}) => id === player.id )
      .health = 0;

    return res
    .status(200)
    .json({ data: `${player.name} is dead`, error: null });
});

// CREATE OBJECT
api.post("/objects", checkObjectsDb, getNewObjectId, function(req, res) {
  if (req.body.name == null) {
    return res
      .status(400)
      .json({ data: null, error: 'Bad Request: Missing name attribute' });
  }

  if (req.body.value == null) {
    return res
      .status(400)
      .json({ data: null, error: 'Bad Request: Missing value attribute' });
  }

  objects = [...objects, {
    id: req.body.id,
    name: req.body.name,
    value: req.body.value,
  }]

  return res
    .status(201)
    .json({ data: 'Object successfully registered!', error: null });
});

// GET OBJECT BY ID
api.get("/objects/:id", checkObjectsDb, findObject, function(req, res) {
  return res
    .status(200)
    .json({data: req.body.object, error: null});
});

// UPGRADE OBJECTS
api.patch("/objects/:id/upgrade", checkObjectsDb, findObject, function(req, res) {
  if (req.body.value == null) {
    return res
      .status(400)
      .json({ data: null, error: 'Bad Request: Missing value attribute' });
  }

  const newValue = parseInt(req.body.value) + parseInt(req.body.object.value)

  objects.find(({id}) => id === req.body.object.id).value += parseInt(req.body.value); // Change item value

  return res
    .status(200)
    .json({
      data: `${req.body.object.name} value was changed to ${newValue}`,
      error: null
    });
});

// DESTROY OBJECT
api.delete("/objects/:id",
  checkObjectsDb,
  checkPlayersDb,
  findObject,
  function(req, res) {

    objects = objects.filter((obj) => obj.id !== req.body.object.id);  // Remove the object from database


    for (let i = 0; i < players.length; i++) {
      let index = players[i].bag.indexOf(req.body.object.id)
      if (index !== -1) players[i].bag.splice(index, 1);       // When the object is destroyed it's removed from players bags

      if (players[i].equipped !== undefined) {
        if (players[i].equipped === req.body.object.id) {     // Also remove it if user is armed with it
          delete players[i].equipped;
        }
      }
    }

    return res
      .status(200)
      .json({data: `${req.body.object.name} was destroyed`, error: null});
});

// PLAYER PICK UP ITEM
api.patch("/players/:id/pick",
  checkPlayersDb,
  checkObjectsDb,
  findPlayer,
  findObject,
  checkDead,
  function(req, res) {
    const object = req.body.object;
    const player = req.body.player;

    for (let player of players) {
      if (player.bag.includes(object.id)) {
        return res
        .status(400)
        .json({ data: null, error: 'Bad Request: This object already has an owner' });
      }
    }

    let bag = [...player.bag, object.id]         // Putting object in the bag

    players.find( ({id}) => id === player.id )   // Updating player bag
      .bag = bag;

    return res
      .status(200)
      .json({ data: `${player.name} picked up ${object.name}`, error: null });
});


// PLAYER ATTACKS
api.patch("/players/:id/attack",
  checkObjectsDb,
  checkPlayersDb,
  findPlayer,
  checkDead,
  function(req, res) {
    const attacker = req.body.player;
    const object = objects.find( ({id}) => id === attacker.equipped )
    const target = players.find( ({id}) => id === parseInt(req.body.target) )

    if (typeof target === 'undefined') {
      return res
        .status(400)
        .json({ data: null, error: 'Bad Request: Target player does not exist' });
    }

    if (typeof object === 'undefined') {
      return res
        .status(400)
        .json({ data: null, error: 'Bad Request: Attacking player is not armed with an object' });
    }

    if (target.health <= 0) {
      return res
        .status(400)
        .json({ data: null, error: `Bad Request: ${attacker.name} tries to attack ${target.name} but he/she is already dead` });
    }

    const health = target.health + object.value <= 0 ? 0 : target.health + object.value; // Calculate damage

    players.find( ({id}) => id === target.id )    // Update player health after attack
      .health = health;

    return res
      .status(200)
      .json({
        data: `${attacker.name} attacked ${target.name} with ${object.name} / ${target.name} health: ${health}`,
        error: null
      });
});


});

module.exports = api;
