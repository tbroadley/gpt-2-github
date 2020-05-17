const { Octokit } = require("@octokit/rest");
const dotenv = require("dotenv");
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
          (comment) => comment.user && comment.user.login == process.env.USER_LOGIN
        );
      }
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function cleanComment(comment) {
  return comment.body.replace('\r\n', '\n');
}

async function go() {
  const comments = (await Promise.all(process.env.REPOS.split(',').map(getComments))).flat();
  const cleanedComments = await Promise.all(comments.map(cleanComment));
  const shuffledCommentText = shuffle(cleanedComments).join("\n\n");

  console.log(shuffledCommentText);
}
