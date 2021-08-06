#define PI 3.14159265358979323846

uniform float uTime;
uniform vec2 uHover;
uniform float uHoverState;

varying vec2 vUv;
varying float vTest;



void main(){
    vec3 newPosition = position;

    //get Distance 

    float dist = distance(uv, uHover);
    float anotherdist = smoothstep(0.5, 0.0,distance(uv, uHover))  ;
    newPosition.z += sin(dist * 10.0 + uTime * 3.0  ) * 10.0 * uHoverState;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

    //varyings
    vUv = uv;
    vTest = uHoverState * sin( -anotherdist * 12.0 - uTime * 3.0) ;
     
}