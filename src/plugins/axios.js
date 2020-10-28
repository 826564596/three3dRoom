"use strict";
/**
 *  封装axios拦截器
 *
 */
import axios from "axios";

// 创建axios实例
const service = axios.create({
    // baseURL: process.env.VUE_APP_URL,
    timeout: 5000, // 请求超时时间
});

//request请求拦截器
service.interceptors.request.use(
    (config) => {
        // console.log(config);
        return config;
    },
    (error) => {
        // Do something with request error
        // console.log(error); // for debug
        Promise.reject(error);
    }
);

// response响应拦截器
service.interceptors.response.use(
    (response) => {
        //替换换行符
        if (typeof response.data == "string") {
            response.data = response.data.replace(/\n/g, "    ");
            response.data = JSON.parse(response.data);
        }
        return response.data;
    },
    (error) => {
        console.log(error);
        // 请求失败回调
        // Message({
        //   message: error.message,
        //   type: 'error',
        //   duration: 5 * 1000
        // })
        //
        alert("接口访问失败");
        return Promise.reject(error);
    }
);

export default service;
