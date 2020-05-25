precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTexcoords;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uRotMatrix;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
varying vec2 vTexcoords;


void main(void) {
 
    vTexcoords = aTexcoords;
	 gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
}