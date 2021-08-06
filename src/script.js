import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import imagesLoaded from 'imagesloaded';
import FontFaceObserver from 'fontfaceobserver';

import vertexShader from './shaders/effectTwo/vertex.glsl'
import fragmentShader from './shaders/effectTwo/fragment.glsl'

import Scroll from './scroll'
import MyEffectComposer from './postProcessing/secondEffectComposer';
import gsap from 'gsap';
import Stats from 'stats.js';


export default class Sketch{
    constructor(options){
        /**
         * add statsjs
         */
        this.stats = new Stats();
        this.stats.showPanel( 0 ); 
        document.body.appendChild( this.stats.dom );
        

        /**
         * * create scene
         */
        this.scene = new THREE.Scene();

        /**
         * * get dom width and hight
         */
        this.container = options.container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        /**
         * * camera
         */
        
        this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 100, 2000 );
        this.camera.position.z = 600;
        /**
         * * changed the field of view to match the units with the browser
         */
        this.camera.fov = Math.atan((this.height/2)/600 ) * 2 * (180/Math.PI) //180/Math.PI is the formula to change radians to degrees
        
        /**
         * * renderer
         */
        this.renderer = new THREE.WebGLRenderer( { 
            antialias: true,
            alpha: true
         } );
        this.renderer.setSize( this.width, this.height );
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.container.appendChild( this.renderer.domElement );

        
        /**
         * * load necessary things first
         */
        const fontOpen= new Promise(resolve => {
            new FontFaceObserver("Open Sans").load().then(()=>{
                resolve()
            })
        })
        
        const fontPlayFair = new Promise(resolve => {
            new FontFaceObserver('Playfair Display').load().then(()=>{
                resolve()
            })
        })
        
        const preLoadedImgs = new Promise( resolve => {
            imagesLoaded(document.querySelectorAll('img'), { background: true } , resolve)
        })
        
