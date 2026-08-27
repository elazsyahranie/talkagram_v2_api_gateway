# API Gateway
🚧 ***This service is currently under development.** Its architecture, APIs, features, and implementation details may change as development progresses.*

The API Gateway is the entry point for clients communicating with the chat application's backend services.

It is responsible for handling incoming HTTP connections, authenticating users, routing requests to the appropriate microservices, and providing a unified API for the frontend.

## Responsibilities
The API Gateway handles:

- HTTP request routing
- JWT authentication
- Request authentication and authorization
- Communication with backend microservices
- Error handling and response normalization
- Request validation where appropriate

> **Note**: Socket.IO connections are handled by the Chat Service rather than the API Gateway. This keeps long-lived real-time connections separate from API routing and allows the Chat Service to scale independently.

The gateway should not contain business logic that belongs to individual services.

For example, the gateway may authenticate a request and forward a `get_rooms` operation to the `chats_service`, but the `chats_service` is responsible for deciding how the room would be fetched to the gateway, and thus to the client/frontend. As a result, all the modules in gateway does not contain `service.ts` files that typically store database level logic, or the database configurations. 

## Services 
The gateway communicates with the following services:
- **User Services** - Authentication, user profiles and user-related operations
- **Chats Service** - Rooms, participants, messages and chat operations
- **Media Service** - File/image uploads and media management

