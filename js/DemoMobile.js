(function() {

    // Matter aliases
    var Engine = Matter.Engine,
        World = Matter.World,
        Body = Matter.Body,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Constraint = Matter.Constraint,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint;

    var Demo = {};

    var _engine,
        _sceneName = 'chains',
        _sceneWidth,
        _sceneHeight,
        _deviceOrientationEvent;

    Demo.init = function() {
        var canvasContainer = document.getElementById('canvas-container');

        _engine = Engine.create(canvasContainer, {
            render: {
                options: {
                    wireframes: false,
                    showAngleIndicator: true,
                    showDebug: true
                }
            }
        });

        _engine.world.gravity.y = 0;

        // Demo.fullscreen();

        setTimeout(function() {
            var runner = Engine.run(_engine);
            // pass through runner as timing for debug rendering
            _engine.metrics.timing = runner;
            Demo.updateScene();
        }, 800);

        window.addEventListener('deviceorientation', function(event) {
            _deviceOrientationEvent = event;
            // Demo.updateGravity(event);
        }, true);

        // window.addEventListener('touchstart', Demo.fullscreen);

        window.addEventListener('orientationchange', function() {
            Demo.updateGravity(_deviceOrientationEvent);
            Demo.updateScene();
            // Demo.fullscreen();
        }, false);
    };

    window.addEventListener('load', Demo.init);

    Demo.mixed = function() {
        var _world = _engine.world;
        
        Demo.reset();

        World.add(_world, MouseConstraint.create(_engine));
        
        var stack = Composites.stack(20, 20, 10, 5, 0, 0, function(x, y, column, row) {
            switch (Math.round(Common.random(0, 1))) {
                
            case 0:
                if (Common.random() < 0.8) {
                    return Bodies.rectangle(x, y, Common.random(20, 40), Common.random(20, 40), { friction: 0.01, restitution: 0.4 });
                } else {
                    return Bodies.rectangle(x, y, Common.random(80, 120), Common.random(20, 30), { friction: 0.01, restitution: 0.4 });
                }
                break;
            case 1:
                return Bodies.polygon(x, y, Math.round(Common.random(4, 6)), Common.random(20, 40), { friction: 0.01, restitution: 0.4 });
            
            }
        });
        
        World.add(_world, stack);
    };

    Demo.chains = function() {
        var engine = _engine,
            world = engine.world;

        World.add(world, MouseConstraint.create(_engine));

        group = Body.nextGroup(true);

        var linkNo = 130;
        var linkWidth = 4;
        var linkHeight = 4;
        var linkDistance = 2;
        var ropeStiffness = 0.9;
        var mountTop = {x: 160, y: -90};
        var mountBottom = {x: 160, y: mountTop.y+linkNo*linkHeight+linkNo*linkDistance+linkDistance};

        var ropeA = Composites.stack(mountTop.x, mountTop.y+linkDistance+linkHeight/2, 1, linkNo, 0, linkDistance, function (x, y) {
            return Bodies.rectangle(x-linkWidth/2, y-linkHeight/2, linkWidth, linkHeight, {
                //collisionFilter: {group: group},
            });
        });

        Composites.chain(ropeA, 0, 0.5, 0, -0.5, {stiffness: ropeStiffness, length: linkDistance});
        Composite.add(ropeA, Constraint.create({
            bodyB: ropeA.bodies[0],
            pointB: { x: 0, y: -linkHeight/2 },
            pointA: mountTop,
            length: linkDistance,
            stiffness: ropeStiffness
        }));
        Composite.add(ropeA, Constraint.create({
            bodyB: ropeA.bodies[linkNo - 1],
            pointB: { x: 0, y: linkHeight/2 },
            pointA: mountBottom,
            length: linkDistance,
            stiffness: ropeStiffness
        }));

        World.add(world, ropeA);

        //ropeA.bodies[30].setPosition({ x:320, y:285 });
        // for (i = 30; i < 50; i++) {
        //    Matter.Body.setPosition(ropeA.bodies[i], {x: i*8.77, y: 285});
        // }

        group = Body.nextGroup(true);

        var ropeB = Composites.stack(160-20, 20, 1, 5, 0, 20, function(x, y) {
            return Bodies.circle(x, y, 20, {
                // collisionFilter: { group: group },
                //angle: Math.PI/2
            });
        });

        // Composites.chain(ropeB, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 20 });
        // Composite.add(ropeB, Constraint.create({
        //     bodyB: ropeB.bodies[0],
        //     pointB: { x: -20, y: 0 },
        //     pointA: { x: 160, y: 0 },
        //     length: 20,
        //     stiffness: 0.8
        // }));

        // World.add(world, ropeB);

    };

    Demo.updateScene = function() {
        if (!_engine)
            return;
        
        _sceneWidth = document.documentElement.clientWidth;
        _sceneHeight = document.documentElement.clientHeight;

        var boundsMax = _engine.world.bounds.max,
            renderOptions = _engine.render.options,
            canvas = _engine.render.canvas;

        boundsMax.x = _sceneWidth;
        boundsMax.y = _sceneHeight;

        canvas.width = renderOptions.width = _sceneWidth;
        canvas.height = renderOptions.height = _sceneHeight;

        Demo[_sceneName]();
    };
    
    // Demo.updateGravity = function(event) {
    //     if (!_engine)
    //         return;
    //
    //     var orientation = window.orientation,
    //         gravity = _engine.world.gravity;
	//
    //     if (orientation === 0) {
    //         gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
    //         gravity.y = Common.clamp(event.beta, -90, 90) / 90;
    //     } else if (orientation === 180) {
    //         gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
    //         gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
    //     } else if (orientation === 90) {
    //         gravity.x = Common.clamp(event.beta, -90, 90) / 90;
    //         gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
    //     } else if (orientation === -90) {
    //         gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
    //         gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
    //     }
    // };
    
    Demo.fullscreen = function(){
        var _fullscreenElement = _engine.render.canvas;
        
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            if (_fullscreenElement.requestFullscreen) {
                _fullscreenElement.requestFullscreen();
            } else if (_fullscreenElement.mozRequestFullScreen) {
                _fullscreenElement.mozRequestFullScreen();
            } else if (_fullscreenElement.webkitRequestFullscreen) {
                _fullscreenElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
    };
    
    Demo.reset = function() {
        var _world = _engine.world;

        Common._seed = 2;
        
        World.clear(_world);
        Engine.clear(_engine);
        
        var offset = 5;
        World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, -offset, _sceneWidth + 0.5, 50.5, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(_sceneWidth * 0.5, _sceneHeight + offset, _sceneWidth + 0.5, 50.5, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(_sceneWidth + offset, _sceneHeight * 0.5, 50.5, _sceneHeight + 0.5, { isStatic: true }));
        World.addBody(_world, Bodies.rectangle(-offset, _sceneHeight * 0.5, 50.5, _sceneHeight + 0.5, { isStatic: true }));
    };

})();