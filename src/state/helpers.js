import { mapState, mapGetters, mapActions } from 'vuex'

export const authComputed = {
  ...mapState('auth', {
    currentUser: (state) => state.currentUser,
    modalPassword : (state) => state.modalPassword,

  }),
  ...mapGetters('auth', ['loggedIn']),
}

export const layoutComputed = {
  ...mapState('layout', {
    layoutType: (state) => state.layoutType,
    sidebarSize: (state) => state.sidebarSize,
    layoutWidth: (state) => state.layoutWidth,
    topbar: (state) => state.topbar,
    mode: (state) => state.mode,
    position: (state) => state.position,
    sidebarView: (state) => state.sidebarView,
    sidebarColor: (state) => state.sidebarColor,
    sidebarImage: (state) => state.sidebarImage
  })
}

export const authMethods = mapActions('auth', ['logIn', 'logOut', 'register', 'resetPassword', 'showModalPassword', 'changePassword'])

export const layoutMethods = mapActions('layout', 
['changeLayoutType', 'changeLayoutWidth', 'changeSidebarSize', 'changeTopbar', 'changeMode', 'changePosition', 'changeSidebarView',
 'changeSidebarColor','changeSidebarImage','changePreloader'])

export const authFackMethods = mapActions('authfack', ['login', 'registeruser', 'logout'])

export const notificationMethods = mapActions('notification', ['success', 'error', 'clear'])

export const todoComputed = {
  ...mapState('todo', {
    todos: (state) => state.todos
  })
}
export const todoMethods = mapActions('todo', ['fetchTodos'])

export const crudMethods = mapActions('crud', [
  'insertData',
  'updateData',
  'updateDataPost',
  'getData',
  'listData',
  'deleteData',
  'cariData',
  'downloadData',
  'downloadDataPost',
  'uploadFormData',
  'postFormData',
  'putFormData'
])

export const pageComputed = {
  ...mapState('page', {
    contentToast: (state) => state.contentToast,

  }),
  ...mapGetters('page', ['getContentToast']),
}

export const pageMethods = mapActions('page', [
  'setContentToast'
])