# Chats

- **POST** `/chats/rooms/participants/:id`<br/>
  Request type: `Body` - `raw {JSON}`<br/>
  Authorization: `Bearer token`<br/>

  > **Array of Objects**</br>
  > "user": `userID`</br>
  > "role": `"Admin"` | `"User"`</br>

- **POST** `/chats/groups/` - `GROUP ADMIN ONLY`<br/>
  Request type: `Body` - `raw {JSON}`<br/>
  Authorization: `Bearer token`<br/>

  > "name": `string`</br>
  > "otherParticipants": _`[array of participants IDs]`_</br>
  > "description": `string`</br>

- **GET** `/chats/rooms/user`<br/>
  Request type: `none`<br/>
  Authorization: `Bearer token`<br/>

- **PATCH** `/groups/self/participants/:id`<br/>
  Request type: `Body` - `raw {JSON}`<br/>
  Authorization: `Bearer token`<br/>

  > "role": `"Admin"`, `"User"`

- **PATCH** `/groups/participants/:id` - `GROUP ADMIN ONLY`<br/>

  Request type: `Body` - `raw {JSON}`<br/>
  Authorization: `Bearer token`<br/>

  > **Array of Objects**</br>
  > "user": `userID`</br>
  > "role": `"Admin"` | `"User"`</br>

- **PATCH** `/groups/` - `GROUP ADMIN ONLY`<br/>
  Request type: `Body` - `form-data`<br/>
  Authorization: `Bearer token`<br/>

  > name: `text`<br/>
  > description: `text`<br/>

- **DELETE** `/groups/self/participant/:id`<br/>
  Request type: `none` <br/>
  Authorization: `Bearer token`<br/>

- **DELETE** `/groups/participants/:id`<br/>
  Request type: `none` <br/>
  Authorization: `Bearer token`<br/>

  > _`[array of participants IDs]`_

- **DELETE** `/groups/:id` - `GROUP ADMIN ONLY`.
  <br/>
  Request type: `none` <br/>
  Authorization: `Bearer token`<br/>
