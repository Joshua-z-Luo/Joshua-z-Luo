var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;



// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false
    }
});

//ground
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });


//create polys
var stack = Matter.Composites.stack(200, 200, 4, 4, 0, 0, function(x, y){
    let sides = Math.round(Matter.Common.random(2, 6));
    return Matter.Bodies.polygon(x, y, sides, Matter.Common.random(20, 50));
});

//mouse
var mouse = Matter.Mouse.create(render.canvas);
var mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        render: {visible: false}
    }
});

render.mouse = mouse;

// add all of the bodies to the world
Composite.add(engine.world, [stack, ground, mouseConstraint]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// mouse

// run the engine
//Events.on(runner, 'tick',() => {
//    runner.deltaMin = runner.fps > 60 ? 1000 / runner.fps : 1000 / 60;
//  })
Runner.run(runner, engine);
