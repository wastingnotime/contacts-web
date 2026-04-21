import { createJSXDecorator } from "storybook-solidjs-vite";

import "./preview.css";
import "../src/client/styles.css";

export const decorators = [
  createJSXDecorator((Story) => (
    <div class="storybook-shell">
      <Story />
    </div>
  )),
];

export const parameters = {
  layout: "fullscreen",
};
