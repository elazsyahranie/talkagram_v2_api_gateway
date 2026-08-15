# API Gateway
🚧 *This service is currently under development*

The API Gateway is the entry point for clients communicating with the chat application's backend services.

It is responsible for handling incoming HTTP and WebSocket connections, authenticating users, routing requests to the appropriate microservices, and providing a unified API for the frontend.

## Responsibilities
The API Gateway handles:

- HTTP request routing
- JWT authentication
- Request authentication and authorization
- Communication with backend microservices
- Error handling and response normalization
- Request validation where appropriate

The gateway should not contain business logic that belongs to individual services.

For example, the gateway may authenticate a request and forward a `get_rooms` operation to the `chats_service`, but the `chats_service` is responsible for deciding how the room would be fetched to the gateway, and thus to the client/frontend. As a result, all the modules in gateway does not contain `service.ts` files that typically store database level logic, or the database configurations. 

## Services 
The gateway communicates with the following services:
- **User Services** - Authentication, user profiles and user-related operations
- **Chats Service** - Rooms, participants, messages and chat operations
- **Media Service** - File/image uploads and media management

The exact communication mechanism depends on the service. HTTP/gRPC/message-based communication may be used depending on the operation.

## HTTP API
The gateway exposes following HTTP endpoints to clients:

### Users
- **POST** `/users/login` [logging in]
- **POST** `/users/` [user registration]
- **GET** `/users/profile` [get profile]<br/>
  Uses ID from the JWT to fetch individual user data.
- **GET** `/users` [get users]
- **GET** `/users/:id` [get users with ID]<br/>
  Uses ID from the param to fetch individual user data.
- **PATCH** `/users/` [update user]
- **DELETE** `/users/:id` [delete user by id]<br/>
  Uses ID from the param to delete individual user data. Authorized for admins only.
- **DELETE** `/users/` [self delete user]<br/>
  Uses ID from the JWT to delete individual user data.
  Fetching an individual user using the ID taken from the token.