        /**
         * * Utils
         */
        this.clock = new THREE.Clock();
        this.images = [...document.querySelectorAll('img')]
        this.isResizeImg = false
        this.imgMetadataForScroll = null
        this.currentScroll = 0
        this.preScroll = 0
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uTexture : { value: 0 },
                uHover: { value: new THREE.Vector2(0.5, 0.5) },
                uHoverState: { value: 0.0 }
            }
        })
        this.materials = []
    
        
        let alldone = [fontOpen, fontPlayFair, preLoadedImgs]
        Promise.all(alldone).then(()=>{

   
            /**
             * * recall methods
             */
            this.scroll = new Scroll()
            this.addImages()
            this.setPosition( this.imgMetadata )
            this.onMouseMove()
            this.catchEvents()
            this.resize()
            this.myEffectComposer = new MyEffectComposer({
                renderer: this.renderer,
                scene: this.scene,
                camera: this.camera
            })
            this.myEffectComposer.createComposerPasses()
            this.render()
        })
        
    }

    onMouseMove() {
        window.addEventListener('mousemove',(event) => {
            this.mouse.x = ( event.clientX / this.width ) * 2 - 1;
            this.mouse.y = - ( event.clientY / this.height ) * 2 + 1;

            // update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera( this.mouse, this.camera );
            // calculate objects intersecting the picking ray
            this.intersects = this.raycaster.intersectObjects( this.scene.children );
            
            if( this.intersects.length > 0){
                let currentMesh = this.intersects[0].object;
                currentMesh.material.uniforms.uHover.value = this.intersects[0].uv;
            }

        })
    }

    addImages(){
        this.imgMetadata = this.images.map(eachImg => {
            let metadata = eachImg.getBoundingClientRect()
            
            // create meshes for each img
            let geometry = new THREE.PlaneBufferGeometry(metadata.width, metadata.height, 50, 50)
            let texture = new THREE.Texture(eachImg)
            texture.needsUpdate = true
            let material = this.shaderMaterial.clone()
            material.uniforms.uTexture.value = texture
            this.materials.push(material)
            let mesh = new THREE.Mesh(geometry, material)
            
            this.scene.add(mesh)

            eachImg.addEventListener('mouseenter',()=>{
                gsap.to(material.uniforms.uHoverState,{ value: 1, duration: 1 })
            })
            eachImg.addEventListener('mouseleave',()=>{
                gsap.to(material.uniforms.uHoverState,{ value: 0, duration: 1 })
            })
            
            return {
                img: eachImg,
                mesh: mesh,
                geometry: geometry,
                material: material,
                texture: texture,
                top: metadata.top,
                left: metadata.left,
                width: metadata.width,
                height: metadata.height
            }
        })
        
    }       
    
    resizeImg(){    
        this.imgMetadata.forEach(eachPrevious => {
            eachPrevious.geometry.dispose()
            eachPrevious.material.dispose()
            eachPrevious.texture.dispose()
            this.scene.remove(eachPrevious.mesh)
        })
        
        /**
         * ? if resize,
         * * create imgMetadatachg 
         */
        this.imgMetadata = this.images.map(eachImg => {
            let metadata = eachImg.getBoundingClientRect()
            
            // create meshes for each img
            let geometry = new THREE.PlaneBufferGeometry(metadata.width, metadata.height, 50, 50)
            let texture = new THREE.Texture(eachImg)
            texture.needsUpdate = true
            let material = this.shaderMaterial.clone()
            material.uniforms.uTexture.value = texture
            this.materials.push(material)
            let mesh = new THREE.Mesh(geometry, material)
            
            this.scene.add(mesh)

            eachImg.addEventListener('mouseenter',()=>{
                gsap.to(material.uniforms.uHoverState,{ value: 1, duration: 1 })
            })
            eachImg.addEventListener('mouseleave',()=>{
                gsap.to(material.uniforms.uHoverState,{ value: 0, duration: 1 })
            })
            
            return {
                img: eachImg,
                mesh: mesh,
                geometry: geometry,
                material: material,
                texture:texture,
                width: metadata.width,
                height: metadata.height,
                top: eachImg.offsetParent.offsetTop,
                left: eachImg.offsetParent.offsetLeft,
            }
        })
        
        /**
         * * set position
         */
        if(this.isResizeImg){
            this.setPosition(this.imgMetadata)
        }
        
        this.imgMetadataForScroll = this.imgMetadata
    }
    
    setPosition(thisArray){
        thisArray.forEach( each => {
            each.mesh.position.x = each.left - this.width/2 + each.width/2 ;
            each.mesh.position.y =( - each.top + this.height/2 - each.height/2) + this.currentScroll ;
        })
        thisArray[0].mesh.position.y += 10
        thisArray[0].mesh.scale.set(0.5, 0.5, 0.5)
    }
    
    catchEvents(){
        window.addEventListener('resize',this.resize.bind(this)) 
    }

    resize(){ 
        // Update sizes
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        
        // Update camera
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()
    
        // Update renderer
        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // console.log('resize');
        this.isResizeImg = true
        this.resizeImg()
    }

    render(){
        this.stats.begin()

        this.time = this.clock.getElapsedTime();

        /**
         * * update scroll
         */
        this.scroll.render()
        this.preScroll = this.currentScroll
        this.currentScroll = this.scroll.scrollToRender

        if(Math.round(this.preScroll)!==Math.round(this.currentScroll)){
            this.setPosition(this.imgMetadata)
            this.myEffectComposer.customPass.uniforms.uScrollSpeed.value = this.scroll.speedTarget
        }

        this.myEffectComposer.customPass.uniforms.uTime.value = this.time
        this.materials.forEach((each)=>{
            each.uniforms.uTime.value = this.time
        })
        
        /**
         * * update renderer and objs
         */
        // this.renderer.render( this.scene, this.camera );
        this.myEffectComposer.composer.render()

        /**
         * * animation loop
         */
        window.requestAnimationFrame(this.render.bind(this));

        this.stats.end()
    }    
}

new Sketch({
    container: document.getElementById('container'),
})

