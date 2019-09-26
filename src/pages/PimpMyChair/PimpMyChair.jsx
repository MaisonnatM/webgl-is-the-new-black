import React, { useEffect } from 'react'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import './PimpMyChair.scss';

import { resizeRendererToDisplaySize } from '../../core/utils/resizeRendererToDisplaySize';
import CanvasBasics from '../../components/basics/CanvasBasics/CanvasBasics';
import TraySlider from './TraySlider/TraySlider';
import WhichPart from './WhichPart/WhichPart';

function PimpMyChair() {
  let activeOption;
  let theModel;
  const canvasRef = React.createRef();

  useEffect(() => {
    const BACKGROUND_COLOR = 0xf1f1f1;
    
    const INITIAL_MATERIAL = new THREE.MeshPhongMaterial( { color: 0xf1f1f1, shininess: 10 } );
    const INITIAL_MATERIAL_MAP = [
      {childID: "back", material: INITIAL_MATERIAL},
      {childID: "base", material: INITIAL_MATERIAL},
      {childID: "cushions", material: INITIAL_MATERIAL},
      {childID: "legs", material: INITIAL_MATERIAL},
      {childID: "supports", material: INITIAL_MATERIAL},
    ];
  
    const MODEL_PATH = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb";

    /*
      1 - Get the canvas Element
      2 - Create a new scene (Allow threeJS to know what display and where)
      3 - Create the renderer (display the scene)
    */
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

    /*
      1 - Enabled the renderer to have shadow
      2 - Set the pixel ratio to the device pixel ratio
    */
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio); 

    /*
      1 - Set the background-color of the canvas
      2 - Add a linear fog to the scene
        @params Fog => (color: Integer, near: Float, far: Float) 
    */
    scene.background = new THREE.Color(BACKGROUND_COLOR );
    scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);
    
    /*
      Init a perspective camera, the camera allow to know where to look in your canvas
      @params PerspectiveCamera => (fov: Number, aspect: Number, near: Number, far: Number)
    */
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.x = 0;

    /*
      1 - A loader allow to load and use our 3D Model
      2 - The loader allow to traverse the Model, (for each object in the Model) => enable cast and receive of shadows
      3 - Init the loader with our model path (don't have to be a url)
      4 - Init our theModel variable with the 3D Model scene
      5 - Set the model initial scale
      6 - Move the Yoffset of the model
      7 - Turn the model to 180deg (ex: 45deg = Math.PI / 4)
      8 - Loops on each ModalObject and apply the right color
      9 - Add the model to the scene
    */
    const loader = new GLTFLoader();
    loader.load(MODEL_PATH, function(gltf) {
      theModel = gltf.scene;
      theModel.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      theModel.scale.set(2,2,2);
      theModel.position.y = -1;
      theModel.rotation.y = Math.PI;
      for (let object of INITIAL_MATERIAL_MAP) {
        initColor(theModel, object.childID, object.material);
      }
      scene.add(theModel);
    }, undefined, function(error) {
      console.error(error)
    });

    /*
      1 - Allow the camera to orbit around our Model
      @params OrbitControls => (object : Camera, domElement : HTMLDOMElement)
      2 - How far you can orbit vertically, upper limit. @default => Math.PI
      3 - How far you can orbit vertically, lower limit. @default => 0
      4 - Enable (inertia), which can be used to give a sense of weight to the controls. @default => false
      5 - Enable camera panning. @default => true
      6 - Set the damping inertia. Can be used only if enableDamping is true.
      7 - Disable the auto rotate. 
    */
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 3;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.1;
    controls.autoRotate = false;

    /*
      Infinite update loop, re-run on each frame (60 on Modern Browser)
      Read f => resizeRendererToDisplaySize() go to function comment to understand what it does
      Read f => initRotate() go to function comment to understand what it does
    */
    function animate() {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);

      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
    }

    addLights(scene);
    addFloor(scene);
    animate();
  }, [canvasRef, theModel]);

  /*
    Traverse through the Model and apply the right material to every part of the Model (match the names given at each object in Bender (3D Software))
    @params initColor => (parent: Model, type: ModelObjectID, material: Material)
  */
  function initColor(parent, type, material) {
    parent.traverse((o) => {
      if (o.isMesh) {
        if (o.name.includes(type)) {
             o.material = material;
             o.nameID = type;
          }
      }
    });
  }

  function addLights(scene) {
    /*
      A HemisphereLight is a source of light above the scene (color fading from sky to ground)
      !!! Can't be use for cast shadows
      @params HemisphereLight => (skyColor : Integer, groundColor : Integer, intensity : Float)
    */
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.61 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add(hemiLight);

    /*
      A DirectionalLight is a source of light emitted in a specific direction (nice for simulate daylight)
      !!! Cast shadows
      @params DirectionalLight => (color : Integer, intensity : Float)
    */
    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.54 );
    dirLight.position.set( -8, 12, 8 );
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    scene.add( dirLight );
  }

  function addFloor(scene) {
    /*
      Create a plane Geometries
      @params PlaneGeometry => (width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
    */
    const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);

    /*
      Create a material (for shiny surfaces with specular highlights)
      @params MeshPhongMaterial => (parameters : Object)
      https://threejs.org/docs/index.html#api/en/materials/MeshPhongMaterial
    */
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      shininess: 0
    });
    
    /*
      1 - Merge the geometry and the material into a Mesh (object used for representing triangular polygon mesh)
      @params Mesh => (geometry : Geometry, material : Material)
      2 - Set the floor's rotation to be flat
      3 - Allow to receive shadow
      4 - Move the floor down (same has we did for the chair before)
      5 - Add it to the scene
    */
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -1;
    scene.add(floor);
  }

  /*
    Create a new material when a texture/color is clicked
    Then add it to the right object in the Model
    @params createNewMaterial => (color: ColorHexadecimaleWithoutHashtag || color: Object<texture: TextureUrl, size: Array[Int, Int, Int], shininess: Number>)
  */
  function createNewMaterial(color) {
    if (color.texture) {
      /*
        Load a texture, ThreeJS uses a ImageLoader internally for loading files.
        @params TextureLoader().load => (url : String, onLoad : Function, onProgress : Function, onError : Function)
      */
      const texture = new THREE.TextureLoader().load(color.texture);
      texture.repeat.set(color.size[0], color.size[1], color.size[2]);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      const newMaterial = new THREE.MeshPhongMaterial( {
        map: texture,
        shininess: color.shininess ? color.shininess : 10
      });

      setMaterial(theModel, activeOption, newMaterial);
    } else {
      const newMaterial = new THREE.MeshPhongMaterial({
        color: parseInt('0x' + color),
        shininess: 10
      });

      setMaterial(theModel, activeOption, newMaterial);
    }
  }

  /*
      Assign the material to the right object in the Model
      @params setMaterial => (parent: Model, type: ModelObjectID, material: Material)
  */
  function setMaterial(parent, type, material) {
    
    parent && parent.traverse((o) => {
     if (o.isMesh && o.nameID != null) {
       if (o.nameID === type) {
            o.material = material;
         }
     }
   });
  }

  /*
    Handler of the active Part selected
    First call when the page is init then on every change
    @params updateActivePart => (option: Object<{option: PartName, imgUrl: Url, active: Boolean}>)
  */
  function updateActivePart(option) {
    activeOption = option.option;
  }
  

  return (
    <div className="pimp-my-chair">
      <WhichPart switchPart={updateActivePart} />
      <CanvasBasics id="pimp-my-chair" canvasRef={canvasRef} />
      <TraySlider colorClicked={createNewMaterial} />
    </div>
  )
}

export default PimpMyChair;