<template>
    <div class="div">
        <!-- 3D场景 -->
        <div id="container">
        </div>
        <!-- <video id="video" autoplay loop muted>
            <source src="./video/videoPlane.mp4">
        </video> -->

    </div>
</template>

<script>
import * as THREE from "three";
import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
import OrbitControls from "three/examples/js/controls/OrbitControls";
import VRControls from "../plugins/VRControl";
import VREffect from "../plugins/VREffect";
import WebVRManager from "../plugins/webvr-manager.js";
import a from "../plugins/webvr-polyfill.js";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader";

import { HDRLoader, HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader";
import FirstPersonControls from "three/examples/js/controls/FirstPersonControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import Stats from "three/examples/js/libs/stats.min.js";

import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";

let plane;
let mouse,
    raycaster,
    isShiftDown = false;
let objects = [];
let cubeGeo, cubeMaterial;
let rollOverMesh, rollOverMaterial;
let isUserInteracting = false,
    onMouseDownMouseX = 0,
    onMouseDownMouseY = 0,
    lon = -90,
    onMouseDownLon = 0,
    lat = 0,
    onMouseDownLat = 0,
    phi = 0,
    theta = 0;

let cameraDefaults = {
    posCamera: new THREE.Vector3(0.0, 120.0, 500),
    posCameraTarget: new THREE.Vector3(0, 120, 1200),
    near: 0.1,
    far: 10000,
    fov: 45
};

let isMousePress = false;
let isMouseMove = false;

export default {
    data() {
        return {
            camera: null, //相机
            scene: null, //场景
            renderer: null, //渲染器
            composer: null, //后期处理
            mesh: null, //网格模型
            publicPath: process.env.VUE_APP_URL, //资源路径
            container: null,
            controls: null, //控制器
            effect: null,
            leftPress: false, //鼠标按下标志
            location: null, //热点数据
            dialogTableVisible: false, //弹窗显示标志
            choseItem: [
                {
                    type: "",
                    url: ""
                }
            ], //选中的热点

            controlsSmall: null, //小模型控制器
            containerSmall: null, //
            cameraSmall: null, //小模型相机
            sceneSmall: null, //小模型场景
            rendererSmall: null //小模型渲染器
        };
    },
    methods: {
        /**初始化 场景 相机 渲染器 灯光 控制器 模型 */
        init() {
            let that = this;
            this.container = document.getElementById("container");
            this.stats = this.initStats();
            this.initScene();
            this.initCamera();
            this.initRender();
            this.initLight();
            this.initControls();
            this.initContent();
            document.onkeydown = function (event) {
                that.keyboardDown(event);
            };
            document.onkeyup = function (event) {
                that.keyboardUp(event);
            };


            window.addEventListener('resize', this.onResize, true);
            // window.addEventListener('vrdisplaypresentchange', this.onResize, true);



        },
        /**初始化性能插件 */
        initStats() {
            let stats = new Stats();
            stats.domElement.style.position = "absolute";
            stats.domElement.style.left = "0px";
            stats.domElement.style.top = "0px";
            this.container.appendChild(stats.domElement);
            return stats;
        },
        /**设置场景 */
        initScene() {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xffffff);
        },
        /**设置相机 */
        initCamera() {
            this.camera = new THREE.PerspectiveCamera(45,
                window.innerWidth / window.innerHeight,
                1,
                10000
            );
            this.camera.position.set(200, 100, 100);

            this.camera.target = cameraDefaults.posCameraTarget;
            this.camera.aspect = 1;

            //this.camera.position.set(0, 250, 500);
            //this.camera.lookAt(1, 1, 1);
        },
        /**渲染器 */
        initRender() {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(
                this.container.clientWidth,
                this.container.clientHeight
            );
            // this.renderer.setClearColor(0x000000, 1); //设置背景颜色
            this.renderer.setClearColor(0xffffff, 0.0);
            this.container.appendChild(this.renderer.domElement);
        },
        /** 灯光 */
        initLight() {
            let ambientLight = new THREE.AmbientLight(0xffffff, 1);
            this.scene.add(ambientLight);
            // 平行光
            let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 0.75, 0.5).normalize();
            this.scene.add(directionalLight);
        },
        /**控制器 */
        initControls() {
            this.controls = new THREE.VRControls(this.camera);
            //站立姿态
            this.controls.standing = true;
            this.controls.userHeight = 200;
            this.effect = new THREE.VREffect(this.renderer);
            this.effect.setSize(window.innerWidth, window.innerHeight);
            //按钮和全屏模式管理
            var params = {
                hideButton: false, // Default: false.
                isUndistorted: false // Default: false.
            };
            this.manager = new WebVRManager(this.renderer, this.effect, params);

        },
        /**设置辅助坐标系 */
        helper() {
            let grid = new THREE.GridHelper(800, 160, 0xff0000, 0x000000);
            grid.material.opacity = 0.1;
            grid.material.transparent = true;
            this.scene.add(grid);
            let axesHelper = new THREE.AxesHelper(30);
            this.scene.add(axesHelper);
        },
        /**添加地面 */
        createFloor() {
            // 地板大小，即为能走动的范围
            let geometry = new THREE.PlaneBufferGeometry(400, 400);
            geometry.rotateX(-Math.PI / 2);
            plane = new THREE.Mesh(
                geometry,
                new THREE.MeshBasicMaterial({ visible: false })
            );
            plane.name = "我是地板";
            this.scene.add(plane);
            objects.push(plane);
        },
        /**添加环境 */
        createEnvironment() {
            // this.scene.background = new THREE.TextureLoader()
            //     .load(require("../assets/image/bg.jpg"));
        },


        /**场景中的内容 */
        initContent() {
            let that = this;
            this.createFloor();
            this.createEnvironment();
            let geometry = new THREE.BoxGeometry(50, 50, 50);
            let material = new THREE.MeshNormalMaterial();
            let cube = new THREE.Mesh(geometry, material);

            // Position cube mesh to be right in front of you.
            cube.position.set(0, 0, 0);
            this.scene.add(cube);


        },
        setupStage() {
            let display;
            navigator.getVRDisplays().then(function (displays) {
                if (displays.length > 0) {
                    display = displays[0];
                    if (display.stageParameters) {
                        this.setStageDimensions(display.stageParameters);
                    }
                }
            });
        },
        setStageDimensions(stage) {
            // Make the skybox fit the stage.
            var material = skybox.material;
            this.scene.remove(skybox);

            // Size the skybox according to the size of the actual stage.
            var geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
            skybox = new THREE.Mesh(geometry, material);

            // Place it on the floor.
            skybox.position.y = boxSize / 2;
            this.scene.add(skybox);

            // Place the cube in the middle of the scene, at user height.
            cube.position.set(0, controls.userHeight, 0);

        },

        /**帧率插件更新 */
        update() {
            this.stats.update();
            TWEEN.update();

            // this.testRotation();
        },

        // setupStage() {
        //     navigator.getVRDisplays().then(function (displays) {
        //         if (displays.length > 0) {
        //             display = displays[0];
        //             if (display.stageParameters) {
        //                 setStageDimensions(display.stageParameters);
        //             }
        //         }
        //     });
        // },
        onResize(e) {
            this.effect.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        },
        /** 动画函数 */
        animate() {
            if (!this.renderer.autoClear) this.renderer.clear();
            requestAnimationFrame(this.animate);
            // this.renderer.render(this.scene, this.camera);
            this.update();
            // this.controls.update();
            // console.log(this.camera.quaternion);
            this.manager.render(this.scene, this.camera);
            if (this.camera.target) {
                let vect = this.camera.getWorldDirection(new THREE.Vector3()); //获取当前视角方向
                //前进
                if (this.front) {
                    this.camera.position.z +=
                        vect.dot(new THREE.Vector3(0, 0, 30)) * 0.05; //沿z轴分解
                    this.camera.position.x +=
                        vect.dot(new THREE.Vector3(30, 0, 0)) * 0.05; //沿x轴分解
                }
                //后退
                if (this.back) {
                    this.camera.position.z -=
                        vect.dot(new THREE.Vector3(0, 0, 30)) * 0.05;
                    this.camera.position.x -=
                        vect.dot(new THREE.Vector3(30, 0, 0)) * 0.05;
                }
                //向左
                if (this.left) {
                    vect = vect.cross(new THREE.Vector3(0, 2, 0)); //求视角方向与
                    this.camera.position.z -=
                        vect.dot(new THREE.Vector3(0, 0, 15)) * 0.05;
                    this.camera.position.x -=
                        vect.dot(new THREE.Vector3(15, 0, 0)) * 0.05;
                }
                //向右
                if (this.right) {
                    vect = vect.cross(new THREE.Vector3(0, 2, 0));
                    this.camera.position.z +=
                        vect.dot(new THREE.Vector3(0, 0, 15)) * 0.05;
                    this.camera.position.x +=
                        vect.dot(new THREE.Vector3(15, 0, 0)) * 0.05;
                }
            }
        },


        /** 鼠标双击事件 */
        doubleClick() { },
        /** 鼠标移动事件 */
        move(event) { },
        /** 键盘按下事件 */
        down() { },
        /** 键盘升起事件 */
        up() { },
        /**视频加载失败 */
        videoLoadError(videoItem) {
            console.log(videoItem);
        },
        /** 键盘按下事件 */
        keyboardDown(event) {
            switch (event.keyCode) {
                case 65: // a
                    this.left = true;
                    break;
                case 68: // d
                    this.right = true;
                    break;
                case 83: // s
                    this.back = true;
                    break;
                case 87: // w
                    this.front = true;
                    break;
            }
        },
        /** 键盘收起事件 */
        keyboardUp(event) {
            switch (event.keyCode) {
                case 65: // a
                    this.left = false;
                    break;
                case 68: // d
                    this.right = false;
                    break;
                case 83: // s
                    this.back = false;
                    break;
                case 87: // w
                    this.front = false;
                    break;
            }
        },



        testanimate() {
            let lastRender = 0;
            let delta = Math.min(20 - lastRender, 500);
            lastRender = 20;

            //立方体的旋转
            // cube.rotation.y += delta * 0.0006;

            // Update VR headset position and apply to camera.
            //更新获取HMD的信息
            this.controls.update();

            // Render the scene through the manager.
            //进行camera更新和场景绘制
            this.manager.render(this.scene, this.camera, 20);
            requestAnimationFrame(this.testanimate);
        }
    },


    mounted() {
        this.init();
        this.animate();

        this.helper();
        this.setupStage();


    },
    destroyed() {
        //页面销毁时删除场景
        this.scene.children = {};
        this.renderer.dispose();
    }
};
</script>
<style lang="scss">
@import "../scss/index.scss";
</style>
