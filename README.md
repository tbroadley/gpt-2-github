# gpt-2-github

Practice typing using text generated by GPT-2 based on your GitHub comments.

## Prerequisites

Node 12 and Yarn.

## Instructions

1. Run `yarn install`.
1. Create a GitHub access token with `repo:public` permissions if you only want to scrape public repos, or `repo` if you want to scrape private ones.
1. Create a `.env` file containing the following:

```
GITHUB_ACCESS_TOKEN=[GitHub access token]

OWNER=[owner of the repos you want to scrape comments from]
REPOS=[comma-separated list of
USER_LOGIN=[user whose comments you want to scrape]
SINCE=[yyyy-mm-dd date from which to start scraping comments]


4. Run `node scrape-comments.js > comments.txt`. This will create a file called `comments.txt` containing the scraped comments.
5. Use [this notebook](https://colab.research.google.com/drive/1VLG8e7YSEwypxU-noRNhsv5dW4NfTGce) to fine-tune GPT-2 based on `comments.txt`.
6. Download some text output from the GPT-2 notebook to `lines.txt`.
7. Run `node practice-typing.js` to practice typing.
```