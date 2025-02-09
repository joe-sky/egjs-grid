/* eslint-disable import/no-webpack-loader-syntax */
import JustifiedGridApp from "./apps/VueJustifiedGridApp.vue";
import RawJustifiedGridApp from "!!raw-loader!./apps/VueJustifiedGridApp.vue";
import { JUSTIFIED_GRID_CONTROLS } from "../../../../stories/templates/controls";
import { convertPath, convertVueTemplate, makeArgs } from "../../../../stories/utils";
import "../../../../stories/templates/default.css";

export const JustifiedGridTemplate = () => JustifiedGridApp;


JustifiedGridTemplate.storyName = "JustifiedGrid";
JustifiedGridTemplate.argTypes = JUSTIFIED_GRID_CONTROLS;
JustifiedGridTemplate.args = {
  ...makeArgs(JustifiedGridTemplate.argTypes),
};

JustifiedGridTemplate.parameters = {
  preview: [
    {
      tab: "Vue",
      template: convertVueTemplate(convertPath(RawJustifiedGridApp, "src", "@egjs/vue-grid")),
      language: "html",
    },
  ],
};
