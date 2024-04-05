import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://dstruct.vocoprojektid.ee/api/',
    //baseURL: 'http://localhost:3000/api/',
    withCredentials: true, // send cookies with cross-origin requests
    headers: {
        'Content-Type': 'application/json',
    },
});

const axiosPlugin = {
    install(app) {
        // Make Axios instance available globally
        app.config.globalProperties.$http = axiosInstance;
    },
};

export { axiosPlugin, axiosInstance };