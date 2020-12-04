# @pqt/publish

> ⚠️ This is an active work in progress. It is NOT ready for your repository yet, weird things may happen if you install this prematurely. Breaking changes are not documented yet and this is far from a completed project.

## Caveat

There is limitation currently in the way GitHub triggers their checks. If the pull request fails, a new commit is required (even as simple as an empty one `git commit -m "retrigger github actions" --allow-empty` ) to flush the old statuses and re-run a new sequence of checks. It's due to context binding with the commit hash.

There's an [aging community forum thread](https://github.community/t5/GitHub-Actions/Editing-a-PR-title-or-first-comment-causing-a-pile-up-of-runs/td-p/53932) but until something changes, this is unfortunately the only workaround.
