#!/usr/bin/env node
import { createRelease } from "./release-pull-request.js";
import yargs = require("yargs");

export interface CliOptions {
    owner?: string;
    repo?: string;
    pull?: number;
    tag?: number;
    name?: string;
    token?: string;
    ["open-pr"]?: boolean;
}

function gatherOptions(args: string[]): CliOptions {
    return yargs(args)
        .usage(`usage: $0 [options]
negate any boolean option by prepending --no-`
        ).option("owner", {
            type: "string",
            demandOption: false
        }).option("repo", {
            type: "string",
            demandOption: false
        }).option("pull", {
            type: "number",
            demandOption: false
        }).option("tag", {
            type: "string",
            demandOption: false
        }).option("name", {
            type: "string",
            demandOption: false
        }).option("body", {
            type: "string",
            demandOption: false
        }).option("token", {
            type: "string",
            demandOption: false
        }).option("open-pr", {
            type: "boolean",
            demandOption: false
        })
        .argv as CliOptions;
}

const truthy = new Set([ "1", "true", "yes" ]);

function parseBool(value?: string) {
    if (!value) {
        return false;
    }
    return truthy.has(value);
}

(async function main() {
    const opts = gatherOptions(process.argv.slice(2));
    if (opts["open-pr"] === undefined) {
        opts["open-pr"] = parseBool(process.env.RELEASE_PULL_REQUEST_OPEN_PR);
    }

    await createRelease(opts);
})();
