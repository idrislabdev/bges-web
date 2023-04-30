import broker from '../utils/broker'
import { getFirebaseBackend } from '../../authUtils.js'

export const state = {
    currentUser: getSavedState('auth.currentUser'),
}

export const mutations = {
    SET_CURRENT_USER(state, newValue) {
        state.currentUser = newValue
        saveState('auth.currentUser', newValue)
    }
}


export const getters = {
    loggedIn(state) {
        return !!state.currentUser
    },
    getUser(state) {
        return state.currentUser
    }
}

export const actions = {
    // This is automatically run in `src/state/store.js` when the app
    // starts, along with any other actions named `init` in other modules.
    // eslint-disable-next-line no-unused-vars
    init({ state, dispatch }) {
        dispatch('validate')
    },

    // Logs in the current user.
    logIn({ commit, dispatch, getters }, { username, password } = {}) {
        if (getters.loggedIn) return dispatch('validate')
    
        return broker.fetch.post('/web/auth/login', {
          username: username,
          password: password,
          password_confirmation: password,
        }).then(res => {
            const {data } = res.data;
            const user = data.user
            const token  = data.token
            broker.setToken(token)
            commit('SET_CURRENT_USER', user)
            return user
        })
    
      },

    // Logs out the current user.
    logOut({ commit }) {
        commit('SET_CURRENT_USER', null)
        window.localStorage.clear();
        window.location.reload();
      },

    // register the user
    register({ commit, dispatch, getters }, { username, email, password } = {}) {
        if (getters.loggedIn) return dispatch('validate')

        return getFirebaseBackend().registerUser(username, email, password).then((response) => {
            const user = response
            commit('SET_CURRENT_USER', user)
            return user
        });
    },

    // register the user
    // eslint-disable-next-line no-unused-vars
    resetPassword({ commit, dispatch, getters }, { email } = {}) {
        if (getters.loggedIn) return dispatch('validate')

        return getFirebaseBackend().forgetPassword(email).then((response) => {
            const message = response.data
            return message
        });
    },

    // Validates the current user's token and refreshes it
    // with new data from the API.
    // eslint-disable-next-line no-unused-vars
    validate({ commit, state }) {
        if (!state.currentUser) return Promise.resolve(null)

        return broker.fetch('/web/auth/user')
        .then(res => {
            const { status } = res;
            if (status === 200) {
            const {data } = res.data;
            const user = data.user
            commit('SET_CURRENT_USER', user)
            return user
            }
        })
        .catch(err => {
        if (err.response && err.response.status === 401) {
            commit('SET_CURRENT_USER', null)
            window.localStorage.clear();
        }
        return null
        });
    },
}

// ===
// Private helpers
// ===
function getSavedState(key) {
    return JSON.parse(window.localStorage.getItem(key))
}
  
function saveState(key, state) {
  window.localStorage.setItem(key, JSON.stringify(state))
    // window.sessionStorage.setItem(key, JSON.stringify(state))
}
