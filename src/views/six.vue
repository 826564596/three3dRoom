<!-- 多个器械 -->
<template>
    <div class="div">
        <!-- 3D场景 -->
        <div id="container" @click="click($event)" @dblclick="doubleClick($event)" @mousemove.prevent="move($event)" @mousedown.prevent="down($event)" @mouseup.prevent="up($event)">
        </div>
        <!-- 左侧 -->
        <div class="left-table">
            <!-- 第一行 -->
            <el-row>
                <el-col :span="18" :offset="6">
                    <div class=" left-table-content-new">
                        <el-row>
                            <el-col :span="11" :offset="1">
                                <div class="table-title ">
                                    当月产量排名
                                </div>
                            </el-col>
                            <el-col :span="9">
                                <div class="table-picture ">

                                </div>
                            </el-col>
                        </el-row>

                        <div class="right-table-content-new" id="echarts-bar">
                        </div>
                    </div>
                </el-col>
            </el-row>
            <!-- 第二行 -->
            <el-row>
                <el-col :span="18" :offset="6">
                    <div class=" left-table-content-new" style="height:300px;">
                        <el-row>
                            <el-col :span="8" :offset="1">
                                <div class="table-title ">
                                    运行情况
                                </div>
                            </el-col>
                            <el-col :span="9">
                                <div class="table-picture ">

                                </div>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="10" :offset="1">
                                <div class="  online">
                                    {{onlineNum}}
                                </div>
                            </el-col>
                            <el-col :span="10" :offset="1">
                                <div class=" outline">
                                    {{outlineNum}}
                                </div>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="9" :offset="1">
                                <div class="table-title ">
                                    设备在线率
                                </div>
                            </el-col>
                            <el-col :span="9">
                                <div class="table-picture ">

                                </div>
                            </el-col>
                        </el-row>
                        <div class="right-table-content-new" id="echarts-line">
                        </div>

                    </div>
                </el-col>
            </el-row>
            <!-- 第三行 -->
            <el-row>
                <el-col :span="18" :offset="6">
                    <div class=" left-table-content-new" style="height:200px">
                        <!-- <el-row>
                            <el-col :span="10" :offset="1">
                                <div class="table-title ">
                                    总产量计数
                                </div>
                            </el-col>
                            <el-col :span="9">
                                <div class="table-picture ">

                                </div>
                            </el-col>
                        </el-row> -->

                        <el-carousel height="200px" arrow="never">
                            <el-carousel-item>
                                <el-row>
                                    <el-col :span="10" :offset="1">
                                        <div class="table-title ">
                                            产量计数
                                        </div>
                                    </el-col>
                                    <el-col :span="9">
                                        <div class="table-picture ">

                                        </div>
                                    </el-col>
                                </el-row>
                                <div class="right-table-content-new" id="echarts-bar1">
                                </div>
                            </el-carousel-item>

                            <el-carousel-item>
                                <el-row>
                                    <el-col :span="11" :offset="1">
                                        <div class="table-title ">
                                            设备加工时长
                                        </div>
                                    </el-col>
                                    <el-col :span="9">
                                        <div class="table-picture ">

                                        </div>
                                    </el-col>
                                </el-row>

                                <div class="right-table-content-new" id="echarts-bar3">
                                </div>
                            </el-carousel-item>
                        </el-carousel>

                    </div>
                </el-col>
            </el-row>
            <!-- 第四行 -->
            <!-- <el-row>
                <el-col :span="18" :offset="6">
                    <div class=" left-table-content-new">
                        <el-row>
                            <el-col :span="8" :offset="1">
                                <div class="table-title ">
                                    加工时长
                                </div>
                            </el-col>
                            <el-col :span="9">
                                <div class="table-picture ">

                                </div>
                            </el-col>
                        </el-row>
                    </div>
                </el-col>
            </el-row> -->

        </div>
        <!-- 右侧 -->
        <div class="right-table">
            <!-- 第一行 -->
            <el-row>
                <div class=" left-table-content-new">
                    <el-row>
                        <el-col :span="11" :offset="1">
                            <div class="table-title ">
                                当月报警排名
                            </div>
                        </el-col>
                        <el-col :span="9">
                            <div class="table-picture ">

                            </div>
                        </el-col>
                    </el-row>

                    <div class="right-table-content-new" id="echarts-bar2">
                    </div>
                </div>
            </el-row>
            <!-- 第二行 -->
            <el-row>
                <div class=" left-table-content-new">
                    <el-row>
                        <el-col :span="11" :offset="1">
                            <div class="table-title ">
                                报警类型占比
                            </div>
                        </el-col>
                        <el-col :span="9">
                            <div class="table-picture ">

                            </div>
                        </el-col>
                    </el-row>
                    <div class="right-table-content-new " id="echarts-pie">
                    </div>
                </div>
            </el-row>
            <!-- 第三行 -->
            <el-row>
                <div class=" left-table-content-new" style="height:250px">
                    <el-row>
                        <el-col :span="11" :offset="1">
                            <div class="table-title ">
                                实时报警信息
                            </div>
                        </el-col>
                        <el-col :span="9">
                            <div class="table-picture ">

                            </div>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="24">
                            <div class="timeText-bg ">
                                <div v-if="alarmInformation.length > 0">
                                    <div v-for="(item,index) in alarmInformation" class="timeText-bg-line" :key="index" @click="chooseAlarm(index)">
                                        <el-row>
                                            <el-col :span="7" :offset="1">
                                                <div class="timeText ">
                                                    {{item.time}}
                                                </div>
                                            </el-col>
                                            <el-col :span="15" :offset="0">
                                                <div class="timeText ">
                                                    <div class="timeTexts ">
                                                        {{item.alarmContent}}

                                                    </div>
                                                </div>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </div>

                            </div>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="20" :offset="2">
                            <div class="dividingLine"></div>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="8" :offset="1">
                            <div class="table-title ">
                                报警设备
                            </div>
                        </el-col>
                        <el-col :span="9">
                            <div class="table-picture ">

                            </div>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="9" :offset="2">
                            <div class="deviceId border">
                                工位号
                            </div>
                        </el-col>

                        <el-col :span="9" :offset="2">
                            <div class="deviceName border">
                                <span v-if="alarmInformation.length > 0"> {{number}}</span>
                            </div>
                        </el-col>
                    </el-row>

                    <!-- <el-table :data="tableData" size="mini" header-row-class-name="rowNames" row-class-name="rowName">
                        <el-table-column prop="deviceName" label="设备名" width="80">
                        </el-table-column>
                        <el-table-column prop="time" label="报警时间" width="80">
                        </el-table-column>
                        <el-table-column prop="content" label="报警内容" width="180">
                        </el-table-column>
                    </el-table> -->
                </div>
            </el-row>
            <!-- 第四行 -->
            <el-row>
                <div class=" left-table-content-new" style="height:90px;">
                    <el-row>
                        <el-col :span="8" :offset="1">
                            <div class="table-title ">
                                产线/设备
                            </div>
                        </el-col>
                        <el-col :span="9">
                            <div class="table-picture ">

                            </div>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12" :offset="4" class="healthy ">
                            产线平均稼动率:
                        </el-col>
                        <el-col :span="2" :offset="2" class="healthy ">
                            <span>{{averageYield}}%</span>
                        </el-col>
                    </el-row>
                    <!-- <el-row>
                        <el-col :span="20" :offset="2">
                            <hr style="color:#000;" />
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="10" :offset="4" class="healthy ">
                            设备健康评价:
                        </el-col>
                        <el-col :span="2" :offset="2" class="healthy ">
                            <span>A</span>
                        </el-col>
                    </el-row> -->
                </div>
            </el-row>
        </div>

        <!-- 二维码 -->
        <qrcode />
        <!-- 底部文字 -->
        <bottomText />
        <operatingDay />
        <!-- 点击标识 -->
        <label v-show="labelTop!= null" ref='label' class="label" :style="`top:${labelTop}px;left:${labelLeft}px`"></label>

    </div>
