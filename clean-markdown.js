const filter = require("unist-util-filter");

module.exports = () => (tree, file) => {
  return filter(tree, { cascade: false }, (node) => {
    switch (node.type) {
      case "code":
      case "html":
      case "link":
        return false;
      case "inlineCode":
        return !node.value.match(/\s/);
      case "text":
        return !node.value.match(/https?:\/\//);
      default:
        return true;
    }
  });
};
