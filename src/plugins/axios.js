import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5155/api',
    withCredentials: true
});

const axiosPlugin = {
    install(app) {
        app.config.globalProperties.$http = axiosInstance;
    },
};

export { axiosPlugin, axiosInstance };