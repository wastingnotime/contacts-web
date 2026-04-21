import { createJSXDecorator } from "storybook-solidjs-vite";

import "../src/client/styles.css";

export const decorators = [
  createJSXDecorator((Story) => (
    <main class="app-shell">
      <Story />
    </main>
  )),
];

export const parameters = {
  layout: "fullscreen",
};
