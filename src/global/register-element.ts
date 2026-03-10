import type { App } from "vue";

import "element-plus/dist/index.css";
import "element-plus/theme-chalk/base.css";

import { ElInput, ElAutocomplete, ElTabs, ElTabPane, ElButton, ElDialog, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem, ElForm, ElFormItem, ElOption, ElSelect} from "element-plus";

const components = [
    ElInput,
    ElAutocomplete,
    ElTabs,
    ElTabPane,
    ElButton,
    ElDialog,
    ElIcon,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ElForm,
    ElFormItem,
    ElOption,
    ElSelect,
];

export default function registerElements(app: App) {
  for (const component of components) {
    if (component.name) {
      app.component(component.name, component);
    }
  }
  // for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  //     app.component(key, component)
  // }
}
