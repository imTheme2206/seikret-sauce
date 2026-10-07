import type { BunPlugin } from "bun";

/** Keep Router's internal import cycles out of Bun's HMR module loader.
 * https://github.com/oven-sh/bun/issues/40248
 * React stays external so the app and Router share the same React instance.
 */
const plugin: BunPlugin = {
  name: "prebundle-tanstack-router",
  setup(build) {
    build.onLoad({ filter: /@tanstack\/react-router\/dist\/esm\/index(?:\.dev)?\.js$/ }, async ({ path }) => {
      const result = await Bun.build({
        entrypoints: [path],
        target: "browser",
        external: ["react", "react/*", "react-dom", "react-dom/*"],
        define: {
          "process.env.NODE_ENV": JSON.stringify(
            process.env.NODE_ENV === "production" ? "production" : "development",
          ),
        },
      });
      if (!result.success) throw new AggregateError(result.logs, "Could not prebundle TanStack Router");
      return { contents: await result.outputs[0]!.text(), loader: "js" };
    });
  },
};

export default plugin;
