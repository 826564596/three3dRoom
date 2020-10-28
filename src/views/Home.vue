<template>
    <div class="div">
        <!-- 3D场景 -->
        <div id="container" @touchend="mobileClick($event)" @click="click($event)" @dblclick="doubleClick($event)" @mousemove.prevent="move($event)" @mousedown.prevent="down($event)" @mouseup.prevent="up($event)">
        </div>
        <!-- <video id="video" autoplay loop muted>
            <source src="./video/videoPlane.mp4">
        </video> -->
        <!-- 弹窗 -->
        <el-dialog destroy-on-close :visible.sync="dialogTableVisible" @close="closeDialog">
            <div v-if="choseItem[0].type == 'picture'" class="picture">
                <el-image style="width:80%;height:100%" fit="scale-down" :src="choseItem[0].url"></el-image>
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
    </div>
</template>

<script>
import * as THREE from "three";
import { OBJLoader, MTLLoader } from "three-obj-mtl-loader";
import OrbitControls from "three/examples/js/controls/OrbitControls";
import VRControls from "../plugins/VRControls";
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

var plane;
var mouse,
    raycaster,
    isShiftDown = false;
var objects = [];
var cubeGeo, cubeMaterial;
var rollOverMesh, rollOverMaterial;
var isUserInteracting = false,
    onMouseDownMouseX = 0,
    onMouseDownMouseY = 0,
    lon = -90,
    onMouseDownLon = 0,
    lat = 0,
    onMouseDownLat = 0,
    phi = 0,
    theta = 0;

var cameraDefaults = {
    posCamera: new THREE.Vector3(0.0, 120.0, 160.0),
    posCameraTarget: new THREE.Vector3(0, 120, 1200),
    near: 0.1,
    far: 10000,
    fov: 45
};

