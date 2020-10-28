<template>
    <div class="div">
        <!-- 3D场景 -->
        <span id="percent">{{percent}}</span>
        <div id="container">
            <div v-if="bigger" style="width:100%;height:100%;position: fixed;background-color: rgba(0,0,0,0.6);">
                <div style="position:absolute;left:20%;">
                    <img style="width:990px;height:600px;" src="../assets/image/map.png">
                    <i @click="bigger = false" style="position: absolute;top:20px;right:20px;font-size:30px;color:white;" class="el-icon-circle-close"></i>
                    <div v-for="p in points" :key="p.name">
                        <img v-if="here == p.name" src="../assets/here.png" style="position: absolute;width:25px;height:25px;" :style="{'left':p.left + 1 + '%','top':p.top - 3 + '%'}" />
                        <img @click="goto(p)" src="../assets/image/yuan1.gif" style="position:absolute;width:25px;height:25px;" :style="{'left':p.left + 1 + '%','top':p.top + 2 + '%'}" />
                    </div>
                </div>
            </div>
            <div v-else class="scontent">
                <template v-if="!hideMap">
                    <img class="smap" src="../assets/image/map.png">
                    <img v-if="!ifMobile" @click="bigger = true" style="width:70px;" class="hide-map" src="../assets/image/bigger2.png">
                    <div v-for="p in points" :key="p.name">
                        <img v-if="here == p.name" src="../assets/here.png" style="position: absolute;width:15px;height:15px;" :style="{'left':p.left + '%','top':p.top - 5 + '%'}" />
                        <img @click="goto(p)" src="../assets/image/yuan1.gif" style="position:absolute;width:15px;height:15px;" :style="{'left':p.left + '%','top':p.top + '%'}" />
                    </div>
                </template>
            </div>

            <!-- 工具栏 -->
            <div v-if="showTool" class="tool">
                <div class="tool-box">
                    <div v-for="b in buttons" :key="b.label" :class="{'item-active': b.active }" class="item" v-on:click.stop="handleButtonClick(b)">
                        <i style="font-size: 22px;" :class="[b.class]"></i>
                        <br>
                        <span>{{b.label}}</span>
                    </div>

                </div>
            </div>
            <div v-show="buttons[1].active" class="tool2">
                <div class="tool-box2">
                    <div v-for="b in buttons2" :key="b.label" :class="{'item-active': b.active || b.hover}" class="item2" v-on:click.stop="handleButtonClick2(b)">
                        <i style="font-size: 22px;" :class="[b.class]"></i>
                        <br>
                        <span>{{b.label}}</span>
                    </div>
                </div>
            </div>

            <div v-show="ifMobile" id="controler">
            </div>

            <!-- 热点弹窗 -->
            <el-dialog destroy-on-close :visible.sync="dialogTableVisible" @close="closeDialog">
                <div v-if="choseItem[0].type == 'picture'" class="picture">
                    <el-image class='detail-image' fit="contain" :src="choseItem[0].url"></el-image>
                </div>
                <div v-else-if="choseItem[0].type == 'video'">
                    <video id="video" autoplay controls loop muted class="video">
                        <source :src="choseItem[0].url " type="video/mp4" />
                    </video>
                </div>
                <div v-else-if="choseItem[0].type == 'model'">
                    <div id="containerSmall">
                    </div>
                </div>
            </el-dialog>

            <!-- 播放音频 -->
            <audio :src="audioUrl" autoplay ref="audio"></audio>
        </div>
    </div>
</template>

<script>
import * as THREE from "three";
import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { HDRLoader, HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader";
import Stats from "three/examples/js/libs/stats.min.js";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import ThreeBSP from "../plugins/ThreeBSP";
import WebVRManager from "../plugins/webvr-manager.js";


let plane, camera, scene, renderer, composer, mesh, controls;
let texture_placeholder;
let mouse,
    raycaster,
    isShiftDown = false;
let floors = [];
let walls = [];
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
    posCamera: new THREE.Vector3(950, 120.0, 160.0),
    posCameraTarget: new THREE.Vector3(120, 120, 120),
    y: 200,
    near: 0.1,
    far: 10000,
    fov: 45
};

let isMousePress = false;
let isMouseMove = false;

let ifMobile = navigator.userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
);

//热点图
let spriteMap = new THREE.TextureLoader().load(
    require("../assets/image/circle.png")
);
let spriteMaterial = new THREE.SpriteMaterial({
    transparent: true,
    map: spriteMap,
    side: THREE.DoubleSide
});

let Sprite = new THREE.Sprite(spriteMaterial);

let origin = 20;
let dots = [];

var isControlPress = false; //是否按住方向盘
let touchTime = 0 //手机触屏事件，解决手机点击判断为拖动

let noWalk = false //工具栏按钮点击不走动
let smallArch = "";//小拱门
let bigArch = "";//大拱门
let cubeGeometryL = "";//大墙面
let cubeGeometryW = "";//小墙面

let skyAndFloorL = "";//大的天空和地板
let skyAndFloorW = "";//小的天空和地板

// 创建一个时钟对象Clock
var clock = new THREE.Clock();
// 设置渲染频率为30FBS，也就是每秒调用渲染器render方法大约30次
var FPS = 50;
var renderT = 1 / FPS; //单位秒  间隔多长时间渲染渲染一次
// 声明一个变量表示render()函数被多次调用累积时间
// 如果执行一次renderer.render，timeS重新置0
var timeS = 0;

let isOverlook = false //是否俯視

