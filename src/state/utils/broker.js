import axios from "axios";

var token = window.localStorage.getItem('token');
const CancelToken = axios.CancelToken;
let cancel;

const instance = axios.create({
    baseURL: process.env.VUE_APP_API_ENDPOINT,
    timeout: 100000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    cancelToken: new CancelToken(function executor(c) {
        cancel = c;
    }),
});

const instanceUpload = axios.create({
    baseURL: process.env.VUE_APP_API_ENDPOINT,
    timeout: 200000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    cancelToken: new CancelToken(function executor(c) {
        cancel = c;
    }),
});

const instanceUrlencoded = axios.create({
    baseURL: process.env.VUE_APP_API_ENDPOINT,
    timeout: 100000,
    headers: {
        'Accept': 'application/x-www-form-urlencoded',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
    },
    cancelToken: new CancelToken(function executor(c) {
        cancel = c;
    }),
});

const instanceFormData = axios.create({
    baseURL: process.env.VUE_APP_API_ENDPOINT,
    timeout: 100000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
    },
    cancelToken: new CancelToken(function executor(c) {
        cancel = c;
    }),
});

const checkUserIdentity = () => {
    return instance
        .get('/web/auth/user')
        .then(res => {
            const { status, data } = res;
            if (status === 200) {
                return {
                    status: true,
                    user: data.data,
                }
            } else {
                return {
                    status: false,
                    error: data,
                }
            }
        })
        .catch(err => {
            return {
                status: false,
                error: err,
            }
        });
}

const logoutWebAPI = () => {
    return instance.post('/auth/logout');
}

const setToken = (token) => {
    window.localStorage.setItem('token', token);
    instance.defaults.headers.Authorization = `Bearer ${token}`;
    instanceUrlencoded.defaults.headers.Authorization = `Bearer ${token}`;
    instanceUpload.defaults.headers.Authorization = `Bearer ${token}`;


}

const logout = () => {
    token = null;
    window.localStorage.clear();
    logoutWebAPI();
}

export default {
    fetch: instance,
    fetchUrlEncoded: instanceUrlencoded,
    fetchUpload : instanceUpload,
    fetchFormData: instanceFormData,
    setToken,
    logout,
    checkUserIdentity,
    cancel,
}