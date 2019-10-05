import Cookies from 'js-cookie'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  current: {}
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  CURRENT_RESET: (state) => {
    state.current = {};
  },
  CURRENT_ADD: (state, payload) => {
    for (let i = 0; i < payload.length; i++) {
      state.current[payload[i]] = true;
    }
  },
  CURRENT_REMOVE: (state, payload) => {
    for (let i = 0; i < payload.length; i++) {
      delete state.current[payload[i]];
    }
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  currentReset({ commit }) {
    commit('CURRENT_RESET')
  },
  currentAdd({ commit }, payload) {
    commit('CURRENT_ADD', payload)
  },
  currentRemove({ commit }, payload) {
    commit('CURRENT_REMOVE', payload)
  },
  currentChange({ commit }, payload) {
    commit('CURRENT_RESET')
    commit('CURRENT_ADD', payload)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