While the API Gateway exposes HTTP endpoints to the authorized clients, the gateway and other services communicate with each other using the `TCP (Transmission Control Protocol)`, a built-in transfer layer option for [NestJS](https://github.com/nestjs/nest) microservices. Currently, however, there is one exception to this: API Gateway uses HTTP instead of TCP to communicate with Service Media, especially for any requests related to file uploading or fetching.

## HTTP API
> **Authentication:** All endpoints require authentication by default. Endpoints that do not require authentication are marked as `public`.
The gateway exposes the following HTTP endpoints to clients.

### Users
- **POST** `/users/login` - `PUBLIC`<br/>
  Authenticate a user.
- **POST** `/users` - `PUBLIC` <br/>
  Register a new user. If profile and/or header images are included, the API Gateway also forwards them to the Media Service through `POST /user-images/:id`.
- **GET** `/users/profile`<br/>
  Fetch the authenticated user's own data.
- **GET** `/users`<br/>
  Fetch a list of users.
- **GET** `/users/:id`<br/> 
  Fetch a user's data by ID.
- **PATCH** `/users`<br/> 
  Update the authenticated user's own data. If new profile and/or header images are included, the API Gateway also forwards them to the Media Service through `PATCH /user-images/:id`.
- **DELETE** `/users/:id`<br/>
  Delete a user's data by ID - `ADMIN ONLY`
- **DELETE** `/users`<br/>
  Delete the authenticated user's own account.

[PROCEED HERE]
### Chats 
- **POST** `/chats/rooms/participants/:id` [add group participant]
- **POST** `/chats/groups/` [create groups]
- **GET** `/chats/rooms/user` [get rooms by user id]<br/>
  Fetch the data of rooms where the user is a participant.
- **PATCH** `/groups/self/participants/:id` [self update room participant]<br/>
  An endpoint for group participants to update their own roles in the group.
- **PATCH** `/groups/participants/:id` [update room participant]<br/>
  An endpoint for group admins to update other participants role in the group.
- **PATCH** `/groups/` [update room] `GROUP ADMIN ONLY`
- **DELETE** `/groups/self/participant/:id` [self delete group participant]<br/>
  An endpoint for group participants to delete themselves from the group.
- **DELETE** `/groups/participants/:id` [delete group participant] `GROUP ADMIN ONLY` <br/>
- **DELETE** `/groups/:id` [delete group] `GROUP ADMIN ONLY`

The gateway forwards requests to the appropriate internal service. For example:
```mermaid
flowchart TD
    Client[Authorized Client]
    Gateway[API Gateway]
    Service[Backend Service]
    Database[Database]

    Client --> Gateway
    Gateway --> Service
    Service --> Database
```
  
## Authentication and Authorization
Most endpoints require a valid authentication token, using a JWT token like: `Bearer <token>`. The token contains at least two data: `id` and `role`. The `role` data is required for several endpoints that are authorized for system admins only.  

Example:
```mermaid
flowchart TD
    Client[Authorized Client]
    Gateway[API Gateway]
    Auth{Validate JWT}
    Authorization{Authorization required?}
    CheckPermission{Check permission}
    Service[Backend Service]
    Unauthorized[401 Unauthorized]
    Forbidden[403 Forbidden]

    Client -->|Request + JWT| Gateway
    Gateway --> Auth

    Auth -->|Invalid| Unauthorized
    Auth -->|Valid| Authorization

    Authorization -->|No| Service
    Authorization -->|Yes| CheckPermission

    CheckPermission -->|Denied| Forbidden
    CheckPermission -->|Allowed| Service
```

For browser-based authentication, an `HttpOnly` cookie may be used instead (although this is yet to be implemented).

Authentication should be centralized at the gateway where possible, while services should still enforce authorization rules for operations they own.

## Environment Variables 
Each services contain the environment variables in a file named `.env`. It's neccesary to include the `.env` into the `.gitignore` file, especially when the repository is public to prevent any sensitive information or data from getting exposed.

The API Gateway `.env` file contain the following variables:
```
PORT=
PROJECT_URL=

USERS_SERVICE_HOST=
USERS_SERVICE_PORT=

MEDIA_SERVICE_HOST=
MEDIA_SERVICE_PORT=

MEDIA_SERVICE_HTTP_PORT=
MEDIA_SERVICE_HTTP_URL=

CHATS_SERVICE_HOST=
CHATS_SERVICE_PORT=

TOKEN_SECRET_KEY=
TOKEN_EXPIRES=

ENVIRONMENT=

REDIS_HOST=
REDIS_PORT=

# This was inserted by `prisma init`:
# Environment variables declared in this file are NOT automatically loaded by Prisma.
# Please add `import "dotenv/config";` to your `prisma.config.ts` file, or use the Prisma CLI with Bun
# to load environment variables from .env files: https://pris.ly/prisma-config-env-vars.

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

# The following `prisma+postgres` URL is similar to the URL produced by running a local Prisma Postgres 
# server with the `prisma dev` CLI command, when not choosing any non-default ports or settings. The API key, unlike the 
# one found in a remote Prisma Postgres URL, does not contain any sensitive information.

# DATABASE_URL=
DATABASE_URL=
```

## Installation 
This project uses `npm` as a package manager.

Install the dependencies by using 
```
npm install
```
or 
```
npm i
```

### Start the app
- `npm run start` Start the app.
- `npm run start:dev` Start the app in `dev` mode.
- `npm run start:debug` Debugging the app in watch mode.
- `npm run start:prod` Start in production mode.

### Test the app
- `npm run test` Run unit test
- `npm run test:watch` Run the test in watch mode
- `npm run test:e2e` Run end-to-end tests

## Project Structure
```text
├── README.md
├── eslint.config.mjs
├── logs
│   ├── app.log
│   └── myLogFile.log
├── nest-cli.json
├── package-lock.json
├── package.json
├── prisma
│   ├── migrations
│   │   ├── 20251118112934_create_users_and_employees
│   │   │   └── migration.sql
│   │   ├── 20251118113333_users_add_role_check_constraint
│   │   │   └── migration.sql
│   │   ├── 20251120181030_alter_table_user_id_uuid
│   │   │   └── migration.sql
│   │   ├── 20251120181414_alter_table_user_username_phone
│   │   │   └── migration.sql
│   │   ├── 20251120193214_users_companies_one_on_one_relations
│   │   │   └── migration.sql
│   │   ├── 20251124075514_alter_table_users_add_columns_for_names
│   │   │   └── migration.sql
│   │   ├── 20251205090741_create_user_images
│   │   │   └── migration.sql
│   │   ├── 20251205090905_alter_table_user_images_type_constraint
│   │   │   └── migration.sql
│   │   ├── 20251221075144_alter_table_employee_companies_cascade
│   │   │   └── migration.sql
│   │   ├── 20251221121925_create_collation_kn_true
│   │   │   └── migration.sql
│   │   ├── 20251221124740_apply_collation_in_users
│   │   │   └── migration.sql
│   │   ├── 20260123085520_create_table_stores
│   │   │   └── migration.sql
│   │   ├── 20260123091019_create_table_staffs
│   │   │   └── migration.sql
│   │   ├── 20260125101620_alter_staffs_and_user_table
│   │   │   └── migration.sql
│   │   ├── 20260125122534_alter_staffs_and_user_table_2
│   │   │   └── migration.sql
│   │   ├── 20260125130159_create_table_store_images
│   │   │   └── migration.sql
│   │   ├── 20260223105841_check_constraints_on_users_and_staffs
│   │   │   └── migration.sql
│   │   ├── 20260223133859_fix_staffs_check_constraint
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── prisma.config.ts
├── src
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── auth
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.guard.ts
│   │   ├── auth.module.ts
│   │   ├── authentication.guard.ts
│   │   └── issuperadmin.guard.ts
│   ├── chats
│   │   ├── chats.controller.spec.ts
│   │   ├── chats.controller.ts
│   │   ├── chats.module.ts
│   │   └── dto
│   │       ├── add-group-participants.dto.ts
│   │       ├── create-group.dto.ts
│   │       ├── get-rooms-result.dto.ts
│   │       ├── self-update-group-participant.dto.ts
│   │       ├── update-group-participants.dto.ts
│   │       └── update-group.dto.ts
│   ├── common
│   │   ├── common.module.ts
│   │   ├── constants.ts
│   │   ├── error.filter.ts
│   │   ├── exceptions.filter.ts
│   │   └── validation.service.ts
│   ├── decorators
│   │   ├── currentUser.decorator.ts
│   │   └── public.decorator.ts
│   ├── file-upload.util.ts
│   ├── logger
│   │   ├── winston.config.ts
│   │   └── winston.module.ts
│   ├── main.ts
│   ├── my-logger
│   │   ├── my-logger.module.ts
│   │   ├── my-logger.service.spec.ts
│   │   └── my-logger.service.ts
│   ├── redis.module.ts
│   └── users
│       ├── dto
│       │   ├── create-user.dto.ts
│       │   ├── get-users-result.dto.ts
│       │   ├── login-user.dto.ts
│       │   ├── store-images.dto.ts
│       │   ├── update-user.dto.ts
│       │   └── user-image.dto.ts
│       ├── users.controller.spec.ts
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.validation.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
├── tsconfig.json
└── uploads
    └── images
```

The exact structure may differ depending on the framework and architecture.

## Error Handling
The gateway should expose consistent HTTP errors to clients.

Example:
```
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
Internal service errors should not expose implementation details, database errors, or sensitive information to clients.

While the services may return TCP or SocketIO error messages, the API Gateway would find any matching HTTP error code and messages that would be sent to the requesting client.

## Development Guidelines
Keep business logic out of the gateway.

The gateway should primarily handle:
```mermaid
flowchart TD
    Authentication[Authentication]
    Authorization{Authorization}
    Routing[Routing]
    Communication[Communication]
    Response[Response]

    Authentication --> Authorization
    Authentication --> Routing
    Authorization --> Routing

    Routing --> Communication
    Communication --> Response
```
Business rules should remain inside the service responsible for the relevant domain.

For example:
```mermaid
flowchart TD
    Gateway[API Gateway]
    Request["Record this Message"]
    Service[Messaging Service]
    Validate[Validation]
    Store[Store message]
    Response[Send response]

    Gateway --> Request
    Request --> Service
    Service --> Validate
    Validate --> Store
    Store --> Response
```
The gateway should not determine whether a user is allowed to send a message to a particular room.

## Running the Complete System
The API Gateway depends on the backend services being available.

A typical local development environment may look like (note that these are not representative of the ports of the original services):
```
API Gateway       : 3000
User Service      : 3002
Chat Service      : 3003
Media Service     : 3004
```
Start the required services before starting the gateway.

## Production Considerations
Before deploying to production, configure:

- Secure JWT/cookie configuration
- HTTPS
- CORS
- Rate limiting
- Request timeouts
- Logging
- Health checks
- Service discovery/configuration
- WebSocket connection limits
- Graceful shutdown
- Monitoring and metrics

Never expose internal microservice ports directly to public clients unless there is a specific architectural reason to do so.
