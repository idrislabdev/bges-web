export const state = {
  pageValue: {
    currentPage: 1,
    qCari: '',
    pageName: '',
  },
  contentToast: '',

}

export const mutations = {
  SET_CONTENT_TOAST(state, data) {
    state.contentToast = data;
  },
}


export const getters = {
  getContentToast(state) {
    return state.contentToast;
  },
}

export const actions = {

  setContentToast({
    commit,
  }, {
    contentToast
  }) {
    commit('SET_CONTENT_TOAST', contentToast)
  },
}