var isMousePress = false;
var isMouseMove = false;

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

            cubeGeo = new THREE.BoxBufferGeometry(50, 50, 50);
            cubeMaterial = new THREE.MeshLambertMaterial({
                color: 0xfeb74c,
                map: new THREE.TextureLoader().load("../assets/image/mouse.png")
            });

            var rollOverGeo = new THREE.RingBufferGeometry(4, 7, 32); //new THREE.BoxBufferGeometry( 10, 1, 10 );
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
            // document.addEventListener('mousemove', this.onDocumentMouseMove, false);
            // document.addEventListener('mousedown', this.onDocumentMouseDown, false);
            // document.addEventListener('mouseup', this.onDocumentMouseUp, false);

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
            this.camera = new THREE.PerspectiveCamera(
                45,
                window.innerWidth / window.innerHeight,
                1,
                10000
            );
            this.camera.position.copy(cameraDefaults.posCamera);
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

            // this.controls = new THREE.VRControls();
            // this.controls.standing = true;
            // var effect = new THREE.VREffect(this.renderer);
            // effect.setSize(window.innerWidth, window.innerHeight);
            // //按钮和全屏模式管理
            // var params = {
            //     hideButton: false, // Default: false.
            //     isUndistorted: false // Default: false.
            // };
            // var manager = new WebVRManager(this.renderer, effect, params);

            this.controls = new THREE.OrbitControls(
                this.camera,
                this.renderer.domElement
            ); //创建控件对象
            this.controls.maxZoom = 0.8;

            // this.controls = new THREE.FirstPersonControls(
            //     this.camera,
            //     this.renderer.domElement
            // )

            // this.controls.autoForward = true;
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
            // let floorGeometry = new THREE.BoxGeometry(this.LENGTH, this.WIDTH, 1);
            // // let floorMaterial = new THREE.MeshBasicMaterial({ color: 0x08441f });
            // let floorMaterial = new THREE.MeshBasicMaterial({ color: 0x000E2E });
            // let floor = new THREE.Mesh(floorGeometry, floorMaterial);
            // floor.position.y = -0.5;
            // floor.rotation.x = Math.PI / 2;
            // floor.name = "地面";
            // this.scene.add(floor);

            // 地板大小，即为能走动的范围
            var geometry = new THREE.PlaneBufferGeometry(400, 400);
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

        /**创建中间的墙 */
        createCenterWall() {
            this.createCubeWall(400, 300, 15, 0, new THREE.MeshBasicMaterial({ color: 0xafc0ca }), 0, 150, 0, "墙面1");
            this.createCubeWall(400, 300, 15, 1 / 6, new THREE.MeshBasicMaterial({ color: 0xafc0ca }), -100 * Math.sqrt(3) - 200, 150, 100, "墙面1");
            this.createCubeWall(400, 300, 15, -1 / 6, new THREE.MeshBasicMaterial({ color: 0xafc0ca }), +100 * Math.sqrt(3) + 200, 150, 100, "墙面1");

            // 加边框
            this.createCubeWall(400, 5, 15, 0, new THREE.MeshBasicMaterial({ color: 0xaf10ca }), 0, 2.5, 5, "墙面1");
            this.createCubeWall(400, 5, 15, 0, new THREE.MeshBasicMaterial({ color: 0xaf10ca }), 0, 300 - 2.5, 5, "墙面1");
            //边框
            this.createCubeWall(400, 5, 15, 1 / 6, new THREE.MeshBasicMaterial({ color: 0xaf10ca }), -100 * Math.sqrt(3) - 200, 2.5, 100 + 5, "墙面1");
            this.createCubeWall(400, 5, 15, 1 / 6, new THREE.MeshBasicMaterial({ color: 0xaf10ca }), -100 * Math.sqrt(3) - 200, 300 - 2.5, 100 + 5, "墙面1");
            this.createCubeWall(5, 300, 15, 0, new THREE.MeshBasicMaterial({ color: 0xaf10ca }), -200 * Math.sqrt(3) - 200, 150, 200 + 5, "墙面1");

            //边框
            this.createCubeWall(400, 5, 15, -1 / 6, new THREE.MeshBasicMaterial({ color: 0xaf10ca }), +100 * Math.sqrt(3) + 200, 2.5, 100 + 5, "墙面1");
            this.createCubeWall(400, 5, 15, -1 / 6, new THREE.MeshBasicMaterial({ color: 0xaf10ca }), +100 * Math.sqrt(3) + 200, 300 - 2.5, 100 + 5, "墙面1");
            this.createCubeWall(5, 300, 15, 0, new THREE.MeshBasicMaterial({ color: 0xaf10ca }), +200 * Math.sqrt(3) + 200, 150, 200 + 5, "墙面1");


        },
        /**场景中的内容 */
        initContent() {
            let that = this;
            this.createFloor();
            this.createEnvironment();
            // this.createCenterWall();
            // this.createTable();
            // 加载平台




            //加载中间模型
            let mtlLoader1 = new MTLLoader();
            mtlLoader1.load(
                `${that.publicPath}/model/huojian/huojian.mtl`,
                function (materials) {
                    let objLoader = new OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        `${that.publicPath}/model/huojian/huojian.obj`,
                        function (object) {
                            console.log(object)
                            object.position.z = 0;
                            object.position.x = 0;
                            object.position.y = 220;
                            object.scale.set(10, 10, 10);
                            // object.rotation.z = Math.PI;
                            that.scene.add(object);
                        }
                    );
                }
            );


        },
        /** 添加obj到场景中 */
        addobj(obj, i) {
            // console.log(obj);
            obj.position.z = 0;
            obj.position.y = 150;

            obj.position.x = 0;
            // obj.rotation.x = -0.5 * Math.PI;
            // obj.scale.set(0.1, 0.1, 0.1);
            this.scene.add(obj);

            // obj.scale.set(0.1, 0.1, 0.1);
            // obj.position.z = i * 600;
            // obj.position.x = i * 600;
            // this.scene.add(obj);
        },
        /** 创建精灵图 */
        createTable() {
            for (let i = 0, len = this.location.length; i < len; i++) {
                let geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(
                        this.location[i].from.x,
                        this.location[i].from.y,
                        this.location[i].from.z
                    ),
                    new THREE.Vector3(
                        this.location[i].to.x,
                        this.location[i].to.y,
                        this.location[i].to.z
                    )
                );
                geometry.colors.push(
                    new THREE.Color(0x444444),
                    new THREE.Color(0xff0000)
                );
                let material = new THREE.LineBasicMaterial({
                    vertexColors: true
                });
                let line = new THREE.Line(geometry, material);

                this.scene.add(line);

                let spriteMap = new THREE.TextureLoader().load(
                    require("../assets/image/yuan1.gif")
                );
                let spriteMaterial = new THREE.SpriteMaterial({
                    transparent: true,
                    map: spriteMap,
                    side: THREE.DoubleSide
                });

                let sprite1 = new THREE.Sprite(spriteMaterial);
                // 轴1
                let origin = 8;
                sprite1.scale.set(origin, origin, origin);
                sprite1.name = this.location[i].name;
                sprite1.position.set(
                    this.location[i].from.x,
                    this.location[i].from.y,
                    this.location[i].from.z
                );
                this.scene.add(sprite1);
                let s = 0;
                setInterval(() => {
                    s > 6 ? (s = 0) : s++;
                    sprite1.scale.set(origin - s, origin - s, origin - s);
                }, 150);
            }
        },

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
            let mtlLoader = new MTLLoader();
            mtlLoader.load(mtl, function (materials1) {
                let objLoader = new OBJLoader();
                objLoader.setMaterials(materials1);
                objLoader.load(obj, function (obj) {
                    obj.position.z = 0;
                    obj.position.x = 0;
                    obj.rotation.x = -0.5 * Math.PI;
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
            if (!this.renderer.autoClear) this.renderer.clear();
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
            this.update();

            // this.composer.render();//后期

            lat = Math.max(-85, Math.min(85, lat));
            phi = THREE.MathUtils.degToRad(90 - lat);
            theta = THREE.MathUtils.degToRad(lon);
            if (this.camera.target) {
                // this.camera.target.x = 5000 * Math.sin(phi) * Math.cos(theta);
                // this.camera.target.y = 5000 * Math.cos(phi);
                // this.camera.target.z = 5000 * Math.sin(phi) * Math.sin(theta);

                // this.camera.lookAt(this.camera.target);
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

        /**创建一面墙 */
        createCubeWall(width, height, depth, angle, material, x, y, z, name) {
            let that = this;
            let cubeGeometry;
            if (width == 500) {
                cubeGeometry = this.cubeGeometryW.clone();
            }
            if (width == 700) {
                cubeGeometry = this.cubeGeometryL.clone();
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
        /**小场景动画函数 */
        animateSmall() {
            this.IdSmall = requestAnimationFrame(this.animateSmall);
            this.rendererSmall.render(this.sceneSmall, this.cameraSmall);
        },
        /** 鼠标单击事件 */
        click() {
            console.log("Mouse Click");
            let raycaster = new THREE.Raycaster();
            let mouse = new THREE.Vector2();
            // let outlinePass = this.definedComposer();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            let intersects = raycaster.intersectObjects([this.scene], true);
            //获取点击到场景的值
            if (intersects.length > 0) {
                console.log("Mouse Click get something");
                let selectedObject = intersects[0].object;
                console.log(selectedObject.name);
                // console.log(selectedObject);
                this.addSelectedObject(selectedObject);
                //给标签赋值
                // this.labelLeft = event.clientX;
                // this.labelTop = event.clientY;
                // this.$refs.label.innerText = intersects[0].object.name;
                // outlinePass.selectedObjects = [intersects[0].object];
            } else {
                // outlinePass.selectedObjects = [];
            }
        },
        /**手机点击事件 */
        mobileClick() {
            let raycaster = new THREE.Raycaster();
            let mouse = new THREE.Vector2();
            mouse.x =
                (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.y =
                -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            let intersects = raycaster.intersectObjects([this.scene], true);

            //获取点击到场景的值
            if (intersects.length > 0) {
                let selectedObject = intersects[0].object;
                this.addSelectedObject(selectedObject);
            } else {
                // outlinePass.selectedObjects = [];
            }
        },
        /** 拿到点击元素值,显示相应资源 */
        addSelectedObject(Object) {
            this.choseItem = this.location.filter(item => {
                return item.name === Object.name;
            });
            if (this.choseItem.length > 0) {
                this.dialogTableVisible = true;
            } else {
                this.choseItem = [
                    {
                        type: ""
                    }
                ];
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

        onDocumentMouseMove(event) {
            event.preventDefault();
            //console.log("Mouse Move")
            isMouseMove = true;
            if (isMousePress == false) {
                mouse.set(
                    (event.clientX / window.innerWidth) * 2 - 1,
                    -(event.clientY / window.innerHeight) * 2 + 1
                );
                raycaster.setFromCamera(mouse, this.camera);
                var intersects = raycaster.intersectObjects(objects);
                if (intersects.length > 0) {
                    var intersect = intersects[0];
                    var voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
                    voxel.position
                        .copy(intersect.point)
                        .add(intersect.face.normal);
                    rollOverMesh.position.x = voxel.position.x;
                    rollOverMesh.position.z = voxel.position.z;
                }
            } else {
                var clientX = event.clientX || event.touches[0].clientX;
                var clientY = event.clientY || event.touches[0].clientY;
                lon = (onMouseDownMouseX - clientX) * 0.1 + onMouseDownLon;
                lat = (clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            }
        },
        onDocumentMouseDown(event) {
            event.preventDefault();
            isMouseMove = false;
            isMousePress = true;
            var clientX = event.clientX || event.touches[0].clientX;
            var clientY = event.clientY || event.touches[0].clientY;
            onMouseDownMouseX = clientX;
            onMouseDownMouseY = clientY;
            onMouseDownLon = lon;
            onMouseDownLat = lat;
        },
        onDocumentMouseUp(event) {
            event.preventDefault();
            isMousePress = false;
            if (isMouseMove == true) {
                isMouseMove = false;
                return;
            }
            mouse.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            raycaster.setFromCamera(mouse, this.camera);
            var intersects = raycaster.intersectObjects(objects);
            if (intersects.length > 0) {
                console.log("Mouse Up get something");
                var intersect = intersects[0].object
                    ? intersects[0].object
                    : intersects[0];
                intersect = intersects[0];
                console.log(intersect.object.name);
                if (
                    intersect.object.name &&
                    intersect.object.name == "我是地板"
                ) {
                    var voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
                    voxel.position
                        .copy(intersect.point)
                        .add(intersect.face.normal);
                    voxel.position
                        .divideScalar(50)
                        .floor()
                        .multiplyScalar(50)
                        .addScalar(25);
                    console.log("voxel.position~~~~~~~~~~");
                    console.log(voxel.position);
                    new TWEEN.Tween(this.camera.position)
                        .to(
                            {
                                x: voxel.position.x,
                                z: voxel.position.z
                            },
                            2000
                        )
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(function () { })
                        .start();
                }
            }
        },

        closeDialog() {
            cancelAnimationFrame(this.IdSmall); // Stop the animation
            if (this.rendererSmall) this.rendererSmall.dispose();
            if (this.sceneSmall) this.sceneSmall = null; //清除场景
            if (this.controlsSmall) this.controlsSmall = null; //清除控制器
            if (this.cameraSmall) this.cameraSmall = null; //清除相机
            if (this.rendererSmall) this.rendererSmall = null; //清除渲染器
            if (this.containerSmall) this.containerSmall = null;
        },
        testanimate() {
            var lastRender = 0;
            var delta = Math.min(20 - lastRender, 500);
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
    created() {
        this.$axios.get("/location.json").then(res => {
            let config = res.data;
            this.location = config.locationArray;
            // this.createTable();
        });
    },

    mounted() {
        this.init();
        this.animate();
        this.helper();
        // let that = this;
        // this.container = document.getElementById("container");
        // this.renderer = new THREE.WebGLRenderer({
        //     antialias: true
        // });
        // this.renderer.setPixelRatio(window.devicePixelRatio);
        // this.container.appendChild(this.renderer.domElement);
        // this.scene = new THREE.Scene();
        // // this.scene.background = new THREE.Color(0xffffff);

        // this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        // this.camera.position.set(10, 10, 10);
        // this.controls = new THREE.VRControls(this.camera);
        // this.controls.standing = true;

        // this.effect = new THREE.VREffect(this.renderer);
        // this.effect.setSize(window.innerWidth, window.innerHeight);

        // var params = {
        //     hideButton: false, // Default: false.
        //     isUndistorted: false // Default: false.
        // };
        // this.manager = new WebVRManager(this.renderer, this.effect, params);


        // // Create 3D objects.
        // var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        // var material = new THREE.MeshNormalMaterial();
        // var cube = new THREE.Mesh(geometry, material);

        // // Position cube mesh to be right in front of you.
        // // cube.position.set(0, this.controls.userHeight, -1);
        // cube.position.set(0, 0, -1);


        // // Add cube mesh to your three.js scene
        // this.scene.add(cube);
        // this.helper();

        // let ambientLight = new THREE.AmbientLight(0xffffff, 1);
        // this.scene.add(ambientLight);
        // // 平行光
        // let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        // directionalLight.position.set(1, 0.75, 0.5).normalize();
        // this.scene.add(directionalLight);

        // this.testanimate();

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
