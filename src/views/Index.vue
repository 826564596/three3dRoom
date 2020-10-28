<template>
    <div id="container" class="index">
        <div v-show="start == false" style="width:100%;height:100%;">
            <el-progress v-if="percent < 100" class="percent" type="circle" :percentage="percent"></el-progress>
            <template v-if="percent >= 100 && start == false">

                <img v-if="ifMobile" v-on:click="showIframe" class="percent" src="../assets/image/start-s.png" style="width: 160px;">
                <img v-else v-on:click="showIframe" class="percent" src="../assets/image/start.png" style="width: 80px;">
            </template>
        </div>
        <iframe id="iframe" :src="`/mu`"></iframe>
    </div>
</template>

<script>
let ifMobile = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
export default {
    data() {
        return {
            percent: 0,
            ifMobile: ifMobile,
            start: false,
            publicPath: process.env.VUE_APP_URL,
        }
    },
    methods: {
        getPercent() {
            let iframe = document.getElementById("iframe").contentWindow
            let interval = setInterval(() => {
                if (!iframe) return
                if (!iframe.document.getElementById("percent")) return
                this.percent = parseInt(iframe.document.getElementById("percent").innerHTML);
                if (this.percent >= 100) clearInterval(interval);
            }, 200)
        },
        showIframe() {
            this.start = true;
            let iframe = document.getElementById('iframe');
            iframe.focus();
        },
        keyboardDown(event) {
            console.log('我是index的 key down')
        },
        keyboardUp(event) {
            console.log('我是index的 key up')
        }
    },
    mounted() {
        document.onkeydown = (event) => {
            this.keyboardDown(event);
        };
        document.onkeyup = (event) => {
            this.keyboardUp(event);
        };

        this.getPercent()
    },
    destroyed() {

    },
    computed: {
        pre() {
            return this.$store.state.percent;
        }
    },


};

</script>
<style>
#iframe {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: white;
    border-width: 0px;
}
</style>

<style lang="scss">
@import "../scss/index.scss";
</style>