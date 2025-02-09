import {
  DEFAULT_VANILLA_CODESANDBOX,
  DEFAULT_REACT_CODESANDBOX,
  DEFAULT_ANGULAR_CODESANDBOX,
  DEFAULT_SVELTE_CODESANDBOX,
  DEFAULT_VUE_CODESANDBOX,
} from "storybook-addon-preview";
import {
  convertVanillaTemplate, convertPath, convertTemplate,
  convertSvelteTemplate, convertVueTemplate, convertAngularTemplate,
} from "../utils";

export function getPreview(folderName: string, fileName: string, {
  htmlCode = require(`!!raw-loader!./default.html`).default,
  cssCode = require(`!!raw-loader!./default.css`).default,
  vanillaCode = require(`!!raw-loader!../${folderName}/apps/Vanilla${fileName}App`).default,
} = {}) {
  const reactCode = require(`!!raw-loader!../../packages/react-grid/stories/${folderName}/apps/React${fileName}App`).default;
  let ngxComponentCode = require(`!!raw-loader!../../packages/ngx-grid/stories/${folderName}/apps/Ngx${fileName}App/app.component.ts`).default;

  ngxComponentCode = ngxComponentCode.replace(/"(.+)\.css"/g, `"./app.component.css"`);
  const ngxHTMLCode = require(`!!raw-loader!../../packages/ngx-grid/stories/${folderName}/apps/Ngx${fileName}App/app.component.html`).default;
  const ngxModuleCode = require(`!!raw-loader!../../packages/ngx-grid/stories/apps/default/app.module.ts`).default;
  const vueCode = require(`!!raw-loader!../../packages/vue-grid/stories/${folderName}/apps/Vue${fileName}App.vue`).default;
  const svelteCode = require(`!!raw-loader!../../packages/svelte-grid/stories/${folderName}/apps/Svelte${fileName}App.svelte`).default;

  return [
    {
      tab: "HTML",
      template: htmlCode,
      language: "html",
      codesandbox: DEFAULT_VANILLA_CODESANDBOX(["@egjs/grid"]),
      copy: true,
    },
    {
      tab: "CSS",
      template: cssCode,
      language: "css",
    },
    {
      tab: "Vanilla",
      template: convertVanillaTemplate(convertPath(vanillaCode, "src", "@egjs/grid")),
      language: "tsx",
      codesandbox: DEFAULT_VANILLA_CODESANDBOX(["@egjs/grid"]),
      copy: true,
    },
    {
      tab: "React",
      template: convertTemplate(convertPath(reactCode, "src", "@egjs/react-grid")),
      language: "tsx",
      codesandbox: DEFAULT_REACT_CODESANDBOX(["@egjs/react-grid"]),
      copy: true,
    },
    {
      tab: "Angular",
      template: convertTemplate(convertPath(ngxHTMLCode, "src", "@egjs/ngx-grid")),
      language: "tsx",
      description: "app.component.html",
      codesandbox: DEFAULT_ANGULAR_CODESANDBOX(["@egjs/ngx-grid"]),
      copy: true,
    },
    {
      tab: "Angular",
      template: convertAngularTemplate(convertPath(ngxComponentCode, "src", "@egjs/ngx-grid")),
      language: "tsx",
      description: "app.component.ts",
      codesandbox: DEFAULT_ANGULAR_CODESANDBOX(["@egjs/ngx-grid"]),
      copy: true,
    },
    {
      tab: "Angular",
      template: convertTemplate(convertPath(ngxModuleCode, "src", "@egjs/ngx-grid")),
      language: "tsx",
      description: "app.module.ts",
      codesandbox: DEFAULT_ANGULAR_CODESANDBOX(["@egjs/ngx-grid"]),
      copy: true,
    },
    {
      tab: "Vue",
      template: convertVueTemplate(convertPath(vueCode, "src", "@egjs/vue-grid")),
      language: "html",
      codesandbox: DEFAULT_VUE_CODESANDBOX(["@egjs/vue-grid"]),
      copy: true,
    },
    {
      tab: "Svelte",
      template: convertSvelteTemplate(convertPath(svelteCode, "src", "@egjs/svelte-grid"), cssCode),
      language: "html",
      codesandbox: DEFAULT_SVELTE_CODESANDBOX(["@egjs/svelte-grid"]),
      copy: true,
    },
  ];
}
