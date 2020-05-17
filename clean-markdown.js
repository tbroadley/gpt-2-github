const filter = require("unist-util-filter");

module.exports = () => (tree, file) =>
  filter(tree, { cascade: false }, (node) => node.type !== "code");