export default {
    data() {
        return {
            percent: 0,
            here: "f",
            bigger: false,
            hideMap: false,
            ifMobile: ifMobile,
            publicPath: process.env.VUE_APP_URL,
            camera: {},
            points: [], //小地图点位置坐标
            firstVenue: [], //第一个场景
            floorName: "",
            ifOverlook: false,//是否俯视图
            buttons: [{
                active: false,
                hover: false,
                class: 'el-icon-video-play',
                class1: 'el-icon-video-play',
                class2: 'el-icon-video-pause',
                label: '播放'
            }, {
                active: false,
                hover: false,
                class: 'el-icon-view',
                label: '视角'
            }, {
                active: true,
                hover: false,
                class: 'el-icon-map-location',
                label: '地图'
            }, {
                active: true,
                hover: false,
                class: 'el-icon-bell',
                class1: 'el-icon-bell',
                class2: 'el-icon-bell',
                label: '音乐'
            }, {
                active: false,
                hover: false,
                class: 'el-icon-full-screen',
                class1: 'el-icon-full-screen',
                class2: 'el-icon-full-screen',
                label: '全屏'
            }],//底部功能按钮
            buttons2: [{
                active: false,
                hover: false,
                class: 'el-icon-box',
                label: '三维'
            }, {
                active: false,
                hover: false,
                class: 'el-icon-aim',
                label: '鸟瞰'
            }, {
                active: true,
                hover: false,
                class: 'el-icon-place',
                label: '漫游'
            }],

            dialogTableVisible: false, //弹窗显示标志
            choseItem: [
                {
                    type: "",
                    url: ""
                }
            ], //选中的热点
            audioUrl: "", //音频路径
            showTool: true


        };
    },
    methods: {
        goto(p) {
            this.bigger = false;
            this.here = p.name;
            new TWEEN.Tween(this.camera.position)
                .to(
                    {
                        x: p.x,
                        y: cameraDefaults.y,
                        z: p.z
                    },
                    2000
                )
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(function () { })
                .start();
        },
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

            cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
            cubeMaterial = new THREE.MeshLambertMaterial({
                color: 0xfeb74c,
                map: new THREE.TextureLoader().load("../assets/image/mouse.png")
            });

            let rollOverGeo = new THREE.RingBufferGeometry(4, 7, 32); //new THREE.BoxBufferGeometry( 10, 1, 10 );
            rollOverMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                opacity: 0.5,
                transparent: true
            });
            rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
            rollOverMesh.rotation.x = -Math.PI / 2;
            rollOverMesh.position.y = 10;
            // rollOverMesh.add(new THREE.AxesHelper(100));
            this.scene.add(rollOverMesh);

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();
            window.addEventListener('resize', this.onResize, true);




            // window.addEventListener("vrdisplaypresentchange", onFullscreenChange, false);

            // this.definedComposer();
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
            this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
            this.camera.position.copy(cameraDefaults.posCamera);

            this.camera.target = cameraDefaults.posCameraTarget;

            this.camera.aspect = 1;
            console.log(this.camera.target)
            // this.camera.target.x = 0;
            // this.camera.target.y = 0;
            // this.camera.target.z = 0;

            this.camera.position.set(950, cameraDefaults.y, 1000);
        },
        /**渲染器 */
        initRender() {
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

            // this.renderer.setClearColor(0x000000, 1); //设置背景颜色
            this.renderer.setClearColor(0xffffff, 0.0);

            //设置渲染器阴影可用
            this.renderer.shadowMapEnabled = true;
            this.container.appendChild(this.renderer.domElement);

            let musemu = this.renderer.domElement;
            musemu.addEventListener('mousemove', this.onDocumentMouseMove, false);
            musemu.addEventListener('touchmove', this.onDocumentMouseMove, false);
            musemu.addEventListener('mousedown', this.onDocumentMouseDown, false);
            musemu.addEventListener('touchstart', this.onDocumentMouseDown, false);
            musemu.addEventListener('mouseup', this.onDocumentMouseUp, false);
            musemu.addEventListener('touchend', this.onDocumentMouseUp, false);
            //musemu.appendChild(this.renderer.domElement);
            this.container.appendChild(this.renderer.domElement);

            // 添加方向盘事件
            let controler = document.getElementById('controler')
            controler.addEventListener('mousemove', this.onControlMove, false);
            controler.addEventListener('touchmove', this.onControlMove, false);
            controler.addEventListener('mousedown', this.onControlDown, false);
            controler.addEventListener('touchstart', this.onControlDown, false);
            controler.addEventListener('mouseup', this.onControlUp, false);
            controler.addEventListener('touchend', this.onControlUp, false);
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
            // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement); //创建控件对象
            // this.controls.maxZoom = 0.8;
        },

        /**添加地面 */
        createFloor() {
            //主场馆天花板
            let geometry2 = new THREE.PlaneBufferGeometry(2300, 3700);
            let sky = new THREE.Mesh(geometry2, this.loadTexture(require("../assets/texture/floor/tianhuaban.jpg")));
            sky.position.z = -800;
            sky.position.x = 950;
            sky.position.y = 500;
            sky.rotateX(Math.PI * 0.5);
            this.scene.add(sky);


            //主场馆地板
            let floor = new THREE.Mesh(geometry2, this.loadTexture(require("../assets/texture/floor/diban.jpg")));
            floor.position.z = -800;
            floor.position.x = 950;
            floor.position.y = 0;
            floor.name = "地板";
            floor.rotateX(-Math.PI * 0.5);
            this.scene.add(floor);
            floors.push(floor);


        },

        /** 拿到点击元素值,显示相应资源 */
        addSelectedObject(Object) {
            console.log("拿到点击元素值,显示相应资源");
            console.log(Object);
            this.choseItem = dots.filter(item => {
                return item.name === Object.name;
            });

            console.log(this.choseItem[0]);

            if (this.choseItem.length > 0) {
                this.dialogTableVisible = true;
            } else {
                this.choseItem = [
                    {
                        type: ""
                    }
                ];
            }
            if (this.choseItem[0].type == "video") {
                let audio = this.$refs.audio;
                if (audio !== null) {
                    //检测播放是否已暂停.audio.paused 在播放器播放时返回false.
                    if (audio.paused) {
                        // audio.play();//audio.play();// 这个就是播放  
                    } else {
                        audio.pause();// 这个就是暂停
                        this.buttons[3].active = false;
                    }
                }

            }
            if (this.choseItem[0].type == "model") {
                this.$nextTick(() => {
                    this.initSmall(
                        this.choseItem[0].mtl,
                        this.choseItem[0].obj
                    );
                });
            }
        },
        closeDialog() {

            this.dialogTableVisible = false;
            cancelAnimationFrame(this.IdSmall); // Stop the animation
            if (this.rendererSmall) this.rendererSmall.dispose();
            if (this.sceneSmall) this.sceneSmall = null; //清除场景
            if (this.controlsSmall) this.controlsSmall = null; //清除控制器
            if (this.cameraSmall) this.cameraSmall = null; //清除相机
            if (this.rendererSmall) this.rendererSmall = null; //清除渲染器
            if (this.containerSmall) this.containerSmall = null;

        },
        /**创建地板和天花板的geometry */
        createSkyAndFloor() {
            let geometry1 = new THREE.PlaneBufferGeometry(700, 700);
            let material = new THREE.MeshPhongMaterial({ color: 0xafc0ca });
            skyAndFloorL = new THREE.Mesh(geometry1, material);

            let geometry2 = new THREE.PlaneBufferGeometry(700, 500);
            skyAndFloorW = new THREE.Mesh(geometry2, material);


        },
        /**创建第一个场馆 */
        createFirstVenue(array) {
            let l = 700, w = 500, h = 350;
            for (let i = 0, len = array.length; i < len; i++) {
                let arr = [];
                if (i <= 3 || i >= 6) { arr = [l, w]; }
                if (i == 4 || i == 5) { arr = [l, l]; }
                let geometry1 = new THREE.PlaneBufferGeometry(arr[0], arr[1]);
                //地板
                geometry1.rotateX(-Math.PI / 2);

                let b1 = new THREE.Mesh(geometry1, this.loadTexture(require(`../assets/floor/地板1.jpg`)));


                // let b1 = skyAndFloorW.clone();
                // b1.material = this.loadTexture(require(`../assets/floor/${array[i].name}.png`));
                // b1.rotateX(-Math.PI / 2);

                b1.name = `地板${array[i].name}`;
                b1.position.x = array[i].x;
                b1.position.z = array[i].z;
                this.scene.add(b1);
                floors.push(b1);



                //天花板
                let g = new THREE.PlaneBufferGeometry(arr[0], arr[1]);
                g.rotateX(Math.PI / 2);
                let b0 = new THREE.Mesh(g, this.loadTexture(require("../assets/sky/1.jpg")));

                // let b0 = skyAndFloorW.clone();
                // b0.material = this.loadTexture(require("../assets/sky/1.jpg"));
                // b0.rotateX(Math.PI / 2);


                b0.position.x = array[i].x;
                b0.position.z = array[i].z;
                b0.position.y = h;
                this.scene.add(b0);

                if (i < 3) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-1.jpg`), 5), array[i].x, h / 2, array[i].z + w / 2, "墙面1");
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-2.jpg`), 4), array[i].x, h / 2, array[i].z - w / 2, "墙面1");
                }

                else if (i == 3) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-1.jpg`), 5), array[i].x, h / 2, array[i].z + w / 2, "墙面1");
                    this.createCubeWall(w, h, 5, 0.5, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-2.jpg`), 4), array[i].x - l / 2, h / 2, array[i].z, "墙面1");

                }
                else if (4 <= i && 5 >= i) {
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-1.jpg`), 5), array[i].x + l / 2, h / 2, array[i].z, "墙面1");
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-2.jpg`), 4), array[i].x - l / 2, h / 2, array[i].z, "墙面1");
                }

                else if (i == 6) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-1.jpg`), 4), array[i].x, h / 2, array[i].z - w / 2, "墙面1");
                    this.createCubeWall(w, h, 5, 0.5, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-2.jpg`), 4), array[i].x - l / 2, h / 2, array[i].z, "墙面1");

                }
                else if (i >= 7) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-1.jpg`), 5), array[i].x, h / 2, array[i].z + w / 2, "墙面1");
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/firstVenueImage/${array[i].name}-2.jpg`), 4), array[i].x, h / 2, array[i].z - w / 2, "墙面1");
                }
            }
        },
        /**创建第二个场馆 */
        createSecondVenue(array) {

            let l = 700, w = 500, h = 350;
            for (let i = 0, len = array.length; i < len; i++) {
                let arr = [];
                if (i != 3) { arr = [w, l]; }
                if (i == 3) { arr = [l, l]; }
                let geometry1 = new THREE.PlaneBufferGeometry(arr[0], arr[1]);
                //地板
                geometry1.rotateX(-Math.PI / 2);
                let b1 = new THREE.Mesh(geometry1, this.loadTexture(require(`../assets/floor/地板1.jpg`)));
                b1.name = `地板${array[i].name}`;
                b1.position.x = array[i].x;
                b1.position.z = array[i].z;
                this.scene.add(b1);
                floors.push(b1);

                //天花板
                let g = new THREE.PlaneBufferGeometry(arr[0], arr[1]);
                g.rotateX(Math.PI / 2);
                let b0 = new THREE.Mesh(g, this.loadTexture(require("../assets/sky/1.jpg")));
                b0.position.x = array[i].x;
                b0.position.z = array[i].z;
                b0.position.y = h;
                this.scene.add(b0);

                if (i < 2) {
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-1.jpg`), 5), array[i].x + w / 2, h / 2, array[i].z, "墙面1");
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-2.jpg`), 4), array[i].x - w / 2, h / 2, array[i].z, "墙面1");
                }

                else if (i == 2) {
                    this.createCubeWall(w, h, 5, 0, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-1.jpg`), 4), array[i].x, h / 2, array[i].z - l / 2, "墙面1");
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-2.jpg`), 4), array[i].x - w / 2, h / 2, array[i].z, "墙面1");
                }
                else if (i == 3) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-1.jpg`), 5), array[i].x, h / 2, array[i].z + l / 2, "墙面1");
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-2.jpg`), 4), array[i].x, h / 2, array[i].z - l / 2, "墙面1");
                }
                else if (i == 4) {
                    this.createCubeWall(w, h, 5, 0, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-1.jpg`), 4), array[i].x, h / 2, array[i].z - l / 2, "墙面1");
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-2.jpg`), 5), array[i].x + w / 2, h / 2, array[i].z, "墙面1");
                }
                else if (i >= 5) {
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-1.jpg`), 5), array[i].x + w / 2, h / 2, array[i].z, "墙面1");
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/secondVenueImage/${array[i].name}-2.jpg`), 4), array[i].x - w / 2, h / 2, array[i].z, "墙面1");
                }
            }
        },
        /**创建第三个场馆 */
        createThridVenue(array) {
            let l = 700, w = 500, h = 350;
            for (let i = 0, len = array.length; i < len; i++) {
                let arr = [];
                if (i <= 2 || i >= 5) { arr = [l, w]; }
                if (i == 4 || i == 3) { arr = [l, l]; }
                let geometry1 = new THREE.PlaneBufferGeometry(arr[0], arr[1]);
                //地板
                geometry1.rotateX(-Math.PI / 2);
                let b1 = new THREE.Mesh(geometry1, this.loadTexture(require(`../assets/floor/地板1.jpg`)));
                b1.name = `地板${array[i].name}`;
                b1.position.x = array[i].x;
                b1.position.z = array[i].z;
                this.scene.add(b1);
                floors.push(b1);

                //天花板
                let g = new THREE.PlaneBufferGeometry(arr[0], arr[1]);
                g.rotateX(Math.PI / 2);
                let b0 = new THREE.Mesh(g, this.loadTexture(require("../assets/sky/1.jpg")));
                b0.position.x = array[i].x;
                b0.position.z = array[i].z;
                b0.position.y = h;
                this.scene.add(b0);

                if (i < 2) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-1.jpg`), 5), array[i].x, h / 2, array[i].z + w / 2, "墙面1");
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-2.jpg`), 4), array[i].x, h / 2, array[i].z - w / 2, "墙面1");
                } else if (i == 2) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-1.jpg`), 4), array[i].x, h / 2, array[i].z - w / 2, "墙面1");
                    this.createCubeWall(w, h, 5, 0.5, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-2.jpg`), 5), array[i].x + l / 2, h / 2, array[i].z, "墙面1");
                } else if (3 <= i && 4 >= i) {
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-1.jpg`), 5), array[i].x + l / 2, h / 2, array[i].z, "墙面1");
                    this.createCubeWall(l, h, 5, 0.5, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-2.jpg`), 4), array[i].x - l / 2, h / 2, array[i].z, "墙面1");
                } else if (i == 5) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-1.jpg`), 5), array[i].x, h / 2, array[i].z + w / 2, "墙面1");
                    this.createCubeWall(w, h, 5, 0.5, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-2.jpg`), 5), array[i].x + l / 2, h / 2, array[i].z, "墙面1");
                } else if (i >= 6) {
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-1.jpg`), 5), array[i].x, h / 2, array[i].z + w / 2, "墙面1");
                    this.createCubeWall(l, h, 5, 0, this.loadSingleTexture(require(`../assets/thirdVenueImage/${array[i].name}-2.jpg`), 4), array[i].x, h / 2, array[i].z - w / 2, "墙面1");
                }
            }
        },
        /**创建拱门 */
        createArch(array) {
            let that = this;
            let l = 100, w = 500, h = 350;
            let geometry = new THREE.Geometry();
            let material = new THREE.MeshPhongMaterial({ color: 0xafc0ca });


            let mtlLoader = new MTLLoader();

            mtlLoader.load(
                `${that.publicPath}/model/zhiyinpai/zhiyin.mtl`,
                function (materials) {
                    let objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        `${that.publicPath}/model/zhiyinpai/zhiyin.obj`,
                        function (object) {



                            // //加载场馆一拱门模型
                            let mtlLoader12 = new MTLLoader();
                            mtlLoader12.load(
                                `${that.publicPath}/model/menkeji(2)/menzhuangbei.mtl`,
                                function (materials1) {
                                    let objLoader1 = new OBJLoader();
                                    objLoader1.setMaterials(materials1);
                                    objLoader1.load(
                                        `${that.publicPath}/model/menkeji(2)/menzhuangbei.obj`,
                                        function (object1) {

                                            //加载场馆二拱门模型
                                            let mtlLoader13 = new MTLLoader();
                                            mtlLoader13.load(
                                                `${that.publicPath}/model/menxincailiao(1)/menzhuangbei.mtl`,
                                                function (materials2) {
                                                    let objLoader2 = new OBJLoader();
                                                    objLoader2.setMaterials(materials2);
                                                    objLoader2.load(
                                                        `${that.publicPath}/model/menkeji(2)/menzhuangbei.obj`,
                                                        function (object2) {
                                                            //加载场场馆3拱门模型
                                                            let mtlLoader14 = new MTLLoader();
                                                            mtlLoader14.load(
                                                                `${that.publicPath}/model/menzhuangbei(2)/menzhuangbei.mtl`,
                                                                function (materials3) {
                                                                    let objLoader3 = new OBJLoader();
                                                                    objLoader3.setMaterials(materials3);
                                                                    objLoader3.load(
                                                                        `${that.publicPath}/model/menkeji(2)/menzhuangbei.obj`,
                                                                        function (object3) {

                                                                            // //拱门一

                                                                            object1.position.z = 0;
                                                                            object1.position.x = -150;
                                                                            object1.position.y = 187;
                                                                            object1.scale.set(1.2, 1.1, 1.2);
                                                                            object1.rotation.y = Math.PI / 2;
                                                                            that.scene.add(object1);

                                                                            let obj1 = object1.clone();
                                                                            obj1.position.set(-150, 187, -2200);
                                                                            that.scene.add(obj1);

                                                                            // //拱门2
                                                                            object2.position.z = -2600;
                                                                            object2.position.x = 250;
                                                                            object2.position.y = 187;
                                                                            object2.scale.set(1.2, 1.1, 1.2);
                                                                            // object.rotation.z = Math.PI;
                                                                            that.scene.add(object2);

                                                                            let obj2 = object2.clone();
                                                                            obj2.position.set(1650, 187, -2600);
                                                                            that.scene.add(obj2);


                                                                            // 拱门3
                                                                            object3.position.z = 0;
                                                                            object3.position.x = 2050;
                                                                            object3.position.y = 187;
                                                                            object3.scale.set(1.2, 1.1, 1.2);
                                                                            object3.rotation.y = Math.PI / 2;
                                                                            // object.rotation.z = Math.PI;
                                                                            that.scene.add(object3);

                                                                            let obj3 = object3.clone();
                                                                            obj3.position.set(2050, 187, - 2200);
                                                                            that.scene.add(obj3);


                                                                            let geometry1 = new THREE.PlaneBufferGeometry(500, 100);
                                                                            let geometry2 = new THREE.PlaneBufferGeometry(700, 100);

                                                                            //地板
                                                                            geometry1.rotateX(-Math.PI / 2);
                                                                            geometry2.rotateX(-Math.PI / 2);

                                                                            geometry1.rotateY(-Math.PI / 2);
                                                                            geometry2.rotateY(-Math.PI / 2);


                                                                            let b1 = new THREE.Mesh(geometry1, that.loadTexture(require(`../assets/floor/地板条2.jpg`)));
                                                                            let b2 = new THREE.Mesh(geometry2, that.loadTexture(require(`../assets/floor/地板条.jpg`)));
                                                                            let bb;
                                                                            //
                                                                            let a = THREE.ImageUtils.loadTexture(`${that.publicPath}/model/zhiyinpai/title.jpg`);
                                                                            let b = THREE.ImageUtils.loadTexture(`${that.publicPath}/model/zhiyinpai/title.jpg`);
                                                                            object.children[8].material.map = a;
                                                                            object.children[3].material.map = b;
                                                                            object.scale.set(0.05, 0.05, 0.05);
                                                                            //加载场馆中的拱门
                                                                            for (var i = 0, len = array.length; i < len; i++) {
                                                                                let rotate = array[i].rotate ? 0.5 : 0;
                                                                                let obj4;
                                                                                let size = array[i].size == "big" ? 1.68 : 1.2;

                                                                                if (array[i].venue == 1) {
                                                                                    obj4 = object1.clone();
                                                                                }

                                                                                else if (array[i].venue == 2) {
                                                                                    obj4 = object2.clone();
                                                                                    rotate = rotate + 0.5;

                                                                                }
                                                                                else if (array[i].venue == 3) {
                                                                                    obj4 = object3.clone();

                                                                                }

                                                                                obj4.scale.set(size, 1.2, 1.2);
                                                                                obj4.position.set(array[i].x, 140, array[i].z);
                                                                                obj4.rotation.y += rotate * Math.PI;
                                                                                that.scene.add(obj4);



                                                                                let objj = object.clone();
                                                                                objj.position.z = array[i].z;
                                                                                objj.position.x = array[i].x;
                                                                                objj.position.y = 300;
                                                                                if (array[i].venue == 2) {
                                                                                    objj.rotation.y = rotate * Math.PI;

                                                                                }
                                                                                else {
                                                                                    objj.rotation.y = rotate == 0 ? 0.5 * Math.PI : 0;

                                                                                }
                                                                                that.scene.add(objj);


                                                                                //加载地板条
                                                                                if (array[i].size == "big") {
                                                                                    bb = b2.clone();
                                                                                } else {
                                                                                    bb = b1.clone();
                                                                                }
                                                                                if (array[i].venue == 2) {
                                                                                    rotate = rotate + 0.5;
                                                                                }
                                                                                bb.rotation.y = rotate * Math.PI;
                                                                                bb.position.set(array[i].x, 0, array[i].z);
                                                                                that.scene.add(bb);
                                                                            }

                                                                            that.percent += 20;
                                                                        }
                                                                    );
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );









            //加载告示牌
            // let mtlLoader12 = new MTLLoader();
            // mtlLoader12.load(
            //     `${that.publicPath}/model/zhiyinpai/zhiyin.mtl`,
            //     function (materials) {
            //         let objLoader = new OBJLoader();
            //         objLoader.setMaterials(materials);
            //         objLoader.load(
            //             `${that.publicPath}/model/zhiyinpai/zhiyin.obj`,
            //             function (object) {

            //                 for (var i = 0, len = array.length; i < len; i++) {

            //                     let rotate = 0;
            //                     let obj;
            //                     if (array[i].rotate) { rotate = 0.5; }
            //                     if (array[i].size == "big") {
            //                         obj = bigArch.clone();
            //                         obj.position.x = array[i].x;
            //                         obj.position.z = array[i].z;
            //                         obj.rotation.y += rotate * Math.PI;
            //                         obj.updateMatrix();
            //                         geometry.merge(obj.geometry, obj.matrix);
            //                     }
            //                     else {
            //                         obj = smallArch.clone();
            //                         obj.position.x = array[i].x;
            //                         obj.position.z = array[i].z;
            //                         obj.rotation.y += rotate * Math.PI;
            //                         obj.updateMatrix();
            //                         geometry.merge(obj.geometry, obj.matrix);
            //                     }


            //                     let objj = object.clone();
            //                     let a = THREE.ImageUtils.loadTexture(`${that.publicPath}/model/zhiyinpai/${i + 2}.jpg`);
            //                     let b = THREE.ImageUtils.loadTexture(`${that.publicPath}/model/zhiyinpai/${i + 2}.jpg`);

            //                     objj.children[8].material.map = a;
            //                     objj.children[3].material.map = b;
            //                     objj.position.z = array[i].z;
            //                     objj.position.x = array[i].x;
            //                     objj.position.y = 300;
            //                     objj.scale.set(0.05, 0.05, 0.05);
            //                     objj.rotation.y = rotate == 0 ? 0.5 * Math.PI : 0;
            //                     that.scene.add(objj);



            //                 }


            //                 that.scene.add(new THREE.Mesh(geometry, material));

            //             }
            //         );
            //     }
            // );

        },
        load(url) {
            let that = this;
            return new Promise((resolve) => {

                resolve(THREE.ImageUtils.loadTexture(`${that.publicPath}/model/zhiyinpai/1.jpg`));
            })
        },
        /**创建两种拱门，保存起来 */
        createArchSingle() {
            let material = new THREE.MeshPhongMaterial({ color: 0xafc0ca });
            //小拱门
            let wall = this.returnObject(100, 350, 500, 0, material, 0, 175, 0, "墙面4");
            let b = this.returnObject(100, 320, 400, 0, material, 0, 160, 0, "墙面4");
            let arr = [];
            arr.push(b);
            let obj = this.createResultBsp(wall, arr);
            smallArch = obj;

            //大拱门
            let wall1 = this.returnObject(100, 350, 700, 0, material, 0, 175, 0, "墙面4");
            let b1 = this.returnObject(100, 320, 600, 0, material, 0, 160, 0, "墙面4");
            let arr1 = [];
            arr1.push(b1);
            let obj1 = this.createResultBsp(wall1, arr1);
            bigArch = obj1;


        },
        //音频暂停、播放
        bf() {
            let audio = this.$refs.audio;
            if (audio !== null) {
                //检测播放是否已暂停.audio.paused 在播放器播放时返回false.
                if (audio.paused) {
                    audio.play();//audio.play();// 这个就是播放  
                } else {
                    audio.pause();// 这个就是暂停
                }
            }
        },
        /**判断区间 */
        judgeArea(array) {
            // console.log(array);
            let that = this;

            setInterval(function () {
                for (let i = 0, len = array.length; i < len; i++) {
                    if (that.camera.position.x >= array[i].x2
                        && that.camera.position.x <= array[i].x1
                        && that.camera.position.z >= array[i].z2
                        && that.camera.position.z <= array[i].z1
                    ) {

                        if (`地板${array[i].name}` == that.floorName) {
                            return;
                        }
                        else {
                            that.floorName = `地板${array[i].name}`;
                            let audio = that.$refs.audio;
                            // that.audioUrl = require(`../assets/mp3/${i + 1}.mp3`);
                            that.audioUrl = `http://119.3.66.94:8090/LOCALFILE/mp3/${i + 1}.mp3`;



                            audio.load();
                            audio.play();
                        }
                    }
                }
            }, 1000)
        },
        /**创建字体 */
        createFont() { },
        /**贴图 */
        loadTexture(path) {
            let texture = new THREE.Texture(texture_placeholder);
            let material = new THREE.MeshBasicMaterial({
                map: texture,
            });
            let image = new Image();
            image.onload = function () {
                texture.image = this;
                texture.needsUpdate = true;
            };
            image.src = path;
            return material;
        },
        /**单面贴图 */
        loadSingleTexture(path, index) {
            let texture = new THREE.Texture(texture_placeholder);
            let material = [0, 0, 0, 0, 0, 0].fill(new THREE.MeshBasicMaterial({ color: 0xafc0ca }));
            // let material = [0, 0, 0, 0, 0, 0];

            material[index] = new THREE.MeshBasicMaterial({
                map: texture,
            });
            let image = new Image();
            image.onload = function () {
                texture.image = this;
                texture.needsUpdate = true;
            };
            image.src = path;
            return material;
        },
        /**创建一面墙 */
        createCubeWall(width, height, depth, angle, material, x, y, z, name) {
            let that = this;
            let cubeGeometry;
            if (width == 500) {
                cubeGeometry = cubeGeometryW.clone();
            }
            if (width == 700) {
                cubeGeometry = cubeGeometryL.clone();
            }
            else {
                cubeGeometry = new THREE.BoxBufferGeometry(width, height, 5);
            }
            let cube = new THREE.Mesh(cubeGeometry, material);
            cube.position.x = x;
            cube.position.y = y;
            cube.position.z = z;
            cube.rotation.y += angle * Math.PI; //-逆时针旋转,+顺时针
            cube.name = name;
            that.scene.add(cube);
        },
        /**创建对象 */
        returnObject(width, height, depth, angle, material, x, y, z, name) {
            let cubeGeometry = new THREE.BoxGeometry(width, height, depth);
            let cube = new THREE.Mesh(cubeGeometry, material);
            cube.position.x = x;
            cube.position.y = y;
            cube.position.z = z;
            cube.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
            cube.name = name;
            return cube;
        },
        /** 创建BSP对象 */
        createResultBsp(bsp, cubeArray) {
            let material = new THREE.MeshPhongMaterial({ color: 0x9cb2d1, specular: 0x9cb2d1, shininess: 30, transparent: true, opacity: 1 });
            let BSP = new ThreeBSP(bsp);
            cubeArray.forEach((item, index) => {
                let bsp = new ThreeBSP(item);
                BSP = BSP.subtract(bsp);
            })
            let result = BSP.toMesh(material);
            result.material.flatshading = THREE.FlatShading;
            result.geometry.computeFaceNormals();  //重新计算几何体侧面法向量
            result.geometry.computeVertexNormals();
            result.material.needsUpdate = true;  //更新纹理
            result.geometry.buffersNeedUpdate = true;
            result.geometry.uvsNeedUpdate = true;
            return result;
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
            // this.createCenterWall();
            this.senceAddObj();

            // //加载标语
            // let loader = new THREE.FontLoader();
            // loader.load(`${this.publicPath}/fonts/ZH_CN.json`, function (font) {
            //     let material = new THREE.MeshBasicMaterial({ color: 0x000, opacity: 0.9, transparent: true })
            //     let geometry = new THREE.TextBufferGeometry('科技与创新服务', {
            //         font: font,
            //         size: 60,
            //         height: 5,
            //         bevelEnabled: false,
            //         bevelThickness: 10,
            //         bevelSegments: 3
            //     });
            //     let mesh = new THREE.Mesh(geometry, material);
            //     mesh.position.set(-100, 400, 300);
            //     mesh.rotateY(Math.PI / 2);
            //     that.scene.add(mesh);



            //     let geometry1 = new THREE.TextBufferGeometry('新材料与和环保产业', {
            //         font: font,
            //         size: 50,
            //         height: 5,
            //         bevelEnabled: false,
            //         bevelThickness: 10,
            //         bevelSegments: 3
            //     });
            //     let mesh1 = new THREE.Mesh(geometry1, material);
            //     mesh1.position.set(-50, 400, -2500);

            //     that.scene.add(mesh1);


            //     let geometry2 = new THREE.TextBufferGeometry('装备制造产业', {
            //         font: font,
            //         size: 50,
            //         height: 5,
            //         bevelEnabled: false,
            //         bevelThickness: 10,
            //         bevelSegments: 3
            //     });
            //     let mesh2 = new THREE.Mesh(geometry2, material);
            //     mesh2.position.set(1950, 400, -2400);
            //     mesh2.rotateY(-Math.PI / 2);
            //     that.scene.add(mesh2);

            // });




            let material1 = this.loadTexture(require("../assets/floor/墙3.png"));
            material1.transparent = true;
            let geometry1 = new THREE.PlaneBufferGeometry(3700, 500);
            let obj1 = new THREE.Mesh(geometry1, material1);
            obj1.position.set(-200, 250, -800);
            obj1.rotateY(Math.PI / 2);
            this.scene.add(obj1);


            let material2 = this.loadTexture(require("../assets/floor/墙4.png"));
            material2.transparent = true;
            let geometry2 = new THREE.PlaneBufferGeometry(2300, 500);
            let obj2 = new THREE.Mesh(geometry2, material2);
            obj2.position.set(950, 250, -2650);
            this.scene.add(obj2);




            let material3 = this.loadTexture(require("../assets/floor/墙5.png"));
            material3.transparent = true;
            let geometry3 = new THREE.PlaneBufferGeometry(3700, 500);
            let obj3 = new THREE.Mesh(geometry3, material3);
            obj3.position.set(2100, 250, -800);
            obj3.rotateY(-Math.PI / 2);
            this.scene.add(obj3);




            let material4 = this.loadTexture(require("../assets/floor/墙6.jpg"))
            let geometry4 = new THREE.PlaneBufferGeometry(2300, 500);
            let obj4 = new THREE.Mesh(geometry4, material4);
            obj4.position.set(950, 250, 1050);
            obj4.rotateY(-Math.PI);
            this.scene.add(obj4);






        },
        /** 添加模型到场景中 */
        senceAddObj() {
            let that = this;

            //加载交互台
            let gltfLoader = new GLTFLoader();
            gltfLoader.load(`${that.publicPath}/model/jiaohutai/jiaohutai.gltf`, (object) => {
                object.scene.position.z = -500;
                object.scene.position.x = -100;
                object.scene.position.y = 100;
                object.scene.rotateY(-Math.PI / 2);
                object.scene.scale.set(0.2, 0.2, 0.2);
                // object.rotation.z = Math.PI;
                that.scene.add(object.scene);

                let obj2 = object.scene.clone();
                obj2.position.z = -1700;
                obj2.position.x = -100;
                obj2.position.y = 100;
                that.scene.add(obj2);
            })



            //加载植物
            let gltfLoader1 = new GLTFLoader();
            gltfLoader1.load(`${that.publicPath}/model/zhiwu/zhiwu.gltf`, (object) => {
                object.scene.position.z = -400;
                object.scene.position.x = -100;
                object.scene.position.y = 130;
                object.scene.scale.set(0.1, 0.13, 0.1);
                that.scene.add(object.scene);

                let obj = object.scene.clone();
                obj.position.z = -1800;
                obj.position.x = -100;
                obj.position.y = 130;
                that.scene.add(obj);

                // let obj2 = object.scene.clone();
                // obj2.position.z = -1800;
                // obj2.position.x = 2000;
                // obj2.position.y = 130;
                // that.scene.add(obj2);

                // let obj3 = object.scene.clone();
                // obj3.position.z = -400;
                // obj3.position.x = 2000;
                // obj3.position.y = 130;
                // that.scene.add(obj3);
            })


            //加载交互台2
            let mtlLoader5 = new MTLLoader();
            mtlLoader5.load(
                `${that.publicPath}/model/jiaohutai2(2)/jiaohutai2.mtl`,
                function (materials) {
                    let objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        `${that.publicPath}/model/jiaohutai2(2)/jiaohutai2.obj`,
                        function (object) {
                            object.position.x = 950;
                            object.position.z = -2500;
                            object.rotateY(Math.PI / 2);
                            object.position.y = 35;
                            object.scale.set(0.1, 0.1, 0.1);

                            // object.rotation.z = Math.PI;
                            that.scene.add(object);

                            let obj2 = object.clone();
                            obj2.position.x = 650;
                            that.scene.add(obj2);

                            let obj3 = object.clone();
                            obj3.position.x = 1250;
                            that.scene.add(obj3);



                        }
                    );
                }
            );


            //加载火箭
            // let mtlLoader6 = new MTLLoader();
            // mtlLoader6.load(
            //     `${that.publicPath}/model/huojian/huojian.mtl`,
            //     function (materials) {
            //         let objLoader = new OBJLoader();
            //         objLoader.setMaterials(materials);
            //         objLoader.load(
            //             `${that.publicPath}/model/huojian/huojian.obj`,
            //             function (object) {
            //                 console.log(object)
            //                 object.position.z = -500;
            //                 object.position.x = 2000;
            //                 object.position.y = 220;
            //                 object.scale.set(10, 10, 10);
            //                 // object.rotation.z = Math.PI;
            //                 that.scene.add(object);

            //                 let obj = object.clone();
            //                 obj.position.z = -1700;
            //                 that.scene.add(obj);

            //             }
            //         );
            //     }
            // );

            // let gltfLoader10 = new GLTFLoader();
            // gltfLoader10.load(`${that.publicPath}/model/dianshiqiang2/dianshiqiang2.gltf`, (object) => {
            //     object.scene.position.z = -1125;
            //     object.scene.position.x = -185;
            //     object.scene.position.y = 160;
            //     object.scene.scale.set(0.1, 0.1, 0.1);
            //     object.scene.rotateY(Math.PI / 2);
            //     that.scene.add(object.scene);


            //     let obj = object.scene.clone();
            //     let a = THREE.ImageUtils.loadTexture(`${that.publicPath}/model/dianshiqiang2/贴图.jpg`);
            //     console.log(obj);
            //     obj.children[7].material.map = a;
            //     obj.position.set(2085, 160, -1125);
            //     obj.rotateY(-Math.PI);
            //     that.scene.add(obj);
            // })



            // let gltfLoader11 = new GLTFLoader();
            // gltfLoader11.load(`${that.publicPath}/model/dianshiqiang2/dianshiqiang22.gltf`, (object) => {
            //     object.scene.position.set(2085, 160, -1125);
            //     object.scene.scale.set(0.1, 0.1, 0.1);

            //     object.scene.rotateY(-Math.PI / 2);
            //     that.scene.add(object.scene);
            // })


            // 加载电视墙
            let mtlLoader10 = new MTLLoader();
            mtlLoader10.load(
                `${that.publicPath}/model/dianshiqiang2/dianshiqiang2.mtl`,
                function (materials) {
                    let objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        `${that.publicPath}/model/dianshiqiang2/dianshiqiang2.obj`,
                        function (object) {
                            object.position.z = -1100;
                            object.position.x = -185;
                            object.position.y = 160;
                            object.rotateY(Math.PI / 2);

                            object.scale.set(0.1, 0.1, 0.1);
                            // object.rotation.z = Math.PI;
                            that.scene.add(object);


                        }
                    );
                }
            );



            let mtlLoader11 = new MTLLoader();
            mtlLoader11.load(
                `${that.publicPath}/model/dianshiqiang2/dianshiqiang3.mtl`,
                function (materials) {
                    let objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        `${that.publicPath}/model/dianshiqiang2/dianshiqiang2.obj`,
                        function (object) {
                            object.position.set(2085, 160, -1100);
                            object.scale.set(0.1, 0.1, 0.1);

                            object.rotateY(-Math.PI / 2);
                            that.scene.add(object);
                        }
                    );
                }
            );


            // let gltfLoader12 = new GLTFLoader();
            // gltfLoader12.load(`${that.publicPath}/model/dianshiqaing3/dianshiqaing3.gltf`, (object) => {
            //     object.scene.scale.set(0.1, 0.1, 0.1);
            //     object.scene.position.set(950, 160, 200);
            //     // object.rotateY(Math.PI / 2);
            //     that.scene.add(object.scene);
            // })





            //加载中间模型
            let mtlLoader14 = new MTLLoader();
            mtlLoader14.load(
                `${that.publicPath}/model/dianshiqiang3/dianshiqiang3.mtl`,
                function (materials) {
                    let objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        `${that.publicPath}/model/dianshiqiang3/dianshiqiang3.obj`,
                        function (object) {
                            object.scale.set(0.1, 0.1, 0.1);
                            object.position.set(950, 160, 200);
                            // object.rotateY(Math.PI / 2);
                            that.scene.add(object);

                            // let obj = object.clone();
                            // obj.position.set(2080, 160, -1125);
                            // obj.rotateY(-Math.PI / 2);

                            // that.scene.add(obj);

                        }
                    );
                }
            );


            // //加载大圆柱
            // let mtlLoader1 = new MTLLoader();
            // mtlLoader1.load(
            //     `${that.publicPath}/model/zhongyangyuanzhu/zhongyangyuanzhu.mtl`,
            //     function (materials) {
            //         let objLoader = new OBJLoader();
            //         objLoader.setMaterials(materials);
            //         objLoader.load(
            //             `${that.publicPath}/model/zhongyangyuanzhu/zhongyangyuanzhu.obj`,
            //             function (object) {
            //                 object.position.z = -500;
            //                 object.position.x = 950;
            //                 object.position.y = 230;
            //                 object.scale.set(0.15, 0.1, 0.15);
            //                 // object.rotation.z = Math.PI;
            //                 that.scene.add(object);
            //                 let obj2 = object.clone();
            //                 object.position.z = -1600;
            //                 that.scene.add(obj2);
            //             }
            //         );
            //     }
            // );

            //加载植物
            let gltfLoader11 = new GLTFLoader();
            gltfLoader11.load(`${that.publicPath}/model/zhongyangyuanzhu/zhongyangyuanzhu.gltf`, (object) => {
                object.scene.position.z = -500;
                object.scene.position.x = 950;
                object.scene.position.y = 230;
                object.scene.scale.set(0.15, 0.1, 0.15);
                // object.rotation.z = Math.PI;
                that.scene.add(object.scene);
                let obj2 = object.scene.clone();
                obj2.position.z = -1600;
                that.scene.add(obj2);
            })

            //加载地球仪
            let mtlLoader12 = new MTLLoader();
            mtlLoader12.load(
                `${that.publicPath}/model/diqiuyi(1)/diqiuyi.mtl`,
                function (materials) {
                    let objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        `${that.publicPath}/model/diqiuyi(1)/diqiuyi.obj`,
                        function (object) {
                            object.position.z = -1050;
                            object.position.x = 950;
                            object.position.y = 180;
                            object.scale.set(0.15, 0.15, 0.15);
                            that.scene.add(object);
                        }
                    );
                }
            );

            that.percent += 20;
        },
        /** 加载模型 */
        initSmall(mtl, obj) {
            let that = this;
            //加载
            this.containerSmall = document.getElementById("containerSmall");
            console.log(this.containerSmall);
            // 加载场景
            this.sceneSmall = new THREE.Scene();
            this.sceneSmall.background = new THREE.Color(0xffffff);
            //加载相机
            this.cameraSmall = new THREE.PerspectiveCamera(
                90,
                window.innerWidth / window.innerHeight,
                0.1,
                10000
            );
            this.cameraSmall.position.set(0, 100, 100);
            this.cameraSmall.lookAt(1, 1, 1);
            //渲染器
            this.rendererSmall = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });
            this.rendererSmall.setSize(
                this.containerSmall.clientWidth,
                this.containerSmall.clientHeight
            );
            this.rendererSmall.setClearColor(0x000000, 1);
            this.containerSmall.appendChild(this.rendererSmall.domElement);
            //灯光
            let ambientLight = new THREE.AmbientLight(0xffffff, 1);
            this.sceneSmall.add(ambientLight);
            // 平行光
            let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 0.75, 0.5).normalize();
            this.sceneSmall.add(directionalLight);
            //控制器
            this.controlsSmall = new THREE.OrbitControls(
                this.cameraSmall,
                this.rendererSmall.domElement
            ); //创建控件对象
            this.controlsSmall.maxZoom = 0.8;
            this.controlsSmall.enableZoom = false;
            // //设置辅助坐标
            // let grid = new THREE.GridHelper(800, 160, 0xFF0000, 0x000000);
            // grid.material.opacity = 0.1;
            // grid.material.transparent = true;
            // this.sceneSmall.add(grid);
            // let axesHelper = new THREE.AxesHelper(30);
            // this.sceneSmall.add(axesHelper);
            this.sceneSmall.background = "#000";
            //添加地面
            let floorGeometry = new THREE.BoxGeometry(
                this.LENGTH,
                this.WIDTH,
                1
            );
            // let floorMaterial = new THREE.MeshBasicMaterial({ color: 0x08441f });
            let floorMaterial = new THREE.MeshBasicMaterial({
                color: 0x000e2e
            });
            let floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.position.y = -0.5;
            floor.rotation.x = Math.PI / 2;
            floor.name = "地面";
            this.sceneSmall.add(floor);
            //加载模型
            console.log(mtl, obj);
            let mtlLoader = new MTLLoader();
            mtlLoader.load(mtl, function (materials1) {
                let objLoader = new OBJLoader();
                objLoader.setMaterials(materials1);
                objLoader.load(obj, function (obj) {
                    obj.position.z = 0;
                    obj.position.x = 0;
                    obj.rotation.x = -0.5 * Math.PI;
                    // obj.scale.set(0.1, 0.1, 0.1);

                    that.sceneSmall.add(obj);
                });
            });

            this.animateSmall();
        },
        /**帧率插件更新 */
        update() {
            this.stats.update();
            TWEEN.update();

            // this.testRotation();
        },
        /** 动画函数 */
        animate() {
            if (!this.renderer.autoClear) this.renderer.clear()
            requestAnimationFrame(this.animate);

            //.getDelta()方法获得两帧的时间间隔
            var T = clock.getDelta();
            timeS = timeS + T;
            // requestAnimationFrame默认调用render函数60次，通过时间判断，降低renderer.render执行频率
            // if (timeS > renderT) {
            // 控制台查看渲染器渲染方法的调用周期，也就是间隔时间是多少
            this.renderer.render(this.scene, this.camera);
            //renderer.render每执行一次，timeS置0
            timeS = 0;

            this.update();
            // this.composer.render();//后期
            lat = Math.max(- 85, Math.min(85, lat));
            phi = THREE.MathUtils.degToRad(90 - lat);
            theta = THREE.MathUtils.degToRad(lon);
            if (this.camera.target) {
                //if(!this.ifOverlook){
                this.camera.target.x = 5000 * Math.sin(phi) * Math.cos(theta);
                this.camera.target.y = 5000 * Math.cos(phi);
                this.camera.target.z = 5000 * Math.sin(phi) * Math.sin(theta);
                //}
                // console.log(this.camera.target)
                this.camera.lookAt(this.camera.target);
            }
            if (this.front || this.back || this.left || this.right) {
                let vect = this.camera.getWorldDirection(new THREE.Vector3());//获取当前视角方向
                let xfb = vect.dot(new THREE.Vector3(30, 0, 0)) * 0.2
                let zfb = vect.dot(new THREE.Vector3(0, 0, 30)) * 0.2
                let vect2 = this.camera.getWorldDirection(new THREE.Vector3())
                vect2 = vect2.cross(new THREE.Vector3(0, 2, 0));
                let x = this.camera.position.x
                let z = this.camera.position.z
                let xlr = vect2.dot(new THREE.Vector3(15, 0, 0)) * 0.2
                let zlr = vect2.dot(new THREE.Vector3(0, 0, 15)) * 0.2
                let xf = 0
                let zf = 0
                if (this.front) {
                    xf = xfb
                    zf = zfb
                }
                if (this.back) {
                    xf = -xfb
                    zf = -zfb
                }
                if (this.left) {
                    xf = -xlr
                    zf = -zlr
                }
                if (this.right) {
                    xf = xlr
                    zf = zlr
                }
                //沿x轴增加
                let ifBreak = false
                if (xf > 0) {
                    if (x > 4390) ifBreak = true
                    else if ((x > 1850 && x < 1900) && ((z > 4390 && z < -2440) || (z > -1990 && z < -250) || (z > 200))) ifBreak = true
                    else if ((x > 450 && x < 500) && (z > -4260 && z < -2440)) ifBreak = true
                    else if ((x > -2650 && x < -2600) && (z > -1990 && z < -250)) ifBreak = true
                    if (ifBreak) {
                        ifBreak = false
                        new TWEEN.Tween(this.camera.position).to({
                            x: x - 20,
                            y: cameraDefaults.y,
                            z: z
                        }, 500).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
                        }).start();
                        return
                    }
                }
                //沿x轴减少
                if (xf < 0) {
                    if (x < -3290) ifBreak = true
                    else if ((x > 0 && x < 50) && ((z > -4950 && z < -2440) || (z > -1990 && z < -250) || (z > 200))) ifBreak = true
                    else if ((x > 1400 && x < 1450) && (z > -4260 && z < -2440)) ifBreak = true
                    else if ((x > 3700 && x < 3750) && (z > -1990 && z < -250)) ifBreak = true
                    if (ifBreak) {
                        ifBreak = false
                        new TWEEN.Tween(this.camera.position).to({
                            x: x + 20,
                            y: cameraDefaults.y,
                            z: z
                        }, 500).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
                        }).start();
                        return
                    }
                }
                //沿z轴增加
                if (zf > 0) {
                    if (z > 1000) ifBreak = true
                    else if ((z > 200 && z < 250) && (x < 10 || x > 1900)) ifBreak = true
                    else if ((z > -2000 && z < -1950) && ((x > -2610 && x < 10) || (x > 1900 && x < 3710))) ifBreak = true
                    else if ((z > -4300 && z < -4250) && (x > 490 && x < 1410)) ifBreak = true
                    if (ifBreak) {
                        ifBreak = false
                        new TWEEN.Tween(this.camera.position).to({
                            x: x,
                            y: cameraDefaults.y,
                            z: z - 20
                        }, 500).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
                        }).start();
                        return
                    }
                }
                //沿z轴减少
                if (zf < 0) {
                    if (z < -4940) ifBreak = true
                    else if ((z > -2450 && z < -2400) && ((x > -2610 && x < 10) || (x > 490 && x < 1410) || (x > 1900 && x < 3710))) ifBreak = true
                    else if ((z > -250 && z < -200) && ((x > -2610 && x < 10) || (x > 1900 && x < 3710))) ifBreak = true
                    if (ifBreak) {
                        ifBreak = false
                        new TWEEN.Tween(this.camera.position).to({
                            x: x,
                            y: cameraDefaults.y,
                            z: z + 20
                        }, 500).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
                        }).start();
                        return
                    }
                }
                //前进
                if (this.front) {
                    this.camera.position.z += zfb;//沿z轴分解
                    this.camera.position.x += xfb;//沿x轴分解
                }
                //后退
                if (this.back) {
                    this.camera.position.z -= zfb;
                    this.camera.position.x -= xfb;
                }
                //向左
                if (this.left) {
                    this.camera.position.z -= zlr;
                    this.camera.position.x -= xlr;
                }
                //向右
                if (this.right) {
                    this.camera.position.z += zlr;
                    this.camera.position.x += xlr;
                }
                // }

            }


        },
        /**小场景动画函数 */
        animateSmall() {
            this.IdSmall = requestAnimationFrame(this.animateSmall);
            this.rendererSmall.render(this.sceneSmall, this.cameraSmall);
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

        //工具栏按钮事件
        handleButtonClick(b) {
            b.active = !b.active
            switch (b.label) {
                case '播放':
                    b.class = b.active ? b.class2 : b.class1;
                    break;
                case '视角':
                    break;
                case '地图':
                    this.hideMap = !this.hideMap
                    break;
                case '音乐':
                    b.class = b.active ? b.class2 : b.class1;
                    this.bf();
                    break;
                case '全屏':
                    b.class = b.active ? b.class2 : b.class1;

                    b.active ? this.fullscreen() : this.exitFullscreen();

                    // this.onResize();
                    break;
            }
        },

        handleButtonClick2(b) {
            this.buttons[1].active = false
            for (let b2 of this.buttons2) {
                b2.active = false
            }
            b.active = !b.active
            switch (b.label) {
                case '三维':
                    this.camera.target = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
                    new TWEEN.Tween(this.camera.position).to({
                        y: 2000
                    }, 2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
                    }).start();
                    break;
                case '鸟瞰':
                    isOverlook = true
                    lat = -66.6
                    lon = -59.7
                    new TWEEN.Tween(this.camera.position).to({
                        x: 1000,
                        y: 4000,
                        z: -1500
                    }, 2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {

                    }).start();
                    break;
                case '漫游':
                    lat = 0
                    lon = -90
                    new TWEEN.Tween(this.camera.position).to({
                        y: cameraDefaults.y
                    }, 2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
                    }).start();
                    break;
            }
        },
        onDocumentMouseMove(event) {
            event.preventDefault();
            let clientX = event.clientX || event.touches[0].clientX;
            let clientY = event.clientY || event.touches[0].clientY;
            isMouseMove = true;
            if (isMousePress == false) {
                mouse.set((clientX / window.innerWidth) * 2 - 1, - (clientY / window.innerHeight) * 2 + 1);
                raycaster.setFromCamera(mouse, this.camera);
                var intersects = raycaster.intersectObjects([].concat(floors, walls));
                if (intersects.length > 0) {
                    var intersect = intersects[0];
                    //console.log('x:' + intersect.point.x + ' y:' + intersect.point.y + ' z:' + intersect.point.z)
                    if (!intersect.face) return
                    var voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
                    voxel.position.copy(intersect.point).add(intersect.face.normal);
                    rollOverMesh.position.x = voxel.position.x;
                    rollOverMesh.position.z = voxel.position.z;
                }
            } else {
                lon = (onMouseDownMouseX - clientX) * 0.1 + onMouseDownLon;
                lat = (clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
                mouse.x = (clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(clientY / window.innerHeight) * 2 + 1;
            }
        },
        onDocumentMouseDown(event) {
            event.preventDefault();
            touchTime = new Date().getTime()
            isMouseMove = false;
            isMousePress = true;
            let clientX = event.clientX || event.touches[0].clientX;
            let clientY = event.clientY || event.touches[0].clientY;

            onMouseDownMouseX = clientX;
            onMouseDownMouseY = clientY;
            onMouseDownLon = lon;
            onMouseDownLat = lat;
        },
        onDocumentMouseUp(event) {
            let endTime = new Date().getTime()
            touchTime = endTime - touchTime
            if (isControlPress) {
                isControlPress = false
                this.left = false;
                this.right = false;
                this.back = false;
                this.front = false;
                return
            }
            isMousePress = false;
            if (touchTime > 200) {
                isMouseMove = false;
                return;
            }
            let clientX = event.clientX || (event.touches[0] && event.touches[0].clientX) || (event.changedTouches[0] && event.changedTouches[0].clientX);
            let clientY = event.clientY || (event.touches[0] && event.touches[0].clientY) || (event.changedTouches[0] && event.changedTouches[0].clientY);
            event.preventDefault();

            mouse.set((clientX / window.innerWidth) * 2 - 1, - (clientY / window.innerHeight) * 2 + 1);
            this.dowithIntersects()
        },


        //方向盘控制相关方法
        getDirection(event) {
            //return
            if (!isControlPress) return
            let f = ''
            let clientX = event.clientX || event.touches[0].clientX;
            let clientY = event.clientY || event.touches[0].clientY;
            event.preventDefault();
            let x = clientX - 50
            let y = this.container.clientHeight - clientY - 50
            let c = Math.atan2(y, x) / 0.017453292
            if (c <= 30) f = 'd'
            if (c > 30 && c < 60) f = 'dw'
            if (c >= 60 && c <= 120) f = 'w'
            if (c > 120 && c < 150) f = 'wa'
            if (Math.abs(c) >= 150) f = 'a'
            if (c > -150 && c < -120) f = 'as'
            if (c >= -120 && c <= -60) f = 's'
            if (c > -60 && c < -30) f = 'sd'
            switch (f) {
                case 'a':
                    this.left = true;
                    this.right = false;
                    this.back = false;
                    this.front = false;
                    break;
                case 'as':
                    this.left = true;
                    this.right = false;
                    this.back = true;
                    this.front = false;
                    break;
                case 'd':
                    this.right = true;
                    this.left = false;
                    this.back = false;
                    this.front = false;
                    break;
                case 'dw':
                    this.right = true;
                    this.left = false;
                    this.back = false;
                    this.front = true;
                    break;
                case 's':
                    this.back = true;
                    this.left = false;
                    this.right = false;
                    this.front = false;
                    break;
                case 'sd':
                    this.back = true;
                    this.left = false;
                    this.right = true;
                    this.front = false;
                    break;
                case 'w':
                    this.front = true;
                    this.left = false;
                    this.right = false;
                    this.back = false;
                    break;
                case 'wa':
                    this.front = true;
                    this.left = true;
                    this.right = false;
                    this.back = false;
                    break;
            }
        },
        onControlDown(event) {
            isControlPress = true
            //let f = this.getDirection(event)
        },
        onControlMove(event) {
            let f = this.getDirection(event)
        },
        onControlUp(event) {
            isControlPress = false
            this.left = false;
            this.right = false;
            this.back = false;
            this.front = false;
        },



        dowithIntersects(event) {
            raycaster.setFromCamera(mouse, this.camera);
            var intersects = raycaster.intersectObjects([].concat(floors, walls));
            if (intersects.length > 0) {
                var intersect = intersects[0].object ? intersects[0].object : intersects[0];
                intersect = intersects[0]
                if (intersect.object.name && intersect.object.name.indexOf("地板") != -1) {
                    if (isOverlook) {
                        isOverlook = false
                        lon = -90
                        lat = 0
                    }

                    var voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
                    voxel.position.copy(intersect.point).add(intersect.face.normal);
                    voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                    new TWEEN.Tween(this.camera.position).to({
                        x: voxel.position.x,
                        y: cameraDefaults.y,
                        z: voxel.position.z
                    }, 2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
                    }).start();
                    //切换场馆更换音频
                    if (intersect.object.name == this.floorName) {
                        return;
                    }
                    else {
                        this.floorName = intersect.object.name;
                        let audio = this.$refs.audio;
                        // this.audioUrl = require(`../assets/mp3/${intersect.object.name.substr(
                        //     2,
                        //     intersect.object.name.length - 1
                        // )}.mp3`);

                        that.audioUrl = `http://119.3.66.94:8090/LOCALFILE/mp3/${i + 1}.mp3`;

                        audio.load();
                        audio.play();
                    }
                } else {
                    this.addSelectedObject(intersect.object)
                }
            }
        },
        getPercent() {
            // let interval = setInterval(() => {
            //     this.percent += 5;
            //     if (this.percent >= 100) {
            //         this.percent = 100;
            //         clearInterval(interval);
            //     }
            // }, 200);
        },
        /**创建三个场馆 */
        async createRooms() {
            let sprites = [];
            let arr1 = await this.createRoom1();
            let arr2 = await this.createRoom2();
            let arr3 = await this.createRoom3();
            for (let a of [].concat(arr1, arr2, arr3)) {
                if (!a.hotDots) continue;
                for (let d of a.hotDots) {
                    let sprite = Sprite.clone();
                    sprite.scale.set(origin, origin, origin);
                    sprite.name = d.name;
                    sprite.position.set(d.x, d.y, d.z);
                    dots.push({
                        name: d.name,
                        url: d.url,
                        type: d.type,
                        mtl: d.mtl ? d.mtl : "",
                        obj: d.obj ? d.obj : "",

                    })
                    sprites.push(sprite);
                    walls.push(sprite);
                    this.scene.add(sprite);
                }
            }
            let s = 0;
            // setInterval(() => {
            //     s > origin - 10 ? s = 0 : s++
            //     for (let d of sprites) {
            //         d.scale.set(origin - s, origin - s, origin - s)
            //     }
            // }, 100)
        },
        /**加载场馆一配置文件 */
        createRoom1() {
            return new Promise((resolve) => {
                this.$axios.get("/firstVenue.json").then(res => {
                    this.firstVenue = res.data.firstVenue;
                    this.createFirstVenue(res.data.firstVenue);
                    resolve(this.firstVenue);
                    // this.$store.commit("addPercent", 0.25);
                    this.percent += 20;
                })
            })
        },
        /**加载场馆二配置文件 */
        createRoom2() {
            return new Promise((resolve) => {
                this.$axios.get("/secondVenue.json").then(res => {
                    this.secondVenue = res.data.secondVenue;
                    this.createSecondVenue(res.data.secondVenue);
                    resolve(this.secondVenue);
                    this.percent += 20;

                    // this.$store.commit("addPercent", 0.25);

                })
            })
        },
        /**加载场馆三配置文件 */
        createRoom3() {
            return new Promise((resolve) => {
                this.$axios.get("/thridVenue.json").then(res => {
                    this.thridVenue = res.data.thridVenue;
                    this.createThridVenue(res.data.thridVenue);
                    resolve(this.thridVenue);
                    this.percent += 20;

                })
            })
        },
        /**创建中间的墙 */
        createCenterWall() {
            let material = new THREE.MeshBasicMaterial({ color: 0xafc0ca });
            this.createCubeWall(400, 300, 5, 0, material, 950, 150, 0, "墙面1");
            this.createCubeWall(400, 300, 5, 1 / 6, material, -100 * Math.sqrt(3) - 200 + 950, 150, 100, "墙面1");
            this.createCubeWall(400, 300, 5, -1 / 6, material, +100 * Math.sqrt(3) + 200 + 950, 150, 100, "墙面1");

            // 加边框
            this.createCubeWall(400, 5, 5, 0, material, 950, 2.5, 5, "墙面1");
            this.createCubeWall(400, 5, 5, 0, material, 950, 300 - 2.5, 5, "墙面1");
            //边框
            this.createCubeWall(400, 5, 5, 1 / 6, material, -100 * Math.sqrt(3) - 200 + 950, 2.5, 100 + 5, "墙面1");
            this.createCubeWall(400, 5, 5, 1 / 6, material, -100 * Math.sqrt(3) - 200 + 950, 300 - 2.5, 100 + 5, "墙面1");
            this.createCubeWall(5, 300, 5, 0, material, -200 * Math.sqrt(3) - 200 + 950, 150, 200 + 5, "墙面1");

            //边框
            this.createCubeWall(400, 5, 5, -1 / 6, material, +100 * Math.sqrt(3) + 200 + 950, 2.5, 100 + 5, "墙面1");
            this.createCubeWall(400, 5, 5, -1 / 6, material, +100 * Math.sqrt(3) + 200 + 950, 300 - 2.5, 100 + 5, "墙面1");
            this.createCubeWall(5, 300, 5, 0, material, +200 * Math.sqrt(3) + 200 + 950, 150, 200 + 5, "墙面1");

        },
        /** 重新设置屏幕尺寸*/
        onResize(e) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        },
        /**进入全屏 */
        fullscreen() {
            let canvas = document.body;
            if (canvas.requestFullscreen) {
                canvas.requestFullscreen();
            } else if (canvas.mozRequestFullScreen) {
                canvas.mozRequestFullScreen();
            } else if (canvas.webkitRequestFullscreen) {
                canvas.webkitRequestFullscreen();
            } else if (canvas.msRequestFullscreen) {
                canvas.msRequestFullscreen();
            }
        },
        /**退出全屏 */
        exitFullscreen() {
            let canvas = document;
            if (canvas.exitFullscreen) {
                canvas.exitFullscreen();
            } else if (canvas.mozCancelFullScreen) {
                canvas.mozCancelFullScreen();
            } else if (canvas.webkitExitFullscreen) {
                canvas.webkitExitFullscreen();
            }
        },
        onFullscreenChange() {
            alert(window.innerWidth + "," + window.innerHeight);
            let rendererSize = this.renderer.getSize();
            this.renderer.setPixelRatio(this.renderer.getPixelRatio());
            this.renderer.setSize(rendererSize.width, rendererSize.height);
        },

    },
    beforeCreate() {
    },
    mounted() {
        let that = this;
        //加载两种墙面，保存到this中
        cubeGeometryL = new THREE.BoxBufferGeometry(700, 350, 5);
        cubeGeometryW = new THREE.BoxBufferGeometry(500, 350, 5);
        //创建太空和地板保存起来
        this.createSkyAndFloor();
        this.init();
        this.animate();
        //加载两种拱门
        this.createArchSingle();
        // document.addEventListener("fullscreenchange", this.onFullscreenChange, false);
        // document.addEventListener("mozfullscreenchange", this.onFullscreenChange, false);
        // document.addEventListener("webkitfullscreenchange", this.onFullscreenChange, false);


    },
    created() {
        //获取小地图坐标
        this.$axios.get("/point.json").then(res => {
            this.points = res.data.points;

        });
        this.createRooms();
        //获取拱门坐标
        this.$axios.get("/arch.json").then(res => {
            this.createArch(res.data.archs);
        });
        //加载场景区间
        this.$axios.get("/venueArea.json").then(res => {
            this.judgeArea(res.data.venueArea);
        })



    },
    destroyed() { },

};


</script>
<style lang="scss">
@import "../scss/index.scss";
</style>
