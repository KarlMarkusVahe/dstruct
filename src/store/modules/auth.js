import { axiosInstance as axios} from "@/plugins/axios";

const state = {
    user: null,
    isAuthenticated: false
};

const mutations = {
    setStatus(state, { userData, isAuthenticated }) {
        state.user = userData;
        state.isAuthenticated = isAuthenticated;
    },
    unSetStatus(state) {
        state.user = null;
        state.isAuthenticated = false;
    }
};

const actions = {
    async checkAuthorization({ commit }) {
        try {
            const response = await axios.get('/sessions');
            if (response.status === 200) {
                if (response.data.data) {
                    await actions.authorize({ commit }, { userData: response.data.data, isAuthenticated: true });
                    console.log(state.user);
                    return;
                }
            }

            await actions.unAuthorize({ commit });
        } catch (error) {
            console.error('Error checking authorization:', error);
            await actions.unAuthorize({ commit });
        }
    },
    async authorize({ commit }, { userData, isAuthenticated }) {
        try {
            commit('setStatus', { userData, isAuthenticated });
            localStorage.setItem('user', JSON.stringify(userData));
            console.log(userData);
            localStorage.setItem('isAuthenticated', isAuthenticated);
            return Promise.resolve(); // Resolve the promise if everything is successful
        } catch (error) {
            return Promise.reject(error); // Reject the promise if there's an error
        }
    },
    async unAuthorize({ commit }) {
        commit('unSetStatus');
        localStorage.clear();
    }
};

export default {
    state,
    mutations,
    actions
};