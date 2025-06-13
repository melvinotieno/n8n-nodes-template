import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("n8n-node", {
    description: "Generate a new n8n node",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the node to create?",
        validate: (input: string) => {
          if (!input) {
            return "Node name is required";
          }

          // Check if the input contains invalid characters
          if (/[\s.]/.test(input)) {
            return "Node name must not contain spaces or periods";
          }

          return true;
        },
      },
      {
        type: "confirm",
        name: "credentials",
        message: "Does this node require credentials?",
        default: false,
      },
    ],
    actions: function (data) {
      const actions: PlopTypes.Actions = [
        {
          type: "add",
          path: "{{ turbo.paths.root }}/packages/{{ pascalCase name }}/{{ pascalCase name }}.node.ts",
          templateFile: "templates/node.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/packages/{{ pascalCase name }}/tsconfig.json",
          templateFile: "templates/tsconfig.hbs",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/packages/{{ pascalCase name }}/package.json",
          templateFile: "templates/package.hbs",
        },
      ];

      if (data?.credentials) {
        actions.push({
          type: "add",
          path: "{{ turbo.paths.root }}/packages/{{ pascalCase name }}/{{ pascalCase name }}.credentials.ts",
          templateFile: "templates/credentials.hbs",
        });

        actions.push({
          type: "modify",
          path: "{{ turbo.paths.root }}/packages/package.json",
          pattern: /"credentials": \[/, // Match the "credentials array"
          template: `"credentials": [\n      "{{ pascalCase name }}/dist/{{ pascalCase name }}.credentials.js",`,
        });
      }

      actions.push({
        type: "modify",
        path: "{{ turbo.paths.root }}/packages/package.json",
        pattern: /"nodes": \[/, // Match the "nodes array"
        template: `"nodes": [\n      "{{ pascalCase name }}/dist/{{ pascalCase name }}.node.js",`,
      });

      return actions;
    },
  });
}
