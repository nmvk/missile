var scene; // Scene
var camera; // Camera
var renderer; // Renderer
var increment = 0;
var width;
var height;
var missileList = [];
var antiballistic = [];
var buildingsArr = [];
var quaternion = new THREE.Quaternion();
var matrix = new THREE.Matrix4();
var buildingPrefix = "Build-";
var missilePrefix = "Missile-";
var batteryPrefix = "Battery-";
var antBallisticPrefix = "AntiBal-";
var exposionPrefix = "Explosion-";
var num = 0;
var destroyMap = new Map();
var dummy = "Dummy";
var collidableMeshList = [];
var gameScore = 0;
var explosions = [];
var k = 0;
var blastCount = 0;
var level = 1;
var wait = 0;

/**
 * Initialize the background and base.
 */
function setUp() {
    width = window.innerWidth * 0.99;
    height = window.innerHeight * 0.93;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();

    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    // Sky
    var skyTexture = new THREE.TextureLoader().load("images/moon.jpg");

    var sky = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshBasicMaterial({map: skyTexture, side: THREE.DoubleSide})
    );
    sky.position.z = 3;

    scene.add(sky);


    // Base
    var ground = new THREE.TextureLoader().load("images/ground.png");
    ground.wrapS = THREE.RepeatWrapping;
    ground.wrapT = THREE.RepeatWrapping;
    ground.repeat.set(10,10);
    var base = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshBasicMaterial({map: ground, side: THREE.DoubleSide})
    );
    base.rotation.x = Math.PI / 2;
    scene.add(base);

    camera.position.set(0, 2, -5);
    camera.lookAt(new THREE.Vector3(0, 2, 0));
}

/**
 * Reset game
 */
function reset() {

    destroyMap = new Map();
    blastCount = 0;
    for (var i = 0; i < buildingsArr.length; i++) {
        scene.remove(scene.getObjectByName(buildingsArr[i].name));
    }

    buildingsArr = [];

    for (var i = 0; i < missileList.length; i++) {
        scene.remove(scene.getObjectByName(missileList[i].name));
    }

    missileList = [];

    for (var i = 0; i < antiballistic.length; i++) {
        scene.remove(scene.getObjectByName(antiballistic[i].name));
    }
    antiballistic = [];
    buildings();
    battery();
    missiles();
}

/**
 * Add four buidings.
 */
function buildings() {
    var texture = new THREE.TextureLoader().load("images/bank.png");
    var points = [{x: -1, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}];
    for (var i = 0; i < points.length; i++) {
        var point = points[i];

        console.log(point);
        cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.2),
            new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, wireframe: false}));
        cube.position.x = point.x;
        cube.position.y = point.y;
        cube.position.z = 0;
        cube.name = buildingPrefix + i;
        buildingsArr.push(cube);
        collidableMeshList.push(cube);
        scene.add(cube);
    }
}

/**
 * Add batteries to the scene
 */
function battery() {
    var texture = new THREE.TextureLoader().load("images/mil.PNG");
    texture.repeat.set(1, 1);
    var points = [{x: -3, y: 0}, {x: 0, y: 0}, {x: 3, y: 0}];
    for (var i = 0; i < points.length; i++) {

        var point = points[i];

        console.log(point);
        cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.5, 0.2),
            new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, wireframe: false}));
        cube.position.x = point.x;
        cube.position.y = point.y;
        cube.position.z = 0;
        cube.name = batteryPrefix + i;
        buildingsArr.push(cube);
        collidableMeshList.push(cube);
        scene.add(cube);
    }
}

/**
 * Descending missiles.
 */
function missiles() {
    var texture = new THREE.TextureLoader().load("images/gren.png");

    texture.repeat.set(1, 1);
    var points = [{x: -3, y: 5}, {x: -2, y: 6}, {x: -1, y: 4.5}, {x: 0, y: 5},
        {x: 1, y: 5}, {x: 2, y: 5.5}, {x: 3, y: 5}];

    for (var i = 0; i < points.length; i++) {
        var point = points[i];

        console.log(point);
        var missile = new THREE.Mesh(new THREE.SphereGeometry(0.175, 0.35, 0.1),
            new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, wireframe: false, transparent: false}));
        missile.position.x = point.x;
        missile.position.y = point.y;

        missile.position.z = 0;
        missile.name = missilePrefix + i;

        missileList.push(missile);
        scene.add(missile);
    }
}

