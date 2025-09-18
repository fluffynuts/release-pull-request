// release-pull-request module main file
import { CliOptions } from "./release-pull-request-cli.js";
import { ctx } from "exec-step";
import { system } from "system-wrapper";
import { Dictionary, GitHubClient, PullRequest, Release } from "./interfaces.js";

const
    NO_TOKEN = 1,
    TOKEN_ENV_VAR = "RELEASE_PULL_REQUEST_TOKEN";

export async function createRelease(
    opts: CliOptions
) {
    const
        // 0. validate token set
        token = readToken(opts),
        { Octokit } = await import("@octokit/rest"),
        client = new Octokit({
            auth: `token ${token}`
        }) as GitHubClient;
    // 1. select repo
    const
        repo = await selectRepo(opts, client),
        parts = repo.split("/");
    opts.owner = parts[0] || "unknown";
    opts.repo = parts[1] || "unknown";
    if (!opts.owner) {
        throw new Error(`repository owner not specified`);
    }
    if (!opts.repo) {
        throw new Error(`repository name not specified`);
    }
    // 2. select PR
    const pr = await selectPullRequest(opts, client), sharedQuery = {
        owner: opts.owner,
        repo: opts.repo
    };
    // 3. create body & title from PR
    const releases = (await client.repos.listReleases(sharedQuery)).data, mostRecentRelease = releases[0];
    // 4. select tag (list releases, suggest {prior}+1)
    const tagName = generateTagAfter(mostRecentRelease);
    // 5. create draft release
    const releaseData = {
        ...sharedQuery,
        tag_name: tagName,
        body: generateReleaseBodyFrom(pr),
        name: pr.title,
        draft: true,
        target_commitish: pr.head.ref
    };
    const release = (await client.repos.createRelease(releaseData)).data;
    const url = release.html_url.replace(/\/releases\/tag\//, "/releases/edit/");
    openWithSystem(url);
    if (opts["open-pr"]) {
        openWithSystem(pr.html_url);
    }
}

function generateReleaseBodyFrom(pr: PullRequest) {
    const body = pr.body || "";
    if (!hasSummaryMarker(body)) {
        return body;
    }
    const lines = (body.split("\n") as string[])
        .map(line => line.trimEnd()), result = [];
    let inSummary = false;
    for (const line of lines) {
        if (hasSummaryMarker(line)) {
            inSummary = true;
            continue;
        }
        if (!inSummary) {
            continue;
        }
        if (line.match(/^\*+.*\*+$/)) {
            // another heading - stop collecting
            break;
        }
        result.push(line);
    }
    return result.join("\n");
}

function hasSummaryMarker(s: string): boolean {
    return !!s.match(/\*+\s*summary\s*\*+/i);
}

function generateTagAfter(
    lastRelease?: Release
) {
    if (!lastRelease) {
        return "v0.1";
    }
    const
        lastTag = lastRelease.tag_name,
        parts = lastTag.split("/"),
        version = parts[parts.length - 1];
    if (!version) {
        throw new Error(`tag_name on release is invalid: ${lastTag}`);
    }
    const
        sub = version.split("."),
        last = sub[sub.length - 1];
    sub[sub.length - 1] = attemptToIncrement(last);
    parts[parts.length - 1] = sub.join(".");
    return parts.join("/");
}

function attemptToIncrement(value: string | undefined) {
    if (!value) {
        throw new Error(`Unable to increment version value '${value}'`);
    }
    const asNumber = parseInt(value, 10);
    return isNaN(asNumber)
        ? value
        : `${asNumber + 1}`;
}

async function selectPullRequest(
    opts: CliOptions,
    client: GitHubClient
): Promise<PullRequest> {
    const lookup = {} as Dictionary<PullRequest>;
    let page = 0, count = 0;
    do {
        const partial = (await client.pulls.list({
            state: "open",
            owner: `${opts.owner}`,
            repo: `${opts.repo}`,
            page
        })).data as PullRequest[];
        count = partial.length;
        for (const item of partial) {
            const user = !!item.user ? item.user.login : "";
            const displayTitle = `#${item.number} [${user}] :: ${item.title}`;
            lookup[displayTitle] = item;
        }
        page++;
    } while (count);
    const selected = await promptWithChoices(
        "Select pull request",
        Object.keys(lookup).sort()
    );
    const result = lookup[selected];
    if (!result) {
        throw new Error(`Unable to find selected repo '${selected}' within known repo list`);
    }
    return result;
}

async function selectRepo(
    opts: CliOptions,
    client: GitHubClient
) {
    const providedRepo = determineFullRepoNameFrom(opts);
    if (!!providedRepo) {
        return providedRepo;
    }
    const repos = await ctx.exec(
        "listing available repositories...",
        async () => await listUserRepos(client)
    );
    return promptWithChoices("Select repository", repos);
}

async function listUserRepos(
    client: GitHubClient,
    pageOffset: number = 0
) {
    const parallel = [ 0, 1, 2, 3, 4, 5 ], pages = parallel.map(i => i + pageOffset), promises = pages
        .map(i => client.repos.listForAuthenticatedUser({
            page: i,
            per_page: 100
        })), rawResults = await Promise.all(promises);
    const results = rawResults.flatMap(o => o.data.map(o2 => `${o2.owner.login}/${o2.name}`));
    let haveAll = false;
    for (const raw of rawResults) {
        if (raw.data.length === 0) {
            haveAll = true;
            break;
        }
    }
    if (!haveAll) {
        const maxPage = pages[pages.length - 1];
        if (maxPage) {
            const next = await listUserRepos(client, maxPage + 1);
            results.push.apply(results, next);
        }
    }
    return Array.from(new Set(results));
}

function determineFullRepoNameFrom(opts: CliOptions) {
    if (!opts.repo) {
        return undefined;
    }
    const parts = opts.repo.split("/");
    if (parts.length === 2) {
        return opts.repo;
    }
    if (!opts.owner) {
        console.warn("repository was specified without an account prefix and no org was specified");
        return undefined;
    }
    return `${opts.owner}/${opts.repo}`;
}

async function promptWithChoices(
    message: string,
    choices: string[]
) {
    const { default: autocomplete } = await import("inquirer-autocomplete-standalone");
    const mapped = choices.map(s => ({
        value: s,
        name: s,
        disabled: false
    }));
    return autocomplete({
        message,
        source: async (input?: string) => {
            if (!input) {
                return mapped;
            }
            const search = input.toLowerCase();
            return mapped
                .filter(s => s.value.toLowerCase().includes(search));
        }
    });
}

function readToken(opts: CliOptions): string {
    if (opts.token) {
        return opts.token;
    }
    const result = process.env[TOKEN_ENV_VAR];
    if (result) {
        return result;
    }
    console.error(`
  Please set up a GitHub token with the following scopes:
   (TODO: fill in required scopes)
  Once that is done, please set the environment variable
  ${TOKEN_ENV_VAR}
  to the value of that token, or pass that token on the
  commandline.
    `.trim());
    process.exit(NO_TOKEN);
}

function quoteIfRequired(p: string): string {
    return p.indexOf(" ") > -1
        ? `"${p}"`
        : p;
}

const openers: Dictionary<string> = {
    win32: "start",
    darwin: "open",
    default: "xdg-open"
};

function openWithSystem(p: string) {
    const opener = openers[process.platform as string] || openers.default;
    void system(`${quoteIfRequired(opener as string)}`, [ quoteIfRequired(p) ]);
}
