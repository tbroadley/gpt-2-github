const filter = require("unist-util-filter");

module.exports = () => (tree, file) => {
  console.error(tree);
  return filter(tree, (node) => node.type === "code");
};