</template>

<script>
import * as Three from "three";

// import { OrbitControls } from "Three-orbit-controls";

import { OBJLoader, MTLLoader } from 'three-obj-mtl-loader';
import OrbitControls from "three/examples/js/controls/OrbitControls";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { HDRLoader, HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader";
import FirstPersonControls from "three/examples/js/controls/FirstPersonControls";
import ThreeBSP from "../plugins/ThreeBSP";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import TWEEN from "@tweenjs/tween.js";
import Stats from "three/examples/js/libs/stats.min.js";
import utils from "../assets/utils/utils";
// import socketApi from "../plugins/webScoket";




export default {
    name: "App",

    data() {
        return {
            camera: null,//相机
            scene: null,//场景
            renderer: null,//渲染器
            composer: null,//后期处理
            mesh: null,//网格模型
            publicPath: process.env.VUE_APP_URL,
            container: null,
            controls: null,//控制器
            leftPress: null,//鼠标按下标志
            groupName: "J01",//默认机器名称

            labelTop: null,//label位置
            labelLeft: null,//label位置

            door_state_left1: true,//默认是门是关闭的
            door_state_right1: true, //默认是门是关闭的

            //场景变量
            HEIGHT: 50,
            WIDTH: 800,
            LENGTH: 600,
            interval: 100,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            // 页面渲染必须数据
            onlineNum: 1,//在线设备数
            outlineNum: 2,//离线设备数
            alarmInformation: [],//实时报警信息
            number: "...",//选中报警工位
            averageYield: 0,//平均稼动率
            deviceIdArr: [],//存放设备Id


            DayWorkLoadRank: [],

            flag: false,
        }
    },
    methods: {

        //初始化
        init() {
            let that = this;
            this.container = document.getElementById("container");
            // this.stats = this.initStats();
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

            this.definedComposer();

            // let rollOverGeo = new Three.BoxBufferGeometry(5, 5, 5);
            // this.rollOverMaterial = new Three.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
            // this.rollOverMesh = new Three.Mesh(rollOverGeo, this.rollOverMaterial);
            // this.scene.add(this.rollOverMesh);


            // let geometry = new Three.PlaneGeometry(5, 5, 32);
            // let material = new Three.MeshBasicMaterial({ color: 0x000000, side: Three.DoubleSide });
            // let plane = new Three.Mesh(geometry, material);
            // this.scene.add(plane);


            // let geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
            // geometry.rotateX( - Math.PI / 2 );

            // plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
            // scene.add( plane );

            // objects.push( plane );


        },
        /**设置场景 */
        initScene() {
            this.scene = new Three.Scene();
            this.scene.background = new Three.Color(0xffffff);
        },
        /**设置相机 */
        initCamera() {
            this.camera = new Three.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000);
            this.camera.position.set(0, 250, 500);
            this.camera.lookAt(0, 50, 50);
        },
        /**渲染器 */
        initRender() {
            this.renderer = new Three.WebGLRenderer({ antialias: true, alpha: true, });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            // this.renderer.setClearColor(0x000000, 1); //设置背景颜色
            this.renderer.setClearColor(0xFFFFFF, 0.0);
            this.container.appendChild(this.renderer.domElement);
        },
        /** 灯光 */
        initLight() {

            let ambientLight = new Three.AmbientLight(0xffffff, 1);
            this.scene.add(ambientLight);
            // 平行光
            let directionalLight = new Three.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 0.75, 0.5).normalize();
            this.scene.add(directionalLight);



            // directionalLight.color.setHSL(0.1, 1, 0.95);
            // directionalLight.position.set(0, 200, 0).normalize();

            // ambientLight.position.set(0, 0, 0);



        },
        /**控制器 */
        initControls() {
            this.controls = new Three.OrbitControls(this.camera, this.renderer.domElement); //创建控件对象
            console.log(this.controls);
            this.controls.maxZoom = 0.8;
        },
        /**设置辅助坐标系 */
        helper() {
            let grid = new Three.GridHelper(800, 160, 0xFF0000, 0x000000);
            grid.material.opacity = 0.1;
            grid.material.transparent = true;
            this.scene.add(grid);
            let axesHelper = new Three.AxesHelper(30);
            this.scene.add(axesHelper);
        },
        /**添加环境 */
        createEnvironment() {

            this.scene.background = new Three.TextureLoader()
                .load(require("../assets/image/bg.jpg"));

        },
        /**添加地面 */
        createFloor() {
            let that = this;

            let floorGeometry = new Three.BoxGeometry(that.LENGTH, that.WIDTH, 1);
            // let floorMaterial = new Three.MeshBasicMaterial({ color: 0x08441f });
            let floorMaterial = new Three.MeshBasicMaterial({ color: 0x000E2E });

            let floor = new Three.Mesh(floorGeometry, floorMaterial);
            floor.position.y = -0.5;
            floor.rotation.x = Math.PI / 2;
            floor.name = "地面";
            that.scene.add(floor);

            // let loader = new Three.TextureLoader();
            // loader.load(require("../assets/image/timg6.jpg"), function (texture) {
            //     texture.wrapS = texture.wrapT = Three.RepeatWrapping;
            //     texture.repeat.set(10, 10);
            //     let floorGeometry = new Three.BoxGeometry(that.LENGTH, that.WIDTH, 1);
            //     let floorMaterial = new Three.MeshBasicMaterial({ map: texture, side: Three.DoubleSide });
            //     let floor = new Three.Mesh(floorGeometry, floorMaterial);
            //     floor.position.y = -0.5;
            //     floor.rotation.x = Math.PI / 2;
            //     floor.name = "地面";
            //     floor.position.z = -150;
            //     that.scene.add(floor);
            // });


            //安装警戒线
            // this.addAlarmLine(this.WIDTH, 2, 0.5, -150, 0.1, 0, "线1", "../assets/image/line.png");
            // this.addAlarmLine(this.WIDTH, 2, 0.5, 150, 0.1, 0, "线2", "../assets/image/line.png");

            // this.addAlarmLineP(this.WIDTH, 2, 0.5, -130, 0.1, 0, "线3");
            // this.addAlarmLineP(this.WIDTH, 2, 0.5, 130, 0.1, 0, "线4");
        },

        /** 创建canvas对象*/
        makeLabelCanvas(baseWidth, size, name, color) {
            const borderSize = 2;
            const ctx = document.createElement('canvas').getContext('2d');
            const font = `${size}px bold sans-serif`;
            ctx.font = font;
            // measure how long the name will be
            const textWidth = ctx.measureText(name).width;
            const doubleBorderSize = borderSize * 2;
            const width = baseWidth + doubleBorderSize;
            const height = size + doubleBorderSize;
            ctx.canvas.width = width;
            ctx.canvas.height = height;

            // need to set font again after resizing canvas
            ctx.font = font;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            ctx.fillStyle = 'rgba(255, 255, 255, 0)';
            ctx.fillRect(0, 0, width, height);

            // scale to fit but don't stretch
            const scaleFactor = Math.min(1, baseWidth / textWidth);
            ctx.translate(width / 2, height / 2);
            ctx.scale(scaleFactor, 1);
            ctx.fillStyle = color;
            ctx.fillText(name, 0, 0);
            return ctx.canvas;
        },

        /** 添加精灵图 */
        createTable(index, item, x, z) {

            let canvas;
            if (item.F_ONLINESTATUS == "离线") {
                canvas = this.makeLabelCanvas(100, 100, index, "rgb(210, 60, 64)");
                let spriteMap = new Three.TextureLoader().load(require("../assets/image/离线2.png"));
                let spriteMaterial = new Three.SpriteMaterial({
                    transparent: true,
                    map: spriteMap,
                    side: Three.DoubleSide,

                });
                let sprite = new Three.Sprite(spriteMaterial);
                sprite.scale.set(25, 25, 1)
                sprite.position.set(x, 100, z);
                this.scene.add(sprite);

            }
            else {
                canvas = this.makeLabelCanvas(100, 100, index, "rgb(91, 255, 185)");
                let spriteMap = new Three.TextureLoader().load(require("../assets/image/在线2.png"));
                let spriteMaterial = new Three.SpriteMaterial({
                    transparent: true,
                    map: spriteMap,
                    side: Three.DoubleSide,


                });
                let sprite = new Three.Sprite(spriteMaterial);
                sprite.scale.set(25, 25, 1)
                sprite.position.set(x, 100, z);
                this.scene.add(sprite);
            }
            const texture = new Three.CanvasTexture(canvas);
            let spriteMaterial = new Three.SpriteMaterial({
                transparent: true,
                map: texture,
                side: Three.DoubleSide,
                // color: 0x00ff00,

            });
            let sprite = new Three.Sprite(spriteMaterial);
            sprite.scale.set(25, 25, 1)
            sprite.position.set(x, 120, z);
            this.scene.add(sprite);

        },

        //场景中的内容
        initContent() {
            let that = this;
            this.createFloor();
            // this.createAllCubeWall();
            this.createEnvironment();
            // this.createTable();

            //生成激光打标机
            let wall = this.returnWallObject(50, 70, 40, 0, new Three.MeshBasicMaterial({ color: 0xafc0ca, opacity: 0.1 }), 0, 35, 0, "墙面4");
            let a = this.returnWallObject(30, 20, 40, 0, new Three.MeshBasicMaterial({ color: 0xafc0ca }), 10, 45, 0, "墙面4");
            let arr3 = [];
            arr3.push(a);
            let obj2 = this.createResultBspLight(wall, arr3);


            // 加载平台
            let mtlLoader = new MTLLoader();
            mtlLoader.load(`${that.publicPath}/model/TP06.mtl`, function (materials1) {
                let objLoader = new OBJLoader();
                objLoader.setMaterials(materials1);
                objLoader.load(`${that.publicPath}/model/TP06.obj`, function (pt) {

                    pt.scale.set(0.05, 0.05, 0.05);
                    //加载机械臂
                    let mtlLoader2 = new MTLLoader();
                    mtlLoader2.load(`${that.publicPath}/model/model02.mtl`, function (materials) {
                        let objLoader2 = new OBJLoader();
                        objLoader2.setMaterials(materials);
                        objLoader2.load(`${that.publicPath}/model/model02(1).obj`, function (object) {

                            // console.log(object);
                            // object.rotation.z = Math.PI;
                            // object.position.set(0, 16, 0);
                            // that.scene.add(object);


                            //加载激光打标 
                            let mtlLoader3 = new MTLLoader();
                            mtlLoader3.load(`${that.publicPath}/model/激光打标机05.mtl`, function (materials2) {
                                let objLoader3 = new OBJLoader();
                                objLoader3.setMaterials(materials2);
                                objLoader3.load(`${that.publicPath}/model/激光打标机05.obj`, function (obj3) {



                                    //加载控制台
                                    let mtlLoader4 = new MTLLoader();
                                    mtlLoader4.load(`${that.publicPath}/model/控制台04.mtl`, function (materials3) {
                                        let objLoader4 = new OBJLoader();
                                        objLoader4.setMaterials(materials3);
                                        objLoader4.load(`${that.publicPath}/model/控制台04.obj`, function (obj4) {
                                            that.clone(object, pt, obj3, obj4);
                                        })
                                    })






                                })
                            })



                        });
                    });
                });
            });



            // let loader = new FBXLoader();
            // loader.load(`${that.publicPath}/model/1341234.FBX`, function (object) {
            //     console.log(object);
            //     object.position.set(0, 16, 0);
            //     object.position.set(0, 16, 0);
            //     that.scene.add(object);
            //     console.log(object);
            //     // that.clone(object); 
            // });





            // let loader = new FBXLoader();
            // loader.load(`${that.publicPath}/model/1341234.FBX`, function (object) {

            //     object.position.set(0, 0, 0);
            //     that.scene.add(object);
            //     console.log(object);
            //     // that.clone(object);


            // });


            // let gltfLoader = new GLTFLoader();
            // gltfLoader.load(`${that.publicPath}/model/pt.gltf`, function (pt) {
            //     console.log(pt.scene);
            //     pt.scene.scale.set(0.05, 0.05, 0.05);


            //     // let loader = new FBXLoader();
            //     // loader.load(`${that.publicPath}/model/1341234.FBX`, function (object) {
            //     //     that.clone(object, pt.scene, obj2);
            //     // });


            //     let gltfLoader1 = new GLTFLoader();
            //     gltfLoader1.load(`${that.publicPath}/model/model.gltf`, (pt2) => {
            //         that.clone(pt2.scene, pt.scene, obj2);
            //     })


            //     //加载机械臂
            //     // let mtlLoader2 = new MTLLoader();
            //     // mtlLoader2.load(`${that.publicPath}/model/605(1).mtl`, function (materials) {
            //     //     let objLoader2 = new OBJLoader();
            //     //     objLoader2.setMaterials(materials);
            //     //     objLoader2.load(`${that.publicPath}/model/model(1).obj`, function (object) {

            //     //         console.log(object);
            //     //         that.clone(object, pt.scene, obj2);
            //     //     });
            //     // });



            // });
        },
        /**初始化性能插件 */
        initStats() {
            let stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';
            this.container.appendChild(stats.domElement);
            return stats;
        },
        /** 动画  */
        animate() {
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
            this.composer.render();//后期
            // this.update();

            let vect = this.camera.getWorldDirection(new Three.Vector3());//获取当前视角方向
            //前进
            if (this.front) {
                this.camera.position.z += vect.dot(new Three.Vector3(0, 0, 15)) * 0.01;//沿z轴分解
                this.camera.position.x += vect.dot(new Three.Vector3(15, 0, 0)) * 0.01;//沿x轴分解
            }
            //后退
            if (this.back) {
                this.camera.position.z -= vect.dot(new Three.Vector3(0, 0, 15)) * 0.01;
                this.camera.position.x -= vect.dot(new Three.Vector3(15, 0, 0)) * 0.01;
            }
            //向左
            if (this.left) {
                vect = vect.cross(new Three.Vector3(0, 2, 0));//求视角方向与
                this.camera.position.z -= vect.dot(new Three.Vector3(0, 0, 15)) * 0.01;
                this.camera.position.x -= vect.dot(new Three.Vector3(15, 0, 0)) * 0.01;

            }
            //向右
            if (this.right) {
                vect = vect.cross(new Three.Vector3(0, 2, 0));
                this.camera.position.z += vect.dot(new Three.Vector3(0, 0, 15)) * 0.01;
                this.camera.position.x += vect.dot(new Three.Vector3(15, 0, 0)) * 0.01;
            }
            // //转轴1
            if (this.one) {
                this.shaftOne();
            }
            if (this.two) {
                this.shaftTwo();
            }
            if (this.three) {
                this.shaftThree();
            }
            if (this.four) {
                this.shaftFour();
            }
            if (this.five) {
                this.shaftFive();
            }
            if (this.six) {
                this.shaftSix();
            }
        },
        /**创建墙 */
        createAllCubeWall() {
            let that = this;
            this.createCubeWall(this.LENGTH, this.HEIGHT, 1, 0, new Three.MeshPhongMaterial({ color: 0x9cb2d1 }), 0, 25, -this.WIDTH / 2, "墙面3");


            // this.createCubeWall(this.WIDTH, this.HEIGHT, 1, 0.5, new Three.MeshPhongMaterial({ color: 0xafc0ca }), -100, 25, -150, "墙面1");
            // this.createCubeWall(this.WIDTH, this.HEIGHT, 1, 0.5, new Three.MeshPhongMaterial({ color: 0xafc0ca }), 100, 25, -150, "墙面2");


            //有窗户的墙
            let wall1 = this.returnWallObject(this.WIDTH, this.HEIGHT, 1, 0.5, new Three.MeshPhongMaterial({ color: 0xafc0ca }), -this.LENGTH / 2, 25, 0, "墙面1");
            let arr1 = [];
            for (let i = 0; i < 7; i++) {
                arr1.push(this.returnWallObject(20, 20, 1, 0.5, new Three.MeshPhongMaterial({ color: 0xafc0ca }), -this.LENGTH / 2, 25, this.WIDTH / 2 - this.interval - this.interval * i, "墙面1"));
            }
            this.createResultBsp(wall1, arr1);

            //有窗户的墙
            let wall2 = this.returnWallObject(this.WIDTH, this.HEIGHT, 1, 0.5, new Three.MeshPhongMaterial({ color: 0xafc0ca }), this.LENGTH / 2, 25, 0, "墙面2");
            let arr2 = [];
            for (let i = 0; i < 7; i++) {
                arr2.push(this.returnWallObject(20, 20, 1, 0.5, new Three.MeshPhongMaterial({ color: 0xafc0ca }), this.LENGTH / 2, 25, this.WIDTH / 2 - this.interval - this.interval * i, "墙面2"));
            }
            this.createResultBsp(wall2, arr2);


            //有门的墙
            let wall3 = this.returnWallObject(this.LENGTH, this.HEIGHT, 1, 0, new Three.MeshPhongMaterial({ color: 0xafc0ca }), 0, 25, this.WIDTH / 2, "墙面4");
            let b = this.returnWallObject(30, 40, 1, 0, new Three.MeshPhongMaterial({ color: 0xafc0ca }), 0, 20, this.WIDTH / 2, "墙面4");
            let arr3 = [];
            arr3.push(b);
            this.createResultBsp(wall3, arr3);

            // 有字的墙
            // let wall4 = this.returnWallObject(this.LENGTH, this.HEIGHT, 1, 0, new Three.MeshPhongMaterial({ color: 0xafc0ca }), 0, 25, -350, "墙面3");
            // let c = this.returnWallObject(150, 25, 1, 0, new Three.MeshPhongMaterial({ color: 0xafc0ca }), 0, 25, -350, "墙面3");
            // let arr4 = [];
            // arr4.push(c);
            // this.createResultBsp(wall4, arr4);

            // 安装门
            this.createDoor_left(15, 40, 1, 0, -15, 20, this.WIDTH / 2, "左门1");
            this.createDoor_right(15, 40, 1, 0, 15, 20, this.WIDTH / 2, "右门1");

            //安装窗户
            for (let i = 0; i < 7; i++) {
                this.createWindow(20, 20, 1, 0.5, -this.LENGTH / 2, 25, this.WIDTH / 2 - this.interval - this.interval * i, `窗户${i + 1}`);
                this.createWindow(20, 20, 1, 0.5, this.LENGTH / 2, 25, this.WIDTH / 2 - this.interval - this.interval * i, `窗户${14 - i}`);
            }
            //安装字
            let loader = new Three.TextureLoader();
            loader.load(require("../assets/image/biaoyu.png"), function (texture) {
                let doorgeometry = new Three.PlaneGeometry(100, 20);
                let doormaterial = new Three.MeshBasicMaterial({ map: texture, color: 0xffffff });
                let door = new Three.Mesh(doorgeometry, doormaterial);
                doormaterial.opacity = 1.0;
                doormaterial.transparent = true;
                door.position.set(0, 25, -that.WIDTH / 2 + 1);
                // door.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
                door.name = "";
                that.scene.add(door);
            });





        },
        //创建一面有窗户墙面
        createResultBsp(bsp, cubeArray) {
            let material = new Three.MeshPhongMaterial({ color: 0x9cb2d1, specular: 0x9cb2d1, shininess: 30, transparent: true, opacity: 1 });
            let BSP = new ThreeBSP(bsp);
            cubeArray.forEach((item, index) => {
                let bsp = new ThreeBSP(item);
                BSP = BSP.subtract(bsp);
            })
            let result = BSP.toMesh(material);
            result.material.flatshading = Three.FlatShading;
            result.geometry.computeFaceNormals();  //重新计算几何体侧面法向量
            result.geometry.computeVertexNormals();
            result.material.needsUpdate = true;  //更新纹理
            result.geometry.buffersNeedUpdate = true;
            result.geometry.uvsNeedUpdate = true;
            result.name = '墙面4';

            this.scene.add(result);
            return result;
        },

        //创建激光打标机
        createResultBspLight(bsp, cubeArray) {
            let material = new Three.MeshPhongMaterial({ color: 0x9cb2d1, specular: 0x9cb2d1, shininess: 30, transparent: true, opacity: 1 });
            let BSP = new ThreeBSP(bsp);
            cubeArray.forEach((item, index) => {
                let bsp = new ThreeBSP(item);
                BSP = BSP.subtract(bsp);
            })
            let result = BSP.toMesh(material);
            result.material.flatshading = Three.FlatShading;
            result.geometry.computeFaceNormals();  //重新计算几何体侧面法向量
            result.geometry.computeVertexNormals();
            result.material.needsUpdate = true;  //更新纹理
            result.geometry.buffersNeedUpdate = true;
            result.geometry.uvsNeedUpdate = true;
            return result;
        },
        //创建一面无窗墙
        createCubeWall(width, height, depth, angle, material, x, y, z, name) {
            let that = this;
            let cubeGeometry = new Three.BoxGeometry(width, height, depth);
            let cube = new Three.Mesh(cubeGeometry, material);
            cube.position.x = x;
            cube.position.y = y;
            cube.position.z = z;
            cube.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
            cube.name = name;
            that.scene.add(cube);
        },

        //返回墙对象
        returnWallObject(width, height, depth, angle, material, x, y, z, name) {
            let cubeGeometry = new Three.BoxGeometry(width, height, depth);
            let cube = new Three.Mesh(cubeGeometry, material);
            cube.position.x = x;
            cube.position.y = y;
            cube.position.z = z;
            cube.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
            cube.name = name;
            return cube;
        },

        //创建门_左侧
        createDoor_left(width, height, depth, angle, x, y, z, name) {
            let that = this;
            let loader = new Three.TextureLoader();
            loader.load(require("../assets/image/door_left.png"), function (texture) {
                let doorgeometry = new Three.BoxGeometry(width, height, depth);
                doorgeometry.translate(7.5, 0, 0);
                let doormaterial = new Three.MeshBasicMaterial({ map: texture, color: 0xffffff });
                doormaterial.opacity = 1.0;
                doormaterial.transparent = true;
                let door = new Three.Mesh(doorgeometry, doormaterial);
                door.position.set(x, y, z);
                door.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
                door.name = name;

                // let axesHelper = new Three.AxesHelper(30);
                // door.add(axesHelper);
                that.scene.add(door);
            });
        },
        //创建门_右侧
        createDoor_right(width, height, depth, angle, x, y, z, name) {
            let that = this;
            let loader = new Three.TextureLoader();
            loader.load(require("../assets/image/door_right.png"), function (texture) {

                let doorgeometry = new Three.BoxGeometry(width, height, depth);
                doorgeometry.translate(-7.5, 0, 0);
                let doormaterial = new Three.MeshBasicMaterial({ map: texture, color: 0xffffff });
                doormaterial.opacity = 1.0;
                doormaterial.transparent = true;
                let door = new Three.Mesh(doorgeometry, doormaterial);
                door.position.set(x, y, z);
                door.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
                door.name = name;
                // let axesHelper = new Three.AxesHelper(30);
                // door.add(axesHelper);
                that.scene.add(door);
            });
        },
        //创建窗户
        createWindow(width, height, depth, angle, x, y, z, name) {
            let that = this;
            let loader = new Three.TextureLoader();
            loader.load(require("../assets/image/window.png"), function (texture) {
                let windowgeometry = new Three.BoxGeometry(width, height, depth);
                let windowmaterial = new Three.MeshBasicMaterial({ map: texture, color: 0xffffff });
                windowmaterial.opacity = 1.0;
                windowmaterial.transparent = true;
                let window = new Three.Mesh(windowgeometry, windowmaterial);
                window.position.set(x, y, z);
                window.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
                window.name = name;
                that.scene.add(window);
            });
        },
        //创建警戒线
        addAlarmLine(width, height, angle, x, y, z, name, imageUrl) {
            let that = this;
            let loader2 = new Three.TextureLoader();
            loader2.load(require("../assets/image/line.png"), function (texture) {
                let doorgeometry = new Three.PlaneGeometry(width, height);
                let doormaterial = new Three.MeshBasicMaterial({ map: texture, color: 0xffffff });
                let door = new Three.Mesh(doorgeometry, doormaterial);
                doormaterial.opacity = 1.0;
                doormaterial.transparent = true;
                door.position.set(x, y, z);
                door.rotation.x = -angle * Math.PI;
                door.rotation.z = -angle * Math.PI;

                // door.rotation.y += angle * Math.PI;  //-逆时针旋转,+顺时针
                door.name = name;
                that.scene.add(door);
            });

        },

        addAlarmLineP(width, height, angle, x, y, z, name, imageUrl) {
            let that = this;
            let loader2 = new Three.TextureLoader();
            loader2.load(require("../assets/image/line2.png"), function (texture) {
                let doorgeometry = new Three.PlaneGeometry(height, width);
                let doormaterial = new Three.MeshBasicMaterial({ map: texture, color: 0xffffff });
                let door = new Three.Mesh(doorgeometry, doormaterial);
                doormaterial.opacity = 1.0;
                doormaterial.transparent = true;
                door.position.set(x, y, z);
                door.rotation.x = -angle * Math.PI;
                door.name = name;
                that.scene.add(door);
            });

        },

        //获取object的父对象
        addSelectedObject(object, outlinePass, x, y) {
            let selectedObjects = [];
            selectedObjects.push(object);
            let groupName;
            while (object) {
                if (object.type == "Group") {
                    groupName = object.name;
                }
                object = object.parent;
            }

            outlinePass.selectedObjects = [object];

            if (groupName) {
                //删除场景GPU缓存
                this.scene.children = {};
                this.renderer.dispose();
                this.$router.push({
                    name: "seven",
                    params: {
                        groupName: groupName,
                        deviceId: this.$store.state.deviceIdArr[groupName.substr(2, groupName.length - 1) - 1].deviceId
                    }
                });
            }

            this.groupName = groupName;
        },
        definedComposer() {
            this.composer = new EffectComposer(this.renderer);
            let renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            let outlinePass = new OutlinePass(new Three.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera);
            outlinePass.edgeStrength = 5;//包围线浓度
            outlinePass.edgeGlow = 0.5;//边缘线范围
            outlinePass.edgeThickness = 2;//边缘线浓度
            outlinePass.pulsePeriod = 2;//包围线闪烁频率
            outlinePass.visibleEdgeColor.set('#ffffff');//包围线颜色
            outlinePass.hiddenEdgeColor.set('#190a05');//被遮挡的边界线颜色
            this.composer.addPass(outlinePass);

            return outlinePass;

        },
        //鼠标点击事件
        click(evnet) {
            let raycaster = new Three.Raycaster();
            let mouse = new Three.Vector2();
            let outlinePass = this.definedComposer();

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            let intersects = raycaster.intersectObjects([this.scene], true);
            // console.log(intersects);
            if (intersects.length > 0) {
                let selectedObject = intersects[0].object;
                // this.addSelectedObject(selectedObject, outlinePass, event.clientX, event.clientY);
                //给标签赋值
                // this.labelLeft = event.clientX;
                // this.labelTop = event.clientY;
                // this.$refs.label.innerText = intersects[0].object.name;

                outlinePass.selectedObjects = [intersects[0].object];


                // if (intersects[0].object.name == "左门1") {

                //     if (this.door_state_left1) {
                //         new TWEEN.Tween(intersects[0].object.rotation).to({
                //             y: -0.5 * Math.PI
                //         }, 5000).easing(TWEEN.Easing.Elastic.Out).onComplete(function () {
                //         }).start();
                //         this.door_state_left1 = false;
                //     } else {
                //         new TWEEN.Tween(intersects[0].object.rotation).to({
                //             y: 0
                //         }, 5000).easing(TWEEN.Easing.Elastic.Out).onComplete(function () {
                //         }).start();
                //         this.door_state_left1 = true;
                //     }
                // }
                // else if (intersects[0].object.name == "右门1") {
                //     if (this.door_state_right1) {
                //         new TWEEN.Tween(intersects[0].object.rotation).to({
                //             y: 0.5 * Math.PI
                //         }, 5000).easing(TWEEN.Easing.Elastic.Out).onComplete(function () {
                //         }).start();
                //         this.door_state_right1 = false;
                //     } else {
                //         new TWEEN.Tween(intersects[0].object.rotation).to({
                //             y: 0
                //         }, 5000).easing(TWEEN.Easing.Elastic.Out).onComplete(function () {
                //         }).start();
                //         this.door_state_right1 = true;
                //     }
                // }




                // this.rollOverMesh.position.copy(intersects[0].point);
                // this.rollOverMesh.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);

            } else {

                // outlinePass.selectedObjects = [];

            }

        },
        doubleClick(event) {
            let raycaster = new Three.Raycaster();
            let mouse = new Three.Vector2();
            let outlinePass = this.definedComposer();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            let intersects = raycaster.intersectObjects([this.scene], true);
            if (intersects.length > 0) {
                let selectedObject = intersects[0].object;
                this.addSelectedObject(selectedObject, outlinePass, event.clientX, event.clientY);
            } else {
                console.log();
            }

        },
        //鼠标移动事件
        move(event) {
            if (this.leftPress) {
                this.camera.rotateOnWorldAxis(
                    new Three.Vector3(0, 1, 0),
                    event.movementX / 500
                );
                this.camera.rotateOnAxis(
                    new Three.Vector3(1, 0, 0),
                    event.movementY / 500
                );
            }
        },
        //鼠标按下事件
        up(event) {
            this.leftPress = false;

        },
        //鼠标放开事件
        down(event) {
            this.leftPress = true;
        },
        //键盘按下事件
        keyboardDown(event) {
            switch (event.keyCode) {
                case 49: // 1
                    this.one = true;
                    break;
                case 50: // 2
                    this.two = true;
                    break;
                case 51: // 3
                    this.three = true;
                    break;
                case 52: // 4
                    this.four = true;
                    break;
                case 53: // 5
                    this.five = true;
                    break;
                case 54: // 6
                    this.six = true;
                    break;
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
        //键盘收起事件
        keyboardUp(event) {
            switch (event.keyCode) {
                case 49: // 1
                    this.one = false;
                    break;
                case 50: // 2
                    this.two = false;
                    break;
                case 51: // 3
                    this.three = false;
                    break;
                case 52: // 4
                    this.four = false;
                    break;
                case 53: // 5
                    this.five = false;
                    break;
                case 54: // 6
                    this.six = false;
                    break;
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
        //复制obj
        clone(object, obj, obj3, obj4) {
            let z = 300;
            let x = 200;
            let J1 = new Three.Group();
            let J2 = new Three.Group();
            let J3 = new Three.Group();
            let J4 = new Three.Group();
            let J5 = new Three.Group();
            let J6 = new Three.Group();
            let J7 = new Three.Group();
            let J8 = new Three.Group();



            let J3Box = new Three.Object3D();
            let J4Box = new Three.Object3D();
            let J5Box = new Three.Object3D();
            let J6Box = new Three.Object3D();
            let J7Box = new Three.Object3D();
            let J8Box = new Three.Object3D();



            J7.add(object.getObjectByName('J7_1'));
            J7.add(object.getObjectByName('J7_2'));
            J7.add(object.getObjectByName('J7_3'));
            J7.add(object.getObjectByName('J7_4'));
            J7.add(object.getObjectByName('J7_5'));

            J7.position.y = -31.6;
            J7.position.x = 19;
            J7Box.add(J7);
            J7Box.name = "J7Box";
            // let axesHelper = new Three.AxesHelper(30);
            // J7Box.add(axesHelper);



            J6.add(object.getObjectByName('J6_1'));
            J6.add(object.getObjectByName('J6_2'));
            J6Box.add(J7Box);
            J6Box.add(J6);
            J6.position.y = -31.6;
            J6.position.x = 19;
            J6Box.position.y = 31.6;
            J6Box.position.x = -19;
            J6Box.name = "J6Box";



            J5.add(object.getObjectByName('J5_1'));
            J5.add(object.getObjectByName('J5_2'));
            J5.add(object.getObjectByName('J5_3'));
            J5.add(object.getObjectByName('J5_4'));
            J5.add(object.getObjectByName('J5_5'));
            J5.add(J6Box);
            J5.position.y = -32;
            J5.position.x = -5.7;
            J5Box.add(J5);
            J5Box.position.y = 32;
            J5Box.position.x = 5.7;
            J5Box.name = "J5Box";

            J4.add(object.getObjectByName('J4_1'));
            J4.add(object.getObjectByName('J4_2'));
            J4.add(J5Box);
            J4.position.y = -28;
            J4Box.add(J4);
            J4Box.position.y = 28;
            J4Box.name = "J4Box";

            J3.add(object.getObjectByName('J3_1'));
            J3.add(object.getObjectByName('J3_2'));

            J3.add(J4Box);
            J3.position.y = -14;
            J3Box.position.y = 14;
            J3Box.add(J3);
            J3Box.name = "J3Box";

            J2.add(object.getObjectByName('J2_1'));
            J2.add(J3Box);
            J2.name = "J2";

            let mesh = object;
            J1.add(mesh);
            J1.add(J2);
            // J1.position.z = z;
            // J1.position.x = -x;

            J1.scale.set(30, 30, 30);
            J1.position.set(16 * 20, 18 * 20, 12 * 20);

            // J1.rotateY(0.5 * Math.PI);
            obj.name = "J01";

            // let copy_J1 = J1.clone();
            // copy_J1.rotateY(Math.PI);
            // copy_J1.position.z = z;
            // copy_J1.position.x = x;
            // copy_J1.name = "J014";
            // console.log(obj2);
            // J8.add(obj2.getObjectByName('墙面4'));
            // J8Box.add(J8);

            obj.add(J1);

            // obj2.name = "激光打标机";


            // obj2.scale.set(20, 20, 20);
            // obj2.rotation.y = 0.5 * Math.PI;

            // obj2.position.set(0 * 20, 35 * 20, 60 * 20);
            // obj.add(obj2);

            obj3.scale.set(1.5, 1.5, 1.5);
            obj3.rotation.y = Math.PI;
            obj3.position.set(-5 * 20, 0, -60 * 20);
            obj.add(obj3);

            obj4.rotation.y = Math.PI;
            obj4.position.set(-60 * 20, 0, 40 * 20);
            obj.add(obj4);

            obj.position.z = z;
            obj.position.x = -x;
            obj.rotation.y = -0.5 * Math.PI;

            this.scene.add(obj);
            // this.scene.add(copy_J1);
            this.createTable(1, this.DayWorkLoadRank[0], -x - 50, z);

            let copy_J1 = obj.clone();
            copy_J1.rotateY(Math.PI);
            copy_J1.position.z = z;
            copy_J1.position.x = x;
            copy_J1.name = "J014";
            this.scene.add(copy_J1);


            //复制多个J1
            for (let i = 0, j = 2; i < 6; i++) {
                z -= this.interval;
                let copy_J1 = obj.clone();
                copy_J1.position.z = z;
                copy_J1.position.x = -x;
                copy_J1.name = `J0${j}`;

                this.createTable(i + 2, this.DayWorkLoadRank[i + 1], -x - 50, z);

                let copy_J2 = obj.clone();
                copy_J2.rotateY(Math.PI);
                copy_J2.position.z = z;
                copy_J2.position.x = x;
                copy_J2.name = `J0${15 - j}`;
                j++;
                this.createTable(13 - i, this.DayWorkLoadRank[12 - i], x + 50, z);

                this.scene.add(copy_J1);
                this.scene.add(copy_J2);
            }

        },
        //转动轴1
        shaftOne() {
            this.scene.getObjectByName(this.groupName).getObjectByName("J2").rotation.y += 0.01;
        },
        //转动轴2
        shaftTwo() {
            this.scene.getObjectByName(this.groupName).getObjectByName("J3Box").rotation.z += 0.01;
        },
        //转动轴3
        shaftThree() {
            this.scene.getObjectByName(this.groupName).getObjectByName("J4Box").rotation.z += 0.01;
        },
        //转动轴4
        shaftFour() {
            this.scene.getObjectByName(this.groupName).getObjectByName("J5Box").rotation.x += 0.01;

        },
        //转动轴5
        shaftFive() {
            this.scene.getObjectByName(this.groupName).getObjectByName("J6Box").rotation.z += 0.01;

        },
        //转动轴6
        shaftSix() {
            console.log(this.scene.getObjectByName(this.groupName).getObjectByName("J7Box"));
            this.scene.getObjectByName(this.groupName).getObjectByName("J7Box").rotation.x += 0.01;

        },
        // 窗口变动触发
        onWindowResize() {
            console.log('s');
            this.screenWidth = window.innerWidth;
            this.screenHeight = window.innerHeight;

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            // this.controls.handleResize();
        },
        chooseAlarm(index) {
            this.number = this.alarmInformation[index].name;
        },
        //插件更新
        update() {
            this.stats.update();
            TWEEN.update();
            // this.testRotation();
        },
        //测试自动旋转
        testRotation() {
            for (let i = 1; i <= 14; i++) {
                this.scene.getObjectByName(`J0${i}`).getObjectByName("J2").rotation.y += 0.01;

            }
        },

        //加载echarts第一张树状图
        //当月生产排名
        initEchartBar() {
            let myChart = this.$echarts.init(document.getElementById('echarts-bar'));
            // 绘制图表
            myChart.setOption({
                color: ['#3398DB'],
                grid: {
                    left: '0%',
                    bottom: '3%',
                    top: "5%",
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                yAxis: [
                    {
                        // show: false,
                        type: 'value',
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#fff'
                            },
                        }
                    }
                ],
                xAxis: [
                    {
                        // name: '工位',
                        type: 'category',
                        data: [],
                        axisTick: {
                            alignWithLabel: true
                        },

                        axisLine: {
                            lineStyle: {
                                color: '#ddd', // 颜色
                                width: 1 // 粗细
                            }
                        },
                        axisLabel: {
                            interval: 0,
                            show: true,
                            textStyle: {
                                color: '#fff'
                            },
                            rotate: 300 //倾斜角度
                        },
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        barWidth: '40%',
                        data: []
                    }
                ]
            });
            let arr = utils.CurrentMonthFirstAndLast();
            let obj = {
                mac: "wuji",
                begindate: arr[0],
                enddate: arr[1],
            }
            myChart.showLoading();
            this.$axios.post("/api/DDC/DeviceWorkStatic/WorkLoadRank" + utils.formatQueryStr(obj)).then(res => {
                myChart.hideLoading();
                let data1 = [];
                let data2 = [];
                for (let i = 0; i < 7; i++) {
                    data1.push(res[i].F_NAME.substr(8, res[i].F_NAME.length - 1));
                    data2.push(res[i].F_WORKLOAD);
                }
                myChart.setOption({
                    xAxis: {
                        data: data1
                    },
                    series: [{
                        data: data2
                    }]
                })
            }).catch(error => {

            })

        },
        // 总产量计数
        initEchartBar2() {
            let that = this;
            let myChart = this.$echarts.init(document.getElementById('echarts-bar1'));
            // 绘制图表
            let option = {
                grid: {
                    left: '0%',
                    bottom: '3%',
                    top: "5%",
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: ['当月产量', '当周产量', "当天产量"],
                        axisTick: {
                            alignWithLabel: true
                        },

                        axisLine: {
                            lineStyle: {
                                color: '#ddd', // 颜色
                                width: 1 // 粗细
                            }
                        },
                        axisLabel: {
                            interval: 0,
                        }
                    }
                ],
                yAxis: [
                    {
                        max: function (value) {
                            return value.max + value.max * 0.2;
                        },
                        type: 'value',
                        axisLabel: {
                            color: '#fff',
                            fontSize: 12,
                        },
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        barWidth: '40%',
                        data: [],
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    let colorList = [
                                        ['rgb(254,153,26)', 'rgb(254,70,26)'],
                                        ['rgb(98,129,227)', 'rgb(9,136,222)'],
                                        ['rgb(254,213,1)', 'rgb(252,155,1)'],

                                    ];
                                    let index = params.dataIndex;
                                    if (params.dataIndex >= colorList.length) {
                                        index = params.dataIndex - colorList.length;
                                    }
                                    return colorList[index][1];
                                },

                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: '{c}',
                                    textStyle: {
                                        fontWeight: 'normal',
                                        fontSize: 12,
                                        color: "#fff"
                                    }
                                },
                            }
                        }
                    }
                ]
            }
            myChart.setOption(option);
            let obj = {
                mac: 'wuji'
            }
            myChart.showLoading();
            this.$axios.post("/api/DDC/DeviceWorkStatic/WorkLoadView" + utils.formatQueryStr(obj)).then(res => {
                myChart.hideLoading();
                console.log(res);
                myChart.setOption({
                    series: [{
                        data: [res.month, res.week, res.today]
                    }]
                })
            }).catch(error => {

            })


        },
        //当月报警排名
        initEchartBar3() {
            let myChart = this.$echarts.init(document.getElementById('echarts-bar2'));
            // 绘制图表
            myChart.setOption({
                color: ['#3398DB'],
                grid: {
                    left: '0%',
                    bottom: '3%',
                    top: "5%",
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                yAxis: [
                    {
                        // show: false,
                        type: 'value',
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#fff'
                            },
                        }
                    }
                ],
                xAxis: [
                    {
                        // name: '工位',
                        type: 'category',
                        data: [],
                        axisTick: {
                            alignWithLabel: true
                        },

                        axisLine: {
                            lineStyle: {
                                color: '#ddd', // 颜色
                                width: 1 // 粗细
                            }
                        },
                        axisLabel: {
                            interval: 0,
                            show: true,
                            textStyle: {
                                color: '#fff'
                            },
                            rotate: 300 //倾斜角度
                        },
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        barWidth: '40%',
                        data: []
                    }
                ]
            });
            let arr = utils.CurrentMonthFirstAndLast();
            let obj = {
                mac: "wuji",
                begindate: arr[0],
                enddate: arr[1],
            }
            myChart.showLoading();
            this.$axios.post("/api/DDC/DeviceWorkStatic/WarnCRank" + utils.formatQueryStr(obj)).then(res => {
                myChart.hideLoading();
                let data1 = [];
                let data2 = [];
                for (let i = 0; i < 7; i++) {
                    data1.push(res[i].F_NAME.substr(8, res[i].F_NAME.length - 1));
                    data2.push(res[i].F_WARNC);
                }
                myChart.setOption({
                    xAxis: {
                        data: data1
                    },
                    series: [{
                        data: data2
                    }]
                })
            }).catch(error => {

            })

        },
        //加工时长
        initEchartBar4() {
            let myChart = this.$echarts.init(document.getElementById('echarts-bar3'));
            // 绘制图表
            let option = {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                grid: {
                    left: '0%',
                    bottom: '3%',
                    top: "5%",
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        axisTick: {
                            alignWithLabel: true
                        },

                        axisLine: {
                            lineStyle: {
                                color: '#ddd', // 颜色
                                width: 1 // 粗细
                            }
                        },
                        axisLabel: {
                            interval: 0,
                            show: true,
                            textStyle: {
                                color: '#fff'
                            },
                            rotate: 300 //倾斜角度
                        },
                    }
                ],
                // dataZoom: [
                //     {
                //         id: 'dataZoomX',
                //         type: 'slider',
                //         start: 0,
                //         end: 30,
                //     }
                // ],
                yAxis: [
                    {
                        show: true,
                        type: 'value',
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#fff'
                            },
                        }
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        barWidth: '40%',
                        data: [10, 52, 200, 334, 390, 330, 220]
                    }
                ]
            }
            myChart.setOption(option);


            myChart.showLoading();
            let arr = utils.CurrentMonthFirstAndLast();


            this.$axios.post("/newApi/wuji/Device/AvgWorkDuration",
                {
                    "device": {
                        "id": "wuji"
                    },
                    "date_period": {
                        "start_date": arr[0],
                        "end_date": arr[1]
                    }

                }).then(res => {
                    myChart.hideLoading();
                    res.sort((a, b) => {
                        return b["avg_workduration"] - a["avg_workduration"];
                    })

                    let data1 = [];
                    let data2 = [];
                    for (let i = 0; i < 7; i++) {
                        data1.push(res[i].name.substr(8, res[i].name.length - 1));
                        data2.push(res[i].avg_work_duration);
                    }
                    console.log(data1);
                    console.log(data2);

                    myChart.setOption({
                        xAxis: {
                            data: data1
                        },
                        series: [{
                            data: data2
                        }]
                    })


                }).catch(error => {

                })
        },
        //设备在线率
        initEchartLine() {
            let myChart = this.$echarts.init(document.getElementById('echarts-line'));
            let option = {
                grid: {
                    left: '0%',
                    bottom: '3%',
                    top: "5%",
                    containLabel: true
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                xAxis: {
                    type: 'category',
                    data: [],
                    axisLabel: {
                        interval: 0,
                        show: true,
                        textStyle: {
                            color: '#fff'
                        },
                        rotate: 300 //倾斜角度
                    },
                    axisTick: {
                        alignWithLabel: true
                    },

                    axisLine: {
                        lineStyle: {
                            color: '#ddd', // 颜色
                            width: 1 // 粗细
                        }
                    },
                },
                yAxis: {
                    // show: false,
                    type: 'value',
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                        show: true,
                        interval: "auto",
                        formatter: "{value}%"
                    },
                },
                series: [{
                    data: [],
                    type: 'line'
                }]
            };
            myChart.setOption(option);


            let arr = utils.getDay(-7);
            let obj = {
                mac: 'wuji',
                begindate: arr[0],
                enddate: arr[1],
            }
            myChart.showLoading();
            this.$axios.post("/api/DDC/DeviceWorkStatic/WorkStatLine" + utils.formatQueryStr(obj)).then(res => {
                myChart.hideLoading();
                let data1 = [];
                let data2 = [];
                res.forEach((item, index) => {

                    data1.push(item.f_date.substr(5, 10));
                    data2.push(item.F_ONLINERATE);
                })

                myChart.setOption({
                    xAxis: {
                        data: data1,
                    },
                    series: [{
                        data: data2
                    }]
                })
            }).catch(error => {

            })
        },
        //报警类型占比
        initEchartPie() {
            let myChart = this.$echarts.init(document.getElementById('echarts-pie'));
            let option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    // show: true,
                    type: 'scroll',
                    orient: 'vertical',
                    right: 0,
                    itemWidth: 15,
                    itemHeight: 10,


                    textStyle: { color: " #fff", fontSize: 11 },
                    pageIconColor: '#fff',
                    pageIconSize: 12,
                    pageTextStyle: {
                        color: "#fff",
                        fontSize: 12
                    },
                    data: []
                },
                grid: {
                },
                series: [
                    {
                        name: '设备报警数',
                        type: 'pie',
                        radius: ['30%', '50%'],
                        // radius: "50%",
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'left'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '16',
                                fontWeight: 'bold'
                            }
                        },
                        // labelLine: {
                        //     show: false
                        // },
                        data: []
                    }
                ]
            };
            myChart.setOption(option);

            let obj = {
                mac: "wuji",
                datestr: utils.getDay(0)[0],
            }
            myChart.showLoading();
            this.$axios.post("/api/DDC/DeviceWorkStatic/DayWarnDis" + utils.formatQueryStr(obj)).then(res => {
                myChart.hideLoading();
                let data1 = [];
                let data2 = [];
                res.forEach((item, index) => {
                    data1.push(item.F_ERRORN);
                    data2.push({
                        value: item.F_ERRORC,
                        name: item.F_ERRORN
                    })
                })
                myChart.setOption({
                    legend: {
                        data: data1
                    },
                    series: [
                        {
                            data: data2
                        }
                    ]
                });


            }).catch(error => { }
            )

        },
        //获取设备当前页面需要数据
        getData() {
            let that = this;
            // this.$axios.post("/api/DDC/DeviceWorkStatic/OnLineStat?mac=wuji").then(res => {
            //     this.onlineNum = res[0].onlinenum;
            //     this.outlineNum = res[0].offlinenum;
            // }).catch(error => {

            // })
            let obj = {
                mac: "wuji",
                datestr: utils.getDay(0)[0],
            }
            this.axios.all([
                this.$axios.post('/api/DDC/DeviceWorkStatic/OnLineStat?mac=wuji'),
                this.$axios.post('/api/DDC/DeviceWorkStatic/LstWarnList?mac=wuji'),
                this.$axios.post("/api/DDC/DeviceWorkStatic/DayDevActRank" + utils.formatQueryStr(obj)),
                this.$axios.post("/api/DDC/DeviceWorkStatic/DayWorkLoadRank?mac=wuji"),
            ]).then(this.axios.spread(function (OnLineStat, LstWarnList, DayDevActRank, DayWorkLoadRank) {

                //升排序
                DayWorkLoadRank.sort((a, b) => {
                    return a.F_NAME.substr(10, a.F_NAME.length - 1) - b.F_NAME.substr(10, b.F_NAME.length - 1);
                })
                //web

                that.DayWorkLoadRank = DayWorkLoadRank;

                //OnLineStat 设备在线数, LstWarnList 设备实时报警内容
                that.onlineNum = OnLineStat.onlinenum;
                that.outlineNum = OnLineStat.offlinenum;
                // that.number = alarmInformation[0].f_name;
                let alarmInformation = [];
                //整理
                LstWarnList.forEach((item, index) => {
                    alarmInformation[index] = {};
                    alarmInformation[index].date = item.F_CT.split(" ")[0];
                    alarmInformation[index].time = item.F_CT.split(" ")[1];
                    alarmInformation[index].alarmContent = item.F_ERROR;
                    alarmInformation[index].deviceId = item.F_DEVICEID;
                    alarmInformation[index].name = item.f_name.substr(10, item.f_name.length - 1);

                })

                if (alarmInformation.length > 4) {
                    that.alarmInformation = alarmInformation.slice(0, 3);
                }
                else {
                    that.alarmInformation = alarmInformation;
                }

                let averageYield = 0;

                DayDevActRank.forEach((item, index) => {
                    averageYield += item.ACTRATE;
                })
                that.averageYield = averageYield / 13;

                that.number = that.alarmInformation[0].name;

            })).catch(error => {

            });


        },


    },
    updated() {

        console.log('ssssssssssssssss');
        console.log(window.innerWidth);
        console.log(window.screen.availWidth);
    },
    mounted() {
        let that = this;
        this.getData();
        this.$nextTick(res => {
            this.initEchartBar();
            this.initEchartBar2();
            this.initEchartBar3();
            this.initEchartBar4();
            this.initEchartLine();
            this.initEchartPie();
        })
        this.init();
        this.helper();
        this.animate();



        window.onresize = () => {

            return this.onWindowResize();
        }
        this.$socketApi.sendSock((res) => {
            console.log(6);
            // this.locationArray = JSON.parse(res[this.deviceId][0].value);
        });




        setInterval(() => {
            if (window.innerWidth != window.screen.availWidth) {
                this.flag = true;
            }
            if (window.innerWidth == window.screen.availWidth && this.flag) {
                this.flag = false;
                this.onWindowResize();
            }
        }, 500)



        // alert(window);
    },

    destroyed() {
        //页面销毁时删除场景
        this.scene.children = {};
        this.renderer.dispose();
        // socketApi.websock.close();

    },


}
</script>


<style lang='scss' scoped>
// @import "../scss/index.scss";
</style>