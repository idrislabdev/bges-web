import broker from '../utils/broker'

export const state = {

}

export const mutations = {

}

export const getters = {

}

export const actions = {

  insertData(_, {
    url,
    body
  } = {}) {
    console.log(body)
    return broker.fetch.post(url, body)
      .then(res => {
        return res
      })
  },

  updateData({
    commit,
  }, {
    url,
    body
  } = {}) {
    return broker.fetch.patch(url, body)
      .then(res => {
        return res
      }).catch(err => {
        if (err.response && err.response.status === 401) {
          commit('SET_CURRENT_USER', null)
          window.localStorage.clear();
          alert('Maaf, Session anda telah habis');
          window.location.reload();
        }
        return null
      });
  },

  updateDataPost({
    commit,
  }, {
    url,
    body
  } = {}) {
    return broker.fetch.post(url, body)
      .then(res => {
        return res
      }).catch(err => {
        if (err.response && err.response.status === 401) {
          commit('SET_CURRENT_USER', null)
          window.localStorage.clear();
          alert('Maaf, Session anda telah habis');
          window.location.reload();
        }
        return null
      });
  },

  uploadFormData(_, {
    url,
    body
  } = {}) {
    return broker.fetchFormData.post(url, body)
      .then(res => {
        return res
      })
  },

  postFormData(_, {
    url,
    body
  } = {}) {
    return broker.fetchFormData.post(url, body)
      .then(res => {
        return res
      })
  },

  putFormData(_, {
    url,
    body
  } = {}) {
    return broker.fetchFormData.post(url, body)
      .then(res => {
        return res
      })
  },

  getData({
    commit,
  }, {
    url
  } = {}) {
    return broker.fetch.get(url)
      .then(res => {
        return res
      }).catch(err => {
        if (err.response && err.response.status === 401) {
          commit('SET_CURRENT_USER', null)
          window.localStorage.clear();
          alert('Maaf, Session anda telah habis');
          window.location.reload();
        }
        return null
      });
  },

  listData({
    commit,
  }, {
    url
  } = {}) {
    return broker.fetch.get(url)
      .then(res => {
        return res
      }).catch(err => {
        if (err.response && err.response.status === 401) {
          commit('SET_CURRENT_USER', null)
          window.localStorage.clear();
          alert('Maaf, Session anda telah habis');
          window.location.reload();
        }
        return null
      });
  },

  deleteData(_, {
    url
  } = {}) {
    console
    return broker.fetch.delete(url)
      .then(res => {
        return res
      })
  },

  cariData({
    commit,
  }, {
    url
  } = {}) {
    return broker.fetch.get(url)
      .then(res => {
        if (res.data.data) {
          return res.data.data
        } else {
          return null
        }
      }).catch(err => {
        if (err.response && err.response.status === 401) {
          commit('SET_CURRENT_USER', null)
          window.localStorage.clear();
          alert('Maaf, Session anda telah habis');
          window.location.reload();
        }
        return null
      });
  },

  downloadData({
    commit,
  }, {
    url
  } = {}) {
    return broker.fetch.get(url, {
        responseType: 'blob'
      })
      .then(res => {
        return res
      }).catch(err => {
        if (err.response && err.response.status === 401) {
          commit('SET_CURRENT_USER', null)
          window.localStorage.clear();
          alert('Maaf, Session anda telah habis');
          window.location.reload();
        }
        return null
      });
  },


  downloadDataPost(_, {
    url,
    body
  } = {}) {
    return broker.fetch.post(url, body, {
        responseType: 'blob'
      })
      .then(res => {
        return res
      })
  },

}