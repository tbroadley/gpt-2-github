const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");
const max = require("lodash/max");
const shuffle = require("lodash/shuffle");

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });

go();

async function go() {
  let response;
  try {
    response = await octokit.paginate(
      octokit.pulls.listCommentsForRepo,
      {
        owner: "Faire",
        repo: "backend",
        since: "2020-05-01",
      },
      (response) => {
        console.error(
          `Got response: ${max(
            response.data.map((comment) => comment.created_at)
          )}`
        );
        return response.data.filter(
          (comment) => comment.user.login == "tbroadley"
        );
      }
    );
  } catch (e) {
    console.error(e);
    return;
  }

  const commentBodies = response.map((comment) =>
    comment.body.replace("\r", "")
  );
  const shuffledCommentText = shuffle(commentBodies).join("\n\n");

  console.log(shuffledCommentText);
}
