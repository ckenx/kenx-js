# Contributing to Kenx-node

Thanks for checking out the Kenx-node! We're excited to hear and learn from you. Your experiences will benefit others who read and use these guides.

We've put together the following guidelines to help you figure out where you can best be helpful.

## Table of Contents

0. [Types of contributions we're looking for](#types-of-contributions-were-looking-for)
0. [Ground rules & expectations](#ground-rules--expectations)
0. [How to contribute](#how-to-contribute)
0. [Setting up your environment](#setting-up-your-environment)
0. [Community](#community)

## Types of contributions we're looking for

There are many ways you can directly contribute to Kenx (in descending order of need):

* Create PR to fix or improve functionalities
* Extend the frameworks's support by creating more plugins.
* Participate with instructions, comments and support for others at the issues section.

Interested in contributing to Kenx? Read on!

## Ground rules & expectations

Before we get started, here are a few things we expect from you (and that you should expect from others):

* Be kind and thoughtful in your conversations around this project. We all come from different backgrounds and projects, which means we likely have different perspectives on "how open source is done." Try to listen to others rather than convince them that your way is correct.
* Kenx frameworks are released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.
* Please ensure that your contribution passes all tests if you open a pull request. If there are test failures, you will need to address them before we can merge your contribution.
* Please consider contributing things that are widely valuable. Please don't add references or links to things you or your employer have created, as others will do so if they appreciate it.

## How to contribute

If you'd like to contribute, start by searching through the [pull requests](https://github.com/ckenx/kenx-node/pulls) to see whether someone else has raised a similar idea or question.

If you don't see your idea listed, and you think it fits into the goals of the framework, open a pull request.

## Setting up your environment

This site is powered by [NodeJS](https://nodejs.org). Running it on your local machine requires a working NodeJS installation with [NPM](https://npmjs.com/) or [YARN](https://classic.yarnpkg.com/en/).

Once you have that set up: 


1. Open your favorate terminal pointed to your working directory folder.

```bash
cd path/to/folder
```

2. Clone this repository using [Git](https://git-scm.com/) commands

```bash
git clone https://github.com/ckenx/kenx-node
cd /kenx-node
```

3. Install the project dependencies 

```bash
npm install
```
or

```bash
yarn install
```

4. Build the project

```bash
yarn build
```

This will compile all packages using Turborepo with caching enabled.

## Available Commands

We use **Turborepo** for build orchestration and **Changesets** for versioning. Here are the key commands:

### Development

```bash
# Build all packages (uses Turborepo cache)
yarn build

# Build in watch mode
yarn dev

# Build specific package
turbo run compile --filter=@ckenx/kenx-vite

# Clean build artifacts and cache
yarn clean
```

### Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Test specific package
yarn workspace @ckenx/kenx-vite test
```

### Code Quality

```bash
# Lint all packages
yarn lint

# Auto-fix linting issues
yarn lint:fix

# Format code
yarn format
```

### Versioning & Publishing

We use **Changesets** for version management. When you make changes:

```bash
# 1. Create a changeset (describes your changes)
yarn changeset

# 2. Follow the prompts to select packages and version bump type

# 3. Commit the changeset file
git add .changeset/*.md
git commit -m "feat: your feature description"

# 4. Push your branch and create a PR
```

When your PR is merged, GitHub Actions will:
- Create a "Version Packages" PR with version bumps
- When that PR is merged, automatically publish to npm

### Creating a New Plugin

```bash
# Use the generator script
./scripts/create-plugin.sh kenx-your-plugin

# This creates a complete plugin structure with:
# - package.json with correct dependencies
# - TypeScript configuration
# - Vitest test setup
# - README template
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes** to one or more packages

3. **Build and test locally**
   ```bash
   yarn build
   yarn test
   ```

4. **Create a changeset** (if you modified packages)
   ```bash
   yarn changeset
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin feature/your-feature
   ```

6. **Create a Pull Request** on GitHub

## Turborepo Benefits

- **Fast Builds**: Incremental builds with intelligent caching (~371ms cached vs 9s cold)
- **Parallel Execution**: Runs tasks across packages in parallel
- **Dependency Awareness**: Only rebuilds what changed and its dependents
- **Remote Caching**: Share cache across team (when enabled)

## Community

Discussions about Kenx-node take place on this repository's [Issues](https://github.com/ckenx/kenx-node/issues) and [Pull Requests](https://github.com/ckenx/kenx-node/pulls) sections. Anybody is welcome to join these conversations.

Wherever possible, do not take these conversations to private channels, including contacting the maintainers directly. Keeping communication public means everybody can benefit and learn from the conversation.