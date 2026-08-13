# API Gateway
The API Gateway is the entry point for clients communicating with the chat application's backend services.

It is responsible for handling incoming HTTP and WebSocket connections, authenticating users, routing requests to the appropriate microservices, and providing a unified API for the frontend.

## Responsibilities
The API Gateway handles:

- HTTP request routing
- WebSocket connections
- JWT authentication
- Request authentication and authorization
- Communication with backend microservices
- WebSocket event forwarding
- Error handling and response normalization
- Request validation where appropriate
