import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    //存放数据
    state: {
        percent: 0,
    },
    getters: {
        percent(state) {
            return state.percent;
        },
    },
    mutations: {
        addPercent(state, num) {
            state.percent += num;
        },
    },
    actions: {},
    modules: {},
});
