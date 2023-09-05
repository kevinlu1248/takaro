# Takaro

Takaro is a web-based, multi-gameserver manager. It features a web interface to manage your gameservers, and a REST API to interact with them. The project aims to provide a comprehensive solution for managing multiple game servers through a single, easy-to-use interface. It is designed with scalability in mind, making it suitable for both small-scale personal use and large-scale enterprise applications. See [the docs](https://docs.takaro.io) for more info

## Development setup

[Getting started](https://docs.takaro.io/development/getting-started)

## Architecture Overview

Takaro is built as a monorepo with multiple packages. Each package serves a specific purpose and can be used independently. Here's a brief overview of some of the key packages:

* `lib-components`: This package contains various components for use in your projects. For example, the `CookieConsent` component provides a way to handle cookie consent in your applications.
* `lib-gameserver`: This package contains code related to game server events. It includes an event emitter for handling game server events.
* `lib-db`: This package contains configuration settings for the database.
* `lib-queues`: This package contains configuration settings for the queues.

For more detailed information, please refer to the individual README files in each package directory.

## Contribution Guidelines

We welcome contributions to Takaro! Here are some guidelines to help you get started:

1. Fork the repository and clone it to your local machine
2. Create a new branch for your changes: `git checkout -b my-feature-branch`
3. Make your changes and commit them: `git commit -m "Add my new feature"`
4. Push your changes to your fork: `git push origin my-feature-branch`
5. Submit a pull request with your changes

Please make sure to follow the existing code standards and practices. We also recommend writing tests for your changes to ensure they don't break existing functionality.

## Usage Instructions

Takaro provides a REST API for interacting with your game servers. You can find detailed API documentation in the `packages/web-docs/pages/advanced/api.md` file. 

For example, to query data from the API, you can use the various POST /search endpoints. Here's an example of a query that combines filters, searches, and pagination:

```json
{
  "filters": {
    "email": "john@example.com"
  },
  "search": {
    "name": "John"
  },
  "page": 1,
  "limit": 5
}
```

Takaro also provides various components for use in your projects. For example, the `packages/lib-components/src/components/feedback/snacks/CookieConsent/index.tsx` file contains a component for handling cookie consent.
1. Clone the repository: `git clone https://github.com/kevinlu1248/takaro.git`
2. Navigate to the project directory: `cd takaro`
3. Install the necessary dependencies: `npm install`
4. Set up the necessary environment variables. You can find the necessary variables in the `packages/lib-db/src/config.ts` and `packages/lib-queues/src/config.ts` files.
5. Start the development server: `npm run dev`

For more detailed instructions, see [Getting started](https://docs.takaro.io/development/getting-started)
