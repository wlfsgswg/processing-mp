const state = {
  globalInfo: {},
  userInfo: {},
  json: [],
};
const getters = {
  globalInfo: (store) => () => store.globalInfo,
  userInfo: (store) => () => store.userInfo,
};

const mutations = {
  setGlobalInfo(state, value) {
    state["globalInfo"] = { ...state["globalInfo"], ...value };
  },
  setUserInfo(state, value) {
    state["userInfo"] = { ...state["userInfo"], ...value };
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
};
