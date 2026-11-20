# Chats (Socket.IO)

> Note: Preferably tested using Insomnia or the frontend application rather than Postman.

## Connection

Clients must establish a Socket.IO connection to the Chat Service using `CHATS_SERVICE_HTTP_PORT` before sending or receiving messages.

## Text Chat

Request type: `Body` - `raw {JSON}`<br/>
Authorization: `Bearer token`<br/>

> "receiver": `receiver ID`</br>
> "message": `text`</br>
> "type": `"Chat"`</br>

## File Chat

Request type: `Body` - `raw {JSON}`<br/>
Authorization: `Bearer token`<br/>

> "receiver": `receiver ID`</br>
> "message": `text`</br>
> "type": `"File"`</br>
> "file*ids": *`[associated file IDs]`\_</br>
