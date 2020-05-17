const filter = require("unist-util-filter");

module.exports = () => (tree, file) => {
  return filter(tree, (node) => node.type === "code");
};
