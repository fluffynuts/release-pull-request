export interface GitHubAccount {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: Optional<string>;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    user_view_type?: string;
    site_admin: boolean;
}
export interface GitHubRepo {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: GitHubAccount;
    html_url: string;
    description: Optional<string>;
    fork: boolean;
    url: string;
    forks_url: string;
    keys_url: string;
    collaborators_url: string;
    teams_url: string;
    hooks_url: string;
    issue_events_url: string;
    events_url: string;
    assignees_url: string;
    branches_url: string;
    tags_url: string;
    blobs_url: string;
    git_tags_url: string;
    git_refs_url: string;
    trees_url: string;
    statuses_url: string;
    languages_url: string;
    stargazers_url: string;
    contributors_url: string;
    subscribers_url: string;
    commits_url: string;
    git_commits_url: string;
    comments_url: string;
    issue_comment_url: string;
    contents_url: string;
    compare_url: string;
    merges_url: string;
    archive_url: string;
    downloads_url: string;
    issues_url: string;
    pulls_url: string;
    milestones_url: string;
    notifications_url: string;
    labels_url: string;
    releases_url: string;
    deployments_url: string;
    created_at: Optional<string>;
    updated_at: Optional<string>;
    pushed_at: Optional<string>;
    git_url: string;
    ssh_url: string;
    clone_url: string;
    svn_url: string;
    homepage: Optional<string>;
    size: number;
    stargazers_count: number;
    language: Optional<string>;
    has_issues: boolean;
    has_projects: boolean;
    has_downloads: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_discussions?: Optional<boolean>;
    forks_count: number;
    mirror_url: Optional<string>;
    archived: boolean;
    disabled: boolean;
    open_issues_count: number;
    license: Optional<License>;
    allow_forking?: Optional<boolean>;
    is_template?: Optional<boolean>;
    web_commit_signoff_required?: Optional<boolean>;
    topics?: string[];
    visibility?: string;
    forks: number;
    open_issues: number;
    watchers: number;
    default_branch: string;
}
export interface License {
    key: string;
    name: string;
    url: Optional<string>;
    spdx_id: Optional<string>;
    node_id: Optional<string>;
    html_url?: Optional<string>;
}
export interface GitHubRef {
    label: string;
    ref: string;
    sha: string;
    user: Optional<GitHubAccount>;
    repo: GitHubRepo;
}
export type Optional<T> = T | null | undefined;
export interface GitHubTeam {
    id: number;
    node_id: string;
    name: string;
    slug: string;
    description: Optional<string>;
    privacy?: Optional<string>;
    notification_setting?: Optional<string>;
    permission: string;
    permissions?: Optional<Permissions>;
}
export interface Permissions {
    pull: boolean;
    triage: boolean;
    maintain: boolean;
    admin: boolean;
}
export interface Label {
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string;
    color: string;
    default: boolean;
}
export interface PullRequest {
    url: string;
    id: number;
    node_id: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    issue_url: string;
    number: number;
    state: string;
    locked: boolean;
    title: string;
    user: Optional<GitHubAccount>;
    body: Optional<string>;
    created_at: string;
    updated_at: Optional<string>;
    closed_at: Optional<string>;
    merged_at: Optional<string>;
    merge_commit_sha: Optional<string>;
    assignee: Optional<GitHubAccount>;
    assignees?: Optional<GitHubAccount[]>;
    requested_reviewers?: Optional<GitHubAccount[]>;
    requested_teams?: Optional<GitHubTeam[]>;
    labels: Label[];
    draft?: boolean;
    commits_url: string;
    review_comments_url: string;
    review_comment_url: string;
    comments_url: string;
    statuses_url: string;
    head: GitHubRef;
    base: GitHubRef;
    _links: PullRequestLinks;
    author_association: string;
}
export interface Release {
    url: string;
    assets_url: string;
    upload_url: string;
    html_url: string;
    id: number;
    author: GitHubAccount;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: Optional<string>;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: Optional<string>;
    assets: Asset[];
    tarball_url: Optional<string>;
    zipball_url: Optional<string>;
    body?: Optional<string>;
}
export interface Asset {
    url: string;
    browser_download_url: string;
    id: number;
    node_id: string;
    name: string;
    label: Optional<string>;
    state: "open" | "uploaded";
    content_type: string;
    size: number;
    download_count: number;
    created_at: string;
    updated_at: string;
    uploader: Optional<GitHubAccount>;
}
export interface GitHubLink {
    href: string;
}
export interface PullRequestLinks {
    self: GitHubLink;
    html: GitHubLink;
    issue: GitHubLink;
    comments: GitHubLink;
    review_comments: GitHubLink;
    commits: GitHubLink;
    statuses: GitHubLink;
}
export interface Dictionary<T> {
    [key: string]: T;
}
export interface Response<T> {
    data: T;
}
export interface PullRequestListRequest {
    state: string;
    owner: string;
    repo: string;
    page: number;
}
export interface ListReleasesRequest {
    owner: string;
    repo: string;
}
export interface ListReposRequest {
    page: number;
    per_page: number;
}
export interface GitHubClient {
    pulls: {
        list(req: PullRequestListRequest): Promise<Response<PullRequest[]>>;
    };
    repos: {
        listForAuthenticatedUser(req: ListReposRequest): Promise<Response<{
            name: string;
            owner: GitHubAccount;
        }[]>>;
        listReleases(req: ListReleasesRequest): Promise<Response<Release[]>>;
        createRelease(req: Partial<Release>): Promise<Response<Release>>;
    };
}
export interface Config {
    repoHistory: string[];
}
export interface Choice {
    value: string;
    name: string;
    description?: string;
    disabled: boolean;
}
