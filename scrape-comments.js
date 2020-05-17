const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");
const fs = require("fs");
const max = require("lodash/max");
const shuffle = require("lodash/shuffle");
const remark = require("remark");

const cleanMarkdown = require("./clean-markdown");

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

octokit.hook.wrap("request", async (request, options) => {
  const file = `./.cache/${options.url
    .replace("https://api.github.com/", "")
    .replace(/\//g, "-")}`;
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file));
  } else {
    const response = await request(options);
    fs.writeFileSync(file, JSON.stringify(response));
    return response;
  }
});

go();

async function getComments(repo) {
  try {
    return await octokit.paginate(
      octokit.pulls.listCommentsForRepo,
      {
        owner: process.env.OWNER,
        repo,
        since: process.env.SINCE,
      },
      (response) => {
        console.error(
          `Got comments for ${repo} up to ${max(
            response.data.map((comment) => comment.created_at)
          )}`
        );
        return response.data.filter(
          (comment) =>
            comment.user && comment.user.login == process.env.USER_LOGIN
        );
      }
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function cleanComment(comment) {
  const commentBody = comment.body;
  const result = await remark().use(cleanMarkdown).process(commentBody);
  return result.contents;
}

async function go() {
  const comments = (
    await Promise.all(process.env.REPOS.split(",").map(getComments))
  ).flat();
  const cleanedComments = await Promise.all(comments.map(cleanComment));
  const shuffledCommentText = shuffle(cleanedComments).join("\n");

  console.log(shuffledCommentText);
}
