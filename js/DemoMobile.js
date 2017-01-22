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
        MouseConstraint = Matter.MouseConstraint,
        Events = Matter.Events;

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
        }, true);

        // window.addEventListener('touchstart', Demo.fullscreen);

        window.addEventListener('orientationchange', function() {
            Demo.updateScene();
            // Demo.fullscreen();
        }, false);
    };

    window.addEventListener('load', Demo.init);


    Demo.chain = function(centerX, filterGroup) {

        var record;

        var box;

        var engine = _engine,
            world = engine.world;

        group = Body.nextGroup(true);

        var linkNo = 131;
        var linkWidth = 4;
        var linkHeight = 4;
        var linkDistance = 2;
        var ropeStiffness = 0.9;
        var mountTop = {x: centerX, y: -90};
        var mountBottom = {x: centerX, y: mountTop.y+linkNo*linkHeight+linkNo*linkDistance+linkDistance};

        var ropeA = Composites.stack(mountTop.x, mountTop.y+linkDistance+linkHeight/2, 1, linkNo, 0, linkDistance, function (x, y) {
            return Bodies.rectangle(x-linkWidth/2, y-linkHeight/2, linkWidth, linkHeight, {
                collisionFilter: { mask: filterGroup }
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

        var linkForTouch = ropeA.bodies[100];

        var mouse = MouseConstraint.create(_engine);
        //World.add(world, mouse);

        Events.on(mouse, "mousedown", function(event) {
            if (event.mouse.position.x > linkForTouch.position.x - 25 && event.mouse.position.x < linkForTouch.position.x + 25) {
                record = new Record();
                record.add(event.mouse.position);
            }
        });
        Events.on(mouse, "mouseup", function(event) {
            if (record) {
                record.stopRecording();
            }
            //console.log(event)
        });
        Events.on(mouse, "mousemove", function(event) {
            //console.log(event)
            if (record && record.isRecording) {
                record.add(event.mouse.position);
            }
        });

		/**
         * Tick
         */
        Events.on(engine, "afterUpdate", function(event) {

            if (record) {
                for (i in record.points) {
                    if (record.isRecording) {
                    } else {
                        record.points[i].y -= (linkWidth + linkDistance) * 2;
                    }
                }
                if (!record.isRecording/* && !record.isUpdating*/) {
                    record.isUpdating = true;
                    for (i in record.points) {
                        console.log(+record.waveOffset + +i);
                        Body.setPosition(ropeA.bodies[+record.waveOffset + +i], record.points[record.points.length - 1 - i]);
                    }
                    record.waveOffset -= 2;
                    record.isUpdating = false;
                    if (record.waveOffset <= 0) {
                        record = null;
                    }
                }
            }

            if (!box) {
                box = new Box();
            } else {
                box.tick();
            }

        });

        var Record = function () {
            this.isRecording = true;
            this.isUpdating = false;
            this.waveOffset = null;
            this.lastPoint = null;
            this.points = [];
            this.add = function(point) {
                if (this.lastPoint && distanceFast(point, this.lastPoint) < 20) {
                    return false;
                }
                for (i in this.points) {
                    //record.points[i].y -= (linkWidth + linkDistance) * 2;
                }
                this.lastPoint = { x: point.x, y: point.y };
                this.points.push(this.lastPoint);
                if (this.points.length >= 20) {
                    this.stopRecording();
                    return true;
                }
                return false;
            };
            this.stopRecording = function () {
                this.isRecording = false;
                record.waveOffset = 90;
            }
            function distanceFast(point1, point2) {
                return Math.max(Math.abs(point1.x - point2.x), Math.abs(point1.y - point2.y));
            };
        };
        
        var BoxShapes = [ 'square', 'rectangleVertical', 'rectangleHorizontal', 'circle', 'triangle' ];
        
        var Box = function() {
            this.type = BoxShapes[Math.floor(Math.random()*BoxShapes.length)];
            this.body = create(this.type);
            this.body.force.y = 0.065;
            this.body.friction.y = 0.0;
            World.addBody(world, this.body);

            var tickCount = 0;

            this.tick = function() {
                if (++tickCount == 200) {
                    Matter.Composite.remove(world, this.body);
                    box = null;
                }
                //Body.setPosition(body, body.position.x, body.position.y+1);
            };

            function create(type) {
                var body;
                switch (type) {
                    case 'square':
                        body = Bodies.rectangle(centerX, -100, 50, 50, {
                        });
                        break;
                    case 'rectangleVertical':
                        body = Bodies.rectangle(centerX, -100, 30, 80, {
                        });
                        break;
                    case 'rectangleHorizontal':
                        body = Bodies.rectangle(centerX, -100, 80, 30, {
                        });
                        break;
                    case 'circle':
                        body = Bodies.circle(centerX, -100, 30, {
                        });
                        break;
                    case 'triangle':
                        body = Bodies.polygon(centerX, -100, 3, 45, {
                        });
                        break;
                }
                return body;
            }
        }
        
    };





    Demo.updateScene = function() {
        if (!_engine)
            return;
        
        // _sceneWidth = document.documentElement.clientWidth;
        // _sceneHeight = document.documentElement.clientHeight;
        _sceneWidth = 320;
        _sceneHeight = 570;


        var boundsMax = _engine.world.bounds.max,
            renderOptions = _engine.render.options,
            canvas = _engine.render.canvas;

        boundsMax.x = _sceneWidth;
        boundsMax.y = _sceneHeight;

        canvas.width = renderOptions.width = _sceneWidth;
        canvas.height = renderOptions.height = _sceneHeight;

        Demo.chain(60,  0x0002);
        Demo.chain(160, 0x0004);
        Demo.chain(260, 0x0008);
    };
    

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

})();