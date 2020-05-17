const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");
const concat = require("lodash/concat");
const max = require("lodash/max");
const shuffle = require("lodash/shuffle");

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

go();

async function getComments(repo) {
  try {
    return await octokit.paginate(
      octokit.pulls.listCommentsForRepo,
      {
        owner: "Faire",
        repo,
        since: "2019-02-13",
      },
      (response) => {
        console.error(
          `Got comments for ${repo} up to ${max(
            response.data.map((comment) => comment.created_at)
          )}`
        );
        return response.data.filter(
          (comment) => comment.user && comment.user.login == "tbroadley"
        );
      }
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function go() {
  const comments = concat(await getComments("web-retailer"), await getComments("backend"));

  const commentBodies = comments.map((comment) =>
    comment.body.replace("\r", "")
  );
  const shuffledCommentText = shuffle(commentBodies).join("\n\n");

  console.log(shuffledCommentText);
}
