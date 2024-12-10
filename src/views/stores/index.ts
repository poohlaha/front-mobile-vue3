/**
 * 导出所有Store
 */
import homeStore from "./home";
import { createStore } from "vuex";

export default createStore({
  modules: {
    home: homeStore,
  },
});
