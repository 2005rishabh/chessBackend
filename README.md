
# Chess Masters — README

## Project overview
Chess Masters is a small multiplayer chess web app built with Express + EJS, real-time gameplay via Socket.IO, and persistent user accounts stored in MongoDB. The server validates moves using the chess.js library. Authentication uses JWT stored in an HTTP-only cookie.

## Tech stack
- Node.js + Express ([app.js](app.js))
- EJS templates ([views/index.ejs](views/index.ejs), [views/login.ejs](views/login.ejs), [views/signup.ejs](views/signup.ejs), [views/profile.ejs](views/profile.ejs))
- MongoDB + Mongoose (model: [`User`](models/User.js))
- JWT authentication via cookies (middleware: [`auth`](middleware/auth.js))
- Real-time comms with Socket.IO (server: [app.js](app.js), client: [public/javascripts/chessgame.js](public/javascripts/chessgame.js))
- chess.js for move validation
- TailwindCSS + custom CSS ([public/stylesheets/style.css](public/stylesheets/style.css))
- Client-side JS for auth ([public/javascripts/auth.js](public/javascripts/auth.js))

## Quick setup

1. Install dependencies:
```sh
npm install
```

2. Ensure MongoDB is running and accessible. Default URI is in the project's [.env](.env) file:
- MONGODB_URI (default: `mongodb://localhost:27017/chess-app`)
- JWT_SECRET
- PORT (optional)

3. Start the server:
```sh
node app.js
```
Open http://localhost:3000 (or your configured PORT).

> Note: package.json does not include a `start` script by default — start with `node app.js` or add a script.

## Important files (overview & links)
- Main server: [app.js](app.js)
- User model: [`User`](models/User.js)
- Authentication middleware: [`auth`](middleware/auth.js)
- Client auth handling: [public/javascripts/auth.js](public/javascripts/auth.js)
- Client game logic: [public/javascripts/chessgame.js](public/javascripts/chessgame.js)
- Styles: [public/stylesheets/style.css](public/stylesheets/style.css)
- Views: [views/index.ejs](views/index.ejs), [views/login.ejs](views/login.ejs), [views/signup.ejs](views/signup.ejs), [views/profile.ejs](views/profile.ejs)
- Data placeholder: [data/users.json](data/users.json)
- Project deps: [package.json](package.json)
- Env file: [.env](.env)

## Routes & API

Public (no auth):
- GET /login — login page ([views/login.ejs](views/login.ejs))
- GET /signup — signup page ([views/signup.ejs](views/signup.ejs))
- POST /api/login — authenticate (implemented in [app.js](app.js))
- POST /api/signup — create user (implemented in [app.js](app.js))

Protected (requires JWT cookie, enforced by [`auth`](middleware/auth.js)):
- GET / — main game page ([views/index.ejs](views/index.ejs))
- GET /logout — clears cookie (note: route is GET `/logout` in server)

Client side code:
- [public/javascripts/auth.js](public/javascripts/auth.js) calls `/api/login`, `/api/signup` and attempts `/api/logout` (see Known issues).

## Auth flow (high level)
1. Signup/login endpoints create or verify a user via [`User`](models/User.js).
2. On success the server signs a JWT with `JWT_SECRET` and sets it as an HTTP-only cookie named `token`.
3. The [`auth`](middleware/auth.js) middleware reads the cookie, verifies the JWT, loads the user from DB and attaches `req.user` for protected routes.
4. Views use `req.user` (e.g., [views/index.ejs](views/index.ejs) shows `user.username`).

## Real-time gameplay flow
- On Socket.IO connection ([app.js](app.js)), the server assigns roles: white, black, or spectator.
- The chess game state is managed server-side using chess.js (`new Chess()` in [app.js](app.js)).
- Client emits `"move"` with coordinates (client: [public/javascripts/chessgame.js](public/javascripts/chessgame.js)). Server validates with chess.js, broadcasts `"move"` and `"boardState"` (FEN) to all clients.
- Client listens for `"boardState"` and `"move"` to update the UI.

## Client specifics
- Drag-and-drop UI and coordinate mapping live in [public/javascripts/chessgame.js](public/javascripts/chessgame.js).
- Authentication UI (login/signup forms, alerts) lives in [public/javascripts/auth.js](public/javascripts/auth.js).

## Known issues & TODOs
- Logout mismatch: client logout in [public/javascripts/auth.js](public/javascripts/auth.js) posts to `/api/logout` (POST), but the server exposes `GET /logout`. Update either client or server for consistency.
- No `start` script in [package.json](package.json) — add `"start": "node app.js"` if desired.
- Consider rate limiting, stronger JWT secret management, HTTPS in production, and CSRF protections for added security.
- The server currently assigns player roles purely by connection order and does not persist games or reconnect players to prior roles.

## Security notes
- JWT secret is stored in `.env` — do not commit secrets to git.
- Cookies are HTTP-only; in production they are marked `secure` when NODE_ENV is `production`.
- Passwords are hashed with bcrypt (see [`User`](models/User.js)).

## Where to start exploring the code
- Server entry: [app.js](app.js)
- Authentication: [`User`](models/User.js) and [`auth`](middleware/auth.js)
- Client game UI: [public/javascripts/chessgame.js](public/javascripts/chessgame.js)
- Client auth: [public/javascripts/auth.js](public/javascripts/auth.js)
- Views: [views/index.ejs](views/index.ejs), [views/login.ejs](views/login.ejs), [views/signup.ejs](views/signup.ejs), [views/profile.ejs](views/profile.ejs)

---

If you want, I can also:
- Add a proper `start` script to [package.json](package.json).
- Fix the logout endpoint mismatch.
- Add startup instructions or a Dockerfile.