/*
    Draw scene.
 */
function renderScene() {
    requestAnimationFrame(renderScene);

    if (level == 2) {
        increment = increment + 0.000000001;
    } else {
        increment = increment + 0.00001;
    }
    if (level == 1 && blastCount === 7) {
        if (wait++ === 150) {
            $('#level').html(++level);
            reset();
            return;
        }
    } else if (level === 2 && blastCount === 7) {
        $('#level').html("<b>Congrats!!!</b> Woo hoo!!!");
    }

    renderer.render(scene, camera);
    var popCount = 0;
    for (var i = 0; i < explosions.length; i++) {
        if (explosions[i].frame === 50) {
            scene.remove(scene.getObjectByName(explosions[i].name));
            destroyMap.set(explosions[i].name, dummy);
            popCount++;
        } else {
            explosions[i].frame++;
        }
    }

    while (popCount > 0) {
        if (destroyMap.has(explosions[explosions.length - 1])) {
            explosions.pop();
            popCount--;
        } else {
            break;
        }
    }

    for (var i = 0; i < missileList.length; i++) {
        var missile = missileList[i];
        missile.position.y -= increment;

        if (destroyMap.has(missile.name)) {
            continue;
        }

        var index = -1;
        var center = getCenterPoint(missile);
        var dist = Infinity;
        for (var j = 0; j < buildingsArr.length; j++) {

            if (destroyMap.has(buildingsArr[j].name)) {
                continue;
            }
            // Get center
            // var buildCenter = getCenterPoint(buildingsArr[i]);

            // var xpart = (buildCenter.x - center.x) * (buildCenter.x - center.x);
            // var ypart = (buildCenter.y - center.y) * (buildCenter.y - center.y);
            // var zpart = (buildCenter.z - center.z) * (buildCenter.z - center.z);


            var score = missile.position.distanceTo(buildingsArr[j].position);

            if (score < 0.5 && score < dist) {
                console.log(score);
                dist = score;
                index = j;
            }

        }

        if (index != -1) {
            console.log(missile.name + " Wooo " + buildingsArr[index].name);
            scene.remove(scene.getObjectByName(buildingsArr[index].name));
            scene.remove(scene.getObjectByName(missile.name));
            destroyMap.set(buildingsArr[index].name, dummy);
            destroyMap.set(missile.name, dummy);
            gameScore -= 50;

            // Explosion
            blastCount++;

            playExplode();
            var texture = new THREE.TextureLoader().load("images/fireball.png");

            var explosion = new THREE.Mesh(new THREE.SphereGeometry(0.3, 0.75, 0.1),
                new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: false, map: texture, transparent: true}));
            explosion.position.x = missile.position.x;
            explosion.position.y = missile.position.y;
            explosion.frame = 0;
            explosion.name = exposionPrefix + (k++);
            explosions.push(explosion);
            scene.add(explosion);

            $('#score').html(gameScore);
        }

    }
    for (var i = 0; i < antiballistic.length; i++) {

        var antiMissile = antiballistic[i];

        if (destroyMap.has(antiMissile.name)) {
            continue;
        }

        var newPos = new THREE.Vector3();
        var distance = 0.01;
        var cd = antiMissile.destination.clone();
        antiMissile.position.add(cd.multiplyScalar(distance));

        var dist = Infinity;
        var index = -1;
        // Detect collition
        for (var j = 0; j < missileList.length; j++) {
            var missile = missileList[j];

            if (destroyMap.has(missile.name)) {
                continue;
            }

            var score = antiMissile.position.distanceTo(missile.position);
            if (score < dist && score < 0.3) {
                dist = score;
                index = j;
            }
        }

        // Collition
        if (index != -1) {
            destroyMap.set(missileList[index].name, dummy);
            destroyMap.set(antiMissile.name, dummy);

            scene.remove(scene.getObjectByName(missileList[index].name));
            scene.remove(scene.getObjectByName(antiMissile.name));
            gameScore += 200;
            $('#score').html(gameScore);
            playExplode();
            var texture = new THREE.TextureLoader().load("images/fireball.png");

            var explosion = new THREE.Mesh(new THREE.SphereGeometry(0.3, 0.75, 0.1),
                new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: false, map: texture, transparent: true}));
            explosion.position.x = antiMissile.position.x;
            explosion.position.y = antiMissile.position.y;
            explosion.frame = 0;
            explosion.name = exposionPrefix + (k++);
            explosions.push(explosion);
            blastCount++;
            scene.add(explosion);
        }
    }


}

