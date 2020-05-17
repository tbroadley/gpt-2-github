const { Octokit } = require("@octokit/rest");
const { throttling } = require("@octokit/plugin-throttling");
const dotenv = require("dotenv");
const fs = require("fs");
const max = require("lodash/max");
const shuffle = require("lodash/shuffle");
const remark = require("remark");

const cleanMarkdown = require("./clean-markdown");

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
  throttle: { onRateLimit: () => true, onAbuseLimit: () => true },
});

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
  let comments = [];

  try {
    const iterator = octokit.paginate.iterator(
      octokit.pulls.listCommentsForRepo,
      {
        owner: process.env.OWNER,
        repo,
        since: process.env.SINCE,
      }
    );

    for await (const response of iterator) {
      console.error(
        `Got comments for ${repo} up to ${max(
          response.data.map((comment) => comment.created_at)
        )}`
      );

      const commentsFromResponse = response.data.filter(
        (comment) =>
          comment.user && comment.user.login == process.env.USER_LOGIN
      );
      comments = comments.concat(commentsFromResponse);
    }
  } catch (e) {
    console.error(e);
  }

  return comments;
}

async function cleanComment(comment) {
  const commentBody = comment.body;
  const result = await remark().use(cleanMarkdown).process(commentBody);
  return result.contents === "\n" ? undefined : result.contents;
}

async function go() {
  const repos = process.env.REPOS.split(",");

  let comments = [];
  for (index in repos) {
    const commentsForRepo = await getComments(repos[index]);
    comments = comments.concat(commentsForRepo);
  }

  const cleanedComments = (
    await Promise.all(comments.map(cleanComment))
  ).filter((comment) => !!comment);

  const shuffledCommentText = shuffle(cleanedComments).join("\n");
  console.log(shuffledCommentText);
}
