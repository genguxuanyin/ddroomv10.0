import Cookies from 'js-cookie'
import Vue from 'vue'
import designer from '../../components/three/Designer'
import TYPES from '../../components/three/types'

const state = {
  subSideHouseType: [{
    title: '自由绘制',
    hasState: true, // 有状态
    children: [{
      icon: 'my',
      title: '画墙',
      param: {
        opState: 'drawSequence'
      },
      command: ['changeState', 'resetWall'],
      isActive: true
    }, {
      icon: 'my',
      title: '矩形画墙',
      param: {
        opState: 'drawBox'
      },
      command: ['changeState', 'resetWall'],
      isActive: false
    }, {
      icon: 'my',
      title: '自由建模',
      param: {
        opState: 'free'
      },
      command: 'changeState',
      isActive: false
    }]
  }, {
    title: '从形状绘制',
    children: [{
      icon: 'my',
      isActive: true
    }, {
      icon: 'my',
      isActive: false
    }, {
      icon: 'my',
      isActive: false
    }, {
      icon: 'my',
      isActive: false
    }, {
      icon: 'my',
      isActive: false
    }, {
      icon: 'my',
      isActive: false
    }]
  }, {
    title: '结构部件',
    hasState: true, // 有状态
    children: [{
      icon: 'my',
      title: '柱子',
      param: {
        opState: 'drawPillar'
      },
      command: ['changeState', 'resetWall'],
      isActive: false
    }, {
      icon: 'my',
      title: '地台',
      param: {
        opState: 'drawPlat'
      },
      command: ['changeState', 'resetWall'],
      isActive: false
    }, {
      icon: 'my',
      title: '横梁',
      param: {
        opState: 'drawGirde'
      },
      command: ['changeState', 'resetWall'],
      isActive: false
    }]
  }, {
    title: '门窗',
    children: [{
      icon: 'my',
      title: '单开门',
      isActive: true
    }, {
      icon: 'my',
      title: '双开门',
      isActive: false
    }, {
      icon: 'my',
      title: '推拉门',
      isActive: false
    }, {
      icon: 'my',
      title: '矩形窗',
      isActive: false
    }, {
      icon: 'my',
      title: '落地窗',
      isActive: false
    }, {
      icon: 'my',
      title: '飘窗',
      isActive: false
    }]
  }],
  views: [{
    title: '2D',
    name: '2d',
    param: {
      viewState: 'two'
    },
    icon: '',
    isActive: false
  }, {
    title: '3D',
    name: '3d',
    param: {
      viewState: 'three'
    },
    icon: '',
    isActive: true
  }, {
    title: 'FV',
    name: 'fv',
    param: {
      viewState: 'fv'
    },
    icon: '',
    isActive: false
  }],
  rightBar: [{
    title: '导视图',
    icon: 'guidesView',
    hidden: false,
    isActive: false
  }, {
    title: '效果图',
    icon: 'render',
    hidden: false,
    isActive: false
  }, {
    title: '快照',
    icon: 'camera',
    hidden: false,
    isActive: false
  }],
  size: []
}

const mutations = {
  SUB_SIDE_HOUSE_TYPE_RESET(state) {
    var lists = state['subSideHouseType'];
    lists.forEach((l) => {
      if (Array.isArray(l.children)) {
        l.children.forEach((c) => {
          c.isActive = false;
        })
      }
    })
  },
  SUB_SIDE_HOUSE_TYPE_CHANGE(state, {
    i,
    ci
  }) {
    var lists = state['subSideHouseType'];
    lists[i].children[ci].isActive = true;
    designer.event.dispatchEvent({
      type: TYPES['menu-click'],
      command: lists[i].children[ci].command,
      param: lists[i].children[ci].param
    });
  },
  TOGGLE_DEVICE(state, device) {
    state.device = device
  },
  VIEWS_RESET(state) {
    var views = state['views'];
    views.forEach((v) => {
      v.isActive = false;
    })
  },
  VIEWS_CHANGE(state, {
    i
  }) {
    var views = state['views'];
    views[i].isActive = true;
    designer.event.dispatchEvent({
      type: TYPES['menu-click'],
      command: ['changeView', 'changeState', 'resetWall'],
      param: views[i].param
    });
  },
  RIGHT_BAR_CHANGE(state, {
    i
  }) {
    var rightBar = state['rightBar'];
    rightBar[i];
  },
  NAV_BAR_CHANGE(state, {
    command
  }) {
    designer.event.dispatchEvent({
      type: TYPES['menu-click'],
      command
    });
  },
  SIZE_RESET(state) {
    state['size'] = [];
  },
  SIZE_ADD(state, {
    s
  }) {
    var size = state['size'];
    size.push(s);
  },
  SIZE_CHANGE(state, payload) {
    state['size'] = payload;
  },
  SIZE_CHANGE_EDIT(state, i) {
    Vue.set(state['size'][i], 'edit', false);
  },
  SIZE_ENTER(state, payload) {
    designer.event.dispatchEvent({
      type: TYPES['menu-click'],
      command: ['sizeEnter'],
      param: [state['size']]
    });
  }
}

const actions = {
  subSideHouseTypeListsReset({
    commit
  }) {
    commit('SUB_SIDE_HOUSE_TYPE_RESET')
  },
  subSideHouseTypeListsChange({
    commit
  }, payload) {
    commit('SUB_SIDE_HOUSE_TYPE_RESET')
    commit('SUB_SIDE_HOUSE_TYPE_CHANGE', payload)
  },
  toggleDevice({
    commit
  }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  viewsChange({
    commit
  }, payload) {
    commit('VIEWS_RESET')
    commit('VIEWS_CHANGE', payload)
  },
  rightBarChange({
    commit
  }, payload) {
    commit('RIGHT_BAR_CHANGE', payload)
  },
  navBarChange({
    commit
  }, payload) {
    commit('NAV_BAR_CHANGE', payload)
  },
  sizeReset({
    commit
  }) {
    commit('SIZE_RESET')
  },
  sizeAdd({
    commit
  }, payload) {
    commit('SIZE_ADD', payload)
  },
  sizeChange({
    commit
  }, payload) {
    commit('SIZE_CHANGE', payload)
  },
  sizeChangeEdit({
    commit
  }, i) {
    commit('SIZE_CHANGE_EDIT', i)
  },
  sizeEnter({
    commit
  }, payload) {
    commit('SIZE_ENTER', payload)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
