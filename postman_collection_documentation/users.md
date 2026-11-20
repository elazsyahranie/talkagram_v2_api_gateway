# Users

- **POST** `/users/login` - `PUBLIC`<br/>
  Request type: `Body` - `raw {JSON}`<br/>
  Authorization: `none`<br/>

  > "phone": `string` <br/>
  > "email": `string` <br/>
  > "username": `string` <br/>
  > "password": `string` <br/>

- **POST** `/users` - `PUBLIC` <br/>
  Request type: `Body` - `form-data`<br/>
  Authorization: `none`<br/>
  > first_name: `text`</br>
  > middle_name: `text`</br>
  > last_name: `text`</br>
  > password: `text`</br>
  > username: `text`</br>
  > phone: `text`</br>
  > email: `text`</br>
  > role: `Admin` | `User`</br>
  > profile: `File`</br>
  > header: `File`</br>
- **GET** `/users/profile`<br/>
  Request type: `none`
  Authorization: `Bearer token`<br/>
- **GET** `/users`<br/>
  Request type: `Params`- `Query Params`<br/>
  Authorization: `Bearer token`<br/>
  > keywords: `text` </br>
  > role: `Admin` | `User` </br>
  > page: `text` </br>
  > limit: `text` </br>
  > order: `a-z` | `z-a` | `latest` | `oldest` </br>
- **GET** `/users/:id`<br/>
  Request type: `Params`</br>
  Authorization: `Bearer token`<br/>
- **PATCH** `/users`<br/>
  Request type: `Body` - `form-data`</br>
  Authorization: `Bearer token`<br/>
  > first_name: `text`<br/>
  > middle_name: `text`<br/>
  > last_name:`text`</br>
  > email: `text`</br>
  > role: `text` </br>
  > about: `text` </br>
- **DELETE** `/users/:id` - `ADMIN ONLY`<br/>
  Request type: `Params`
- **DELETE** `/users`<br/>
  Request type: `none`
