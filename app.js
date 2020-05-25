//CSUMB - CST 325 - Fall '19
//Final Project
//Bodey Provansal
'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var earthGeometry = null; // this will be created after loading from a file
var planeGeometry = null;

var moonGeometry = null;
var sunGeometry = null;

var projectionMatrix = new Matrix4();
//var lightDirection = new Vector3(5, 3, 0);
var sunPosition = new Vector3(0, 0, 0);
var earthPosition = new Vector3(4, 1.5, 0);
var moonPosition = new Vector3();
// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var phongShaderProgram;
var flatShaderProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
var loadedAssets = {
    phongTextVS: null, phongTextFS: null,
    vertexColorVS: null, vertexColorFS: null,
    sphereJSON: null,
    earthImage: null,
    starImage: null,
	moonImage: null,
	sunImage: null
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl");
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        gl.enable(gl.DEPTH_TEST);
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    var filePromises = [
        fetch('./shaders/phong.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/phong.pointlit.fs.glsl').then((response) => { return response.text(); }),
        fetch('./data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./data/earth.jpg'),
        loadImage('./data/stars.png'),
		loadImage('./data/moon.png'),
		fetch('./shaders/flat.color.vs.glsl').then((response) => { return response.text(); }),
        fetch('./shaders/flat.color.fs.glsl').then((response) => { return response.text(); }),
		loadImage('./data/sun.jpg')
    ];

    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.phongTextVS = values[0];
        loadedAssets.phongTextFS = values[1];
        loadedAssets.sphereJSON = values[2];
        loadedAssets.earthImage = values[3];
        loadedAssets.starImage = values[4];
		loadedAssets.moonImage = values[5];
		loadedAssets.vertexColorVS = values[6];
		loadedAssets.vertexColorFS = values[7];
		loadedAssets.sunImage = values[8];
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    phongShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.phongTextVS, loadedAssets.phongTextFS);
	flatShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.vertexColorVS, loadedAssets.vertexColorFS);
	

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
    };
	
	flatShaderProgram.attributes = {
		vertexPositionAttribute: gl.getAttribLocation(flatShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(flatShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(flatShaderProgram, "aTexcoords")
	}
	
	flatShaderProgram.uniforms = {
		worldMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(flatShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(flatShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(flatShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(flatShaderProgram, "uTexture"),
	}
}

// -------------------------------------------------------------------------
function createScene() {
    planeGeometry = new WebGLGeometryQuad(gl, flatShaderProgram);
    planeGeometry.create(loadedAssets.starImage);

    earthGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    earthGeometry.create(loadedAssets.sphereJSON, loadedAssets.earthImage);
	
	moonGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
	moonGeometry.create(loadedAssets.sphereJSON, loadedAssets.moonImage);
	
	sunGeometry = new WebGLGeometryJSON(gl, flatShaderProgram);
	sunGeometry.create(loadedAssets.sphereJSON, loadedAssets.sunImage);

    // Scaled it down so that the diameter is 3, (starts at 100)
    var scale = new Matrix4().scale(0.03, 0.03, 0.03);
	var moonScale = new Matrix4().scale(0.01, 0.01, 0.01);
	var sunScale = new Matrix4().scale(0.05, 0.05, 0.05);

    earthGeometry.worldMatrix.identity();
    earthGeometry.worldMatrix.multiplyRightSide(scale);

    // raise it by the radius to make it sit on the ground
    earthGeometry.worldMatrix.translate(0, 1.5, 0);
	
	moonGeometry.worldMatrix.identity();
	moonGeometry.worldMatrix.multiplyRightSide(moonScale);
	moonGeometry.worldMatrix.translate(-3, 3, -3);
	
	sunGeometry.worldMatrix.identity();
	sunGeometry.worldMatrix.multiplyRightSide(sunScale);
}


// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    camera.update(time.deltaTime);
	
	//rotating point light
	
	var cosTime = Math.cos(time.secondsElapsedSinceStart * 0.6);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 0.6);
	
	var earthDistance = 15;
	var moonDistance = 2;
	
	
	//Orbit Earth and Moon around Sun
	
	earthPosition.x = cosTime * earthDistance;
    earthPosition.y = (1.5);
    earthPosition.z = sinTime * earthDistance;
	
	moonPosition.x = ((earthPosition.x + moonDistance));
    moonPosition.y = ((earthPosition.y + moonDistance));
	moonPosition.z = ((earthPosition.z + moonDistance));
	
    earthGeometry.worldMatrix.elements[3] = earthPosition.x;
    earthGeometry.worldMatrix.elements[7] = earthPosition.y;
    earthGeometry.worldMatrix.elements[11] = earthPosition.z;
	
	moonGeometry.worldMatrix.elements[3] = (cosTime * (moonDistance)) +  earthPosition.x;
    moonGeometry.worldMatrix.elements[7] = (cosTime * (moonDistance)) +  earthPosition.y;
    moonGeometry.worldMatrix.elements[11] = (sinTime * (moonDistance)) +  earthPosition.z;
	
	//Rotate Around Local Axis
	earthGeometry.worldMatrix.elements[0] = cosTime * 0.03;
    earthGeometry.worldMatrix.elements[2] = sinTime * 0.03;
    earthGeometry.worldMatrix.elements[8] = sinTime * -0.03;
	earthGeometry.worldMatrix.elements[10] = cosTime * 0.03;	
	
	moonGeometry.worldMatrix.elements[0] = cosTime * 0.01;
    moonGeometry.worldMatrix.elements[2] = sinTime * 0.01;
    moonGeometry.worldMatrix.elements[8] = sinTime * -0.01;
	moonGeometry.worldMatrix.elements[10] = cosTime * 0.01;
	
	sunGeometry.worldMatrix.elements[0] = cosTime * 0.05;
    sunGeometry.worldMatrix.elements[2] = sinTime * 0.05;
    sunGeometry.worldMatrix.elements[8] = sinTime * -0.05;
	sunGeometry.worldMatrix.elements[10] = cosTime * 0.05;
	
	
    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//gl.drawElements(gl.TRANGLES, n, gl.UNSIGNED_BYTE, 0.0);

    gl.useProgram(phongShaderProgram);
    var uniforms = phongShaderProgram.uniforms;
    var cameraPosition = camera.getPosition();
    gl.uniform3f(uniforms.lightPositionUniform, sunPosition.x, sunPosition.y, sunPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);
	
	gl.useProgram(flatShaderProgram);
	var flatUniforms = flatShaderProgram.uniforms;
	gl.uniform3f(flatUniforms.lightPositionUniform, sunPosition.x, sunPosition.y, sunPosition.z);
    gl.uniform3f(flatUniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);
	
    projectionMatrix.setPerspective(45, aspectRatio, 0.1, 1000);
    planeGeometry.render(camera, projectionMatrix, flatShaderProgram, 0);
	planeGeometry.render(camera, projectionMatrix, flatShaderProgram, 1);
	planeGeometry.render(camera, projectionMatrix, flatShaderProgram, 2);
	planeGeometry.render(camera, projectionMatrix, flatShaderProgram, 3);
	planeGeometry.render(camera, projectionMatrix, flatShaderProgram, 4);
	planeGeometry.render(camera, projectionMatrix, flatShaderProgram, 5);
    earthGeometry.render(camera, projectionMatrix, phongShaderProgram);
	moonGeometry.render(camera, projectionMatrix, phongShaderProgram);
	sunGeometry.render(camera, projectionMatrix, flatShaderProgram);
}
