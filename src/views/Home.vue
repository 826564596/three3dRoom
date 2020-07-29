<template>
    <div class="div">
        <!-- 3D场景 -->
        <div id="container" @click="click($event)" @dblclick="doubleClick($event)" @mousemove.prevent="move($event)" @mousedown.prevent="down($event)" @mouseup.prevent="up($event)">
        </div>

    </div>
</template>

<script>
import * as Three from "three";
import { OBJLoader, MTLLoader } from 'three-obj-mtl-loader';
import OrbitControls from "three/examples/js/controls/OrbitControls";
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader";

import { HDRLoader, HDRCubeTextureLoader } from "three/examples/jsm/loaders/HDRCubeTextureLoader";
// import FirstPersonControls from "three/examples/js/controls/FirstPersonControls";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
export default {
    data() {
        return {
            camera: null,//相机
            scene: null,//场景
            renderer: null,//渲染器
            composer: null,//后期处理
            mesh: null,//网格模型
            publicPath: process.env.VUE_APP_URL,//资源路径
            container: null,
            controls: null,//控制器
            leftPress: false,//鼠标按下标志
        }
    },
    methods: {
        /**初始化 场景 相机 渲染器 灯光 控制器 模型 */
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

            // this.definedComposer();
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
        },

        /**控制器 */
        initControls() {
            this.controls = new Three.OrbitControls(this.camera, this.renderer.domElement); //创建控件对象
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
        },
        /**添加环境 */
        createEnvironment() {

            // this.scene.background = new Three.TextureLoader()
            //     .load(require("../assets/image/bg.jpg"));

        },
        /**场景中的内容 */
        initContent() {
            let that = this;
            this.createFloor();
            this.createEnvironment();

            // 加载平台
            let mtlLoader = new MTLLoader();
            mtlLoader.load(`${that.publicPath}/model/ssss.mtl`, function (materials1) {
                let objLoader = new OBJLoader();
                objLoader.setMaterials(materials1);
                objLoader.load(`${that.publicPath}/model/ssss.obj`, function (obj) {

                    // let texture1 = new TGALoader().load(`${that.publicPath}/model/crate_color8.tga`);
                    // let texture2 = new TGALoader().load(`${that.publicPath}/model/crate_grey8.tga`);

                    // let texture1 = new TGALoader().load(`${that.publicPath}/model/dimian_t.tga`);
                    // let texture2 = new TGALoader().load(`${that.publicPath}/model/J_N.tga`);
                    let texture3 = new TGALoader().load(`${that.publicPath}/model/J_T01_看图王(3).tga`);
                    console.log(texture3);
                    obj.traverse(function (child) {

                        if (child instanceof Three.Mesh) {
                            //将贴图赋于材质
                            child.material.map = texture3;
                            //重点，没有该句会导致PNG无法正确显示透明效果
                            child.material.transparent = true;
                        }
                    });
                    that.addobj(obj);
                })
            })
        },
        /** 添加obj到场景中 */
        addobj(obj) {
            console.log(obj);
            obj.position.z = 0;
            obj.position.x = 0;
            // obj.rotation.y = -0.5 * Math.PI;
            this.scene.add(obj);
        },
        /** 动画函数 */
        animate() {
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
            // this.composer.render();//后期

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

        },
        /** 鼠标单击事件 */
        click() {

        },
        /** 鼠标双击事件 */
        doubleClick() {

        },
        /** 鼠标移动事件 */
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
        /** 键盘按下事件 */
        down() {

        },
        /** 键盘升起事件 */
        up() {
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
    },
    mounted() {
        this.init();
        this.helper();
        this.animate();

    },
    destroyed() {
        //页面销毁时删除场景
        this.scene.children = {};
        this.renderer.dispose();

    },
};
</script>
<style lang="scss">
@import "../scss/index.scss";
</style>
