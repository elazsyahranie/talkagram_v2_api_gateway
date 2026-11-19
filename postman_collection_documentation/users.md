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
