import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import perlin from '../shaders/perlin.glsl'

export default class MyEffectComposer {
    constructor(options){
        this.renderer = options.renderer
        this.scene = options.scene
        this.camera = options.camera
        this.createComposerPasses()
    }

    createComposerPasses(){
        this.composer = new EffectComposer(this.renderer)
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.composer.addPass(this.renderPass)
        //custom shader pass

      this.myEffect = {
        uniforms: {
          tDiffuse: { value: null },
          uScrollSpeed: { value: 0},
          uTime: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float uScrollSpeed;
            uniform float uTime;

            varying vec2 vUv;

            ${perlin}

            void main(){
              vec2 newUV = vUv;
              float area =  smoothstep(1.0, 0.8, vUv.y) * 2.0 - 1.0 ;
              float noise = (cnoise(vec3(newUV * 10.0, uTime * 0.5)) + 1.0) * 0.8;
              noise = smoothstep(0.5, 0.5, noise + area)  ;

              vec4 previousTexture = texture2D( tDiffuse, newUV);
              gl_FragColor = mix(vec4(1.0), previousTexture, noise);
            }
        `
      }

      this.customPass = new ShaderPass(this.myEffect);
      this.customPass.renderToScreen = true;

      this.composer.addPass(this.customPass);
    }
}