/**
 *
 * @param mesh
 * @returns {*}
 */
function getCenterPoint(mesh) {
    var geometry = mesh.geometry;
    geometry.computeBoundingBox();
    center = geometry.boundingBox.getCenter();
    mesh.localToWorld(center);
    return center;
}

/**
 * Handle mouse click.
 */
function handleMouseClick(event) {
    event.preventDefault();
    console.log("Mouse click");
    var x = ( event.clientX / width) * 2 - 1;
    var y = -( event.clientY / height ) * 2 + 1;

    // https://stackoverflow.com/a/36071100
    var vector = new THREE.Vector3(x, y, 0).unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var position = camera.position.clone().add(dir.multiplyScalar(distance));


    launchAntiBallistic(position);
}

/**
 * Launch anti ballistic missile.
 *
 * @param position
 */
function launchAntiBallistic(position) {
    var texture = new THREE.TextureLoader().load("images/bomb.png");

    var determineBattery = whichBattery(position.x, position.y);

    if (!determineBattery) {
        return false;
    }
    var missile = new THREE.Mesh(new THREE.SphereGeometry(0.175, 0.35, 0.1),
        new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, wireframe: false, transparent: false}));
    missile.position.x = determineBattery.x;

    missile.position.y = determineBattery.y + 0.75;

    missile.position.z = 0;
    missile.destination = new THREE.Vector3(position.x, position.y, 0)
        .sub(new THREE.Vector3(determineBattery.x, determineBattery.y + 0.75, 0));
    missile.name = antBallisticPrefix + (num++);
    antiballistic.push(missile);
    scene.add(missile);
}

/**
 * Determine which battery to use.
 *
 * @param x
 * @param y
 * @returns {{x, y}|*}
 */
function whichBattery(x, y) {
    var points = [{x: -3, y: 0}, {x: 0, y: 0}, {x: 3, y: 0}];

    var index = 0;
    var minDistance = 9999;
    for (var i = 0; i < points.length; i++) {
        if (destroyMap.has(batteryPrefix + i)) {
            continue;
        }

        var distance = Math.sqrt((x - points[i].x) * (x - points[i].x) + (y - points[i].y) * (y - points[i].y));

        if (distance < minDistance) {
            index = i;
            minDistance = distance;
        }
    }

    if (minDistance === 9999)
        return false;
    return points[index];
}

/**
 * Pay sound.
 */
function playBackground() {
    //Create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add(listener);

// create a global audio source
    var sound = new THREE.Audio(listener);

    var audioLoader = new THREE.AudioLoader();

//Load a sound and set it as the Audio object's buffer
    audioLoader.load('sound/bensound-epic.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });

}

function playExplode() {
    //Create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    var sound = new THREE.Audio(listener);

    var audioLoader = new THREE.AudioLoader();

    //Load a sound and set it as the Audio object's buffer
    audioLoader.load('sound/explode.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.65);
        sound.play();
    });

}

/*
    Entry point of the application
 */
function main() {
    setUp();
    buildings();
    battery();
    missiles();
    playBackground();
    renderScene();

    $("canvas").click(handleMouseClick);
}

main();