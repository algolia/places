Hi (future) collaborator!

**tl;dr;**
- submit pull requests to develop branch
- use [conventional changelog](https://github.com/ajoslin/conventional-changelog/blob/master/conventions/angular.md) commit style messages
- squash your commits
- have fun

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Where to start?](#where-to-start)
- [Development workflow](#development-workflow)
- [Commit message guidelines](#commit-message-guidelines)
  - [Revert](#revert)
  - [Type](#type)
  - [Scope](#scope)
  - [Subject](#subject)
  - [Body](#body)
  - [Footer](#footer)
- [Stash your commits](#stash-your-commits)
- [When are issues closed?](#when-are-issues-closed)
- [Releasing](#releasing)
- [Hotfixes](#hotfixes)
  - [Releasing hotfixes](#releasing-hotfixes)
  - [Documentation updates](#documentation-updates)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Where to start?

Have a fix or a new feature? [Search for corresponding issues](https://github.com/algolia/places/issues) first then create a new one.

Always check the status of the [develop branch](https://github.com/algolia/places/tree/develop) for the freshest code.

Always submit pull requests to the develop branch. Docs and hotfixes can be submitted to master.

# Development workflow

We use the places website as a way to develop the places.js library.

Requirements:
- [Node.js](https://nodejs.org/en/), prefer latest stable.
- npm@2 (npm install -g npm@2)
- [Ruby](https://www.ruby-lang.org/en/), prefer latest stable.
- [Bundler](http://bundler.io/), prefer latest stable.

```sh
npm run dev
# TODO: url for local dev
```

Open http://localhost.localdomain:4567/.

Any change made to places.js library or the docs will trigger an autoreload.

# Commit message guidelines

We use [conventional changelog](https://github.com/ajoslin/conventional-changelog) to generate our changelog from our git commit messages.

Here are the rules to write commit messages, they are the same than [angular/angular.js](https://github.com/angular/angular.js/blob/7c792f4cc99515ac27ed317e0e35e40940b3a400/CONTRIBUTING.md#commit-message-format).

Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```text
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

## Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

## Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

## Scope
The scope could be anything specifying place of the commit change. For example `RefinementList`,
`refinementList`, `rangeSlider`, `CI`, `url`, `build` etc...

## Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

## Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

## Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

# Stash your commits

Once you are done with a fix or feature and the review was done, [squash](http://gitready.com/advanced/2009/02/10/squashing-commits-with-rebase.html) your commits to avoid things like "fix dangling comma in bro.js", "fix after review"

Example:
    - `feat(widget): new feature blabla..`
    - `refactor new feature blablabla...`
    - `fix after review ...`
  - **both commits should be squashed* in a single commit: `feat(widget) ..`

# When are issues closed?

Once the a fix is done, having the fix in the `develop` branch is not sufficient, it needs to be part of a release for us to close the issue.

So that you never ask yourself "Is this released?".

Instead of closing the issue, we will add a ` ✔ to be released` label.

# Releasing

If you are a maintainer, you can release.

We use [semver](http://semver-ftw.org/).

You must be on the master branch.

```sh
npm run release
```

This task will merge develop into master.

# Hotfixes

All our work is done on the develop branch but it could be necessary to push a hotfix to the master
branch and do a patch release. To fix a very important bug.

For this, you should:
- add `hotfix` to the commit message **body**
- submit your pull request to the master branch

## Releasing hotfixes

You must be on the master branch.

This task will not merge develop in master, only release current master.

```sh
HOTFIX=1 npm run release
```

## Documentation updates

If you have important documentation update to release without wanting to release
a new version of places, you can do a documentation hotfix.

Then once the hotfix is merged into master, the documentation will be updated automatically.

You will have to manually backport this documentation fix in develop.
