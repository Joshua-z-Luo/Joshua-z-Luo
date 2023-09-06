
  
  var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Body = Matter.Body;
  
  // create an engine
  var engine = Engine.create();
  
  // create a renderer
  var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      wireframes: false,
    },
  });
  
  //ground
  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
  
  //create polys
  var stack = Matter.Composites.stack(200, 200, 4, 4, 0, 0, function (x, y) {
    let sides = Math.round(Matter.Common.random(4, 4));
    return Matter.Bodies.polygon(x, y, sides, Matter.Common.random(20, 50));
  });
  
  //mouse
  var mouse = Matter.Mouse.create(render.canvas);
  var mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      render: { visible: false },
    },
  });
  
  render.mouse = mouse;
  
  //player things
  const playerRadius = 25;
  var player = Bodies.circle(300, 200, playerRadius, {
    density: 0.002,
    friction: 0.7,
    frictionStatic: 0,
    frictionAir: 0.005,
    restitution: 0.5,
    ground: false,
    collisionFilter: {
      category: 1,
      group: 1,
      mask: 1,
    },
    render: {
      strokeStyle: "black",
      fillStyle: "white",
    },
  });
  player.collisionFilter.group = -1;
  
  //this sensor check if the player is on the ground to enable jumping
  var playerSensor = Bodies.rectangle(0, 0, playerRadius, 5, {
    isSensor: true,
    render: {
      visible: false,
    },
  });
  playerSensor.collisionFilter.group = -1;
  
  // add all of the bodies to the world
  Composite.add(engine.world, [
    player,
    playerSensor,
    stack,
    ground,
    mouseConstraint,
  ]);
  
  //looks for key presses and logs them
  var keys = [];
document.addEventListener('DOMContentLoaded', init, false);
function init(){
  function message () {
    alert("Hello!");
  }
  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
  });
  document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
};
  
  
  function playerGroundCheck(event, ground) {
    //runs on collisions events
    let pairs = event.pairs;
    for (var i = 0, j = pairs.length; i != j; ++i) {
      let pair = pairs[i];
      if (pair.bodyA === playerSensor) {
        player.ground = ground;
      } else if (pair.bodyB === playerSensor) {
        player.ground = ground;
      }
    }
  }
  
  Events.on(engine, "collisionStart", function (event) {
    playerGroundCheck(event, true);
  });
  //ongoing checks for collisions for player
  Events.on(engine, "collisionActive", function (event) {
    playerGroundCheck(event, true);
  });
  //at the end of a colision for player set ground to false
  Events.on(engine, "collisionEnd", function (event) {
    playerGroundCheck(event, false);
  });
  
  Events.on(engine, "afterUpdate", function (event) {
    //set sensor velocity to zero so it collides properly
    //set sensor velocity to zero so it collides properly
    Matter.Body.setVelocity(playerSensor, {
        x: 0,
        y: 0
      })
      //move sensor to below the player
    Body.setPosition(playerSensor, {
      x: player.position.x,
      y: player.position.y + playerRadius
    });
    
  });
  
  Events.on(engine, "beforeUpdate", function (event) {
    //jump
    if (keys["ArrowUp"] && player.ground) {
      player.force = {
        x: 0,
        y: -0.03,
      };
    }
    //spin left and right
    const spin = 0.1;
    const limit = 0.3;
    if (keys["ArrowLeft"] && player.angularVelocity > -limit) {
      player.torque = -spin;
    } else {
      if (keys["ArrowRight"] && player.angularVelocity < limit) {
        player.torque = spin;
      }
    }
    
  });
  
// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);