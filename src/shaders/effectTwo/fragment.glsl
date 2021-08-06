uniform sampler2D uTexture;
uniform float uHoverState;


varying vec2 vUv;
varying float vTest;


void main(){

    vec2 p = vUv;
    float x = uHoverState;
    x = smoothstep(.0,1.0,(x*2.0+p.y-1.0));
    vec4 f = mix(
        texture2D(uTexture, (p-.5)*(1.-x)+.5), 
        texture2D(uTexture, (p-.5)*x+.5), 
    x);
    
    gl_FragColor = f;
    gl_FragColor.rgb += vec3(vTest) * 0.05;
}