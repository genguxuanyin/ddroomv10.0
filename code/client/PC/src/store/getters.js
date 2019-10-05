const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  current: state => state.app.current,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  subSideHouseType: state => state.menu.subSideHouseType,
  views: state => state.menu.views,
  rightBar: state => state.menu.rightBar
}
export default getters
