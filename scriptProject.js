window.onload = function() {
    //get the canvas
    var canvas = document.getElementById("renderCanvas");
    //the engine
    var engine = new BABYLON.Engine(canvas, true);
    // Check for the availability of RENDERER extension
    var rendererInfoExtension = engine._gl.getExtension('WEBGL_debug_renderer_info');
    var renderer = rendererInfoExtension ? engine._gl.getParameter(rendererInfoExtension.UNMASKED_RENDERER_WEBGL) : null;
    console.log('WebGL Renderer:', renderer || 'Unknown');
    //the scene
    var scene = new BABYLON.Scene(engine);
    //the camera
    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 5, new BABYLON.Vector3(0, 1.5, 0), scene);
    camera.attachControl(canvas, true);
    //lighting
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    //materials
    var wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    //the walls
    //back wall
    var wall1 = BABYLON.MeshBuilder.CreateBox("wall1", { width: 5, height: 3, depth: 0.1 }, scene);
    wall1.material = wallMaterial;
    wall1.position = new BABYLON.Vector3(0, 1.5, -2.5); 
    //
    var wall2 = BABYLON.MeshBuilder.CreateBox("wall2", { width: 5, height: 3, depth: 0.1 }, scene);
    wall2.material = wallMaterial;
    wall2.rotation.y = Math.PI / 2;
    wall2.position = new BABYLON.Vector3(-2.5, 1.5, 0); 
    //
    var wall3 = BABYLON.MeshBuilder.CreateBox("wall3", { width: 5, height: 3, depth: 0.1 }, scene);
    wall3.material = wallMaterial;
    wall3.rotation.y = -Math.PI / 2;
    wall3.position = new BABYLON.Vector3(2.5, 1.5, 0);
    //the ground
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 5, height: 5 }, scene);
    ground.material = groundMaterial;
    //the roof
    var roof = BABYLON.MeshBuilder.CreateBox("roof", { width: 5, height: 0.1, depth: 5 }, scene);
    roof.material = wallMaterial;
    roof.position = new BABYLON.Vector3(0, 3, 0);
    //function to load and add furniture models
    function loadFurnitureModel(modelName, position) {
        let modelPath = "";
        if (modelName === "bed1") {
            modelPath = "furniture_models/bed_2.glb";
        } else if (modelName === "bed2") {
            modelPath = "furniture_models/bed_2.glb";
        }

        console.log(`Loading model: ${modelName}, from path: ${modelPath} to position: ${position}`);

        if (modelPath) {
            BABYLON.SceneLoader.ImportMesh("", modelPath, "", scene, function (meshes) {
                console.log(`Loaded model: ${modelName}`);
                meshes.forEach(function(mesh) {
                    mesh.position = position;
                    mesh.isPickable = true;
                });
            }, null, function(scene, message) {
                console.error(`Error loading model ${modelName} from path ${modelPath}: ${message}`);
            });
        }
    }
//function to add furniture on click
    function addFurnitureOnClick(modelName) {
        const defaultPosition = new BABYLON.Vector3(0, 0, 0);
        loadFurnitureModel(modelName, defaultPosition);
    }
    document.querySelectorAll('.furniture').forEach(function(item) {
        item.addEventListener('click', function(event) {
            var modelName = event.currentTarget.getAttribute('data-model');
            console.log(`Placing model: ${modelName}`);
            addFurnitureOnClick(modelName);
        });
    });
    //dragging somewhere
    var selectedMesh = null;
    var startingPoint = null;
    var getGroundPosition = function() {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    }
    var onPointerDown = function(evt) {
        if (evt.button !== 0) {
            return;
        }
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY);
        if (pickInfo.hit && pickInfo.pickedMesh != ground) {
            selectedMesh = pickInfo.pickedMesh;
            startingPoint = getGroundPosition();
            if (startingPoint) {
                setTimeout(function() {
                    camera.detachControl(canvas);
                }, 0);
            }
        }
    }
    var onPointerUp = function() {
        if (startingPoint) {
            camera.attachControl(canvas, true);
            startingPoint = null;
            return;
        }
    }
    var onPointerMove = function(evt) {
        if (!startingPoint) {
            return;
        }
        var current = getGroundPosition();

        if (!current) {
            return;
        }
        var diff = current.subtract(startingPoint);
        selectedMesh.position.addInPlace(diff);
        startingPoint = current;
    }
    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);
    //run the render loop
    engine.runRenderLoop(function() {
        scene.render();
    });

    //resize it
    window.addEventListener("resize", function() {
        engine.resize();
    });
};//end 
