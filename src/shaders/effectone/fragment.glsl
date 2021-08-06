uniform sampler2D uTexture;

varying vec2 vUv;
varying float vTest;


void main(){

    vec4 texture = texture2D(uTexture, vUv);

    //simple frag color
    // gl_FragColor = vec4(vNormal, 1.0);
    gl_FragColor = texture;
    gl_FragColor.rgb += vec3(vTest) * 0.05;
    // gl_FragColor = vec4(vTest, 0.0, 0.0, 1.0);

}