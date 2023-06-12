//  http://brm.io/matter-js/docs/
//  http://brm.io/matter-js/demo/#mixed
//  https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js
//  https://en.wikipedia.org/wiki/Rotation_matrix

/*    ideas
change the collision filter group for the body the portal is on
if the player touches the portal make the player not able to collide with the wall
add in some invisible edges to the portal 
if the player's center touches the portal teleport to the other portal
make portals fireable with ray casting  (consider using point checks, not raycasting)
  https://github.com/liabru/matter-js/issues/181


*/
  
  
  //game objects values
  var game = {
    cycle: 0,
    width: 1200,
    height: 800,
  }
  
  var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Events = Matter.Events,
    Body = Matter.Body,
    //Composites = Matter.Composites,
    Bodies = Matter.Bodies;
  
  // create an engine
  var engine = Engine.create();
  
  var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: 1,
      background: 'rgba(255, 0, 0, 0.0)',
      wireframeBackground: '#222',
      enabled: true,
      wireframes: false,
      showVelocity: false,
      showAngleIndicator: true,
      showCollisions: false,
    }
  });
  
  //add the walls
  var offset = 5;
  World.add(engine.world, [
    Bodies.rectangle(400, -offset, game.width * 2 + 2 * offset, 50, {
      isStatic: true
    }),
    Bodies.rectangle(400, game.height + offset, game.width * 2 + 2 * offset, 50, {
      isStatic: true
    }),
    Bodies.rectangle(game.width + offset, 300, 50, game.height * 2 + 2 * offset, {
      isStatic: true
    }),
    Bodies.rectangle(-offset, 300, 50, game.height * 2 + 2 * offset, {
      isStatic: true
    })
  ]);
  
  
  //add the player
  const playerRadius = 25
  var player = Bodies.circle(800, game.height-200, playerRadius, {
    density: 0.001,
    friction: 0.7,
    frictionStatic: 0,
    frictionAir: 0.005,
    restitution: 0.3,
    ground: false,
    jumpCD: 0,
    portal: -1, // 0,1 for each portal  and -1 for no portal
    collisionFilter:{
      category: 1,
      group: 1,
      mask: 1
    },
    render:{
      strokeStyle:'black',
      fillStyle:'lightgrey'
    },
  });
  player.collisionFilter.group = -1
  
  //this sensor check if the player is on the ground to enable jumping
  var playerSensor = Bodies.rectangle(0, 0, playerRadius, 5, {
    isSensor: true,
    render:{
      visible: false
    },
    //isStatic: true,
  })
  playerSensor.collisionFilter.group = -1
  
  //populate world
  World.add(engine.world, [player, playerSensor]);
  
  //looks for key presses and logs them
  var keys = [];
  document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
  });
  document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
  });
  
  function playerGroundCheck(event, ground) { //runs on collisions events
    var pairs = event.pairs
    for (var i = 0, j = pairs.length; i != j; ++i) {
      var pair = pairs[i];
      if (pair.bodyA === playerSensor) {
        player.ground = ground;
      } else if (pair.bodyB === playerSensor) {
        player.ground = ground;
      }
    }
  }
  
  
  
  //at the start of a colision for player
  Events.on(engine, "collisionStart", function(event) {
    playerGroundCheck(event, true)
  });
  //ongoing checks for collisions for player
  Events.on(engine, "collisionActive", function(event) {
    playerGroundCheck(event, true)
  });
  //at the end of a colision for player set ground to false
  Events.on(engine, 'collisionEnd', function(event) {
    playerGroundCheck(event, false);
  })
  
  Events.on(engine, "afterTick", function(event) {
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
  
  Events.on(engine, "beforeTick", function(event) {
    game.cycle++;
    //jump
    if (keys[38] && player.ground && player.jumpCD < game.cycle) {
      player.jumpCD = game.cycle + 10; //adds a cooldown to jump
      player.force = {
        x: 0,
        y: -0.07
      };
    }
    //spin left and right
    const spin = 0.05;
    const limit = 0.3;
    if (keys[37] && player.angularVelocity > -limit) {
      player.torque = -spin;
    } else {
      if (keys[39] && player.angularVelocity < limit) {
        player.torque = spin;
      }
    };
  });
  
  // run the engine
  Engine.run(engine);
  
  // run the renderer
  Render.run(render);
  