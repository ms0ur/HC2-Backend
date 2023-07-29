import { Router, Request, Response } from 'express';
import mainConfig from '../../config/main.json';
import { proccessAuth } from '../../utils/auth.utils';
import { verifyToken } from '../../utils/token.utils';
import markdown from 'markdown-it';

const md = new markdown({
  html: true,
  linkify: true,
  breaks: true
});

const router = Router();

// Authentication route
router.post('/auth', async (req: Request, res: Response) => {
  const { request, username, password, token } = req.body;

  if (request === "login") {
    if (username && password) {
      const result = await proccessAuth(username, password, mainConfig.config.secret);

      if (!result) {
        res.status(401).send();
      } else {
        res.status(200).send({
          token: result,
          username: username,
          expiresIn: '7d'
        });
      }
    } else {
      res.status(400).send();
    }
  } else if (request === "validate") {
    const result = verifyToken(token, mainConfig.config.secret);

    if (!result) {
      res.status(401).send();
    } else {
      res.status(200).send();
    }
  }
});

// Documentation route
router.get('/docs/auth', (req: Request, res: Response) => {
  const inputString = `## POST /auth

Authenticates a user or validates a token.

### Request Body

| Name     | Type   | Description                          |
|----------|--------|--------------------------------------|
| request  | string | The type of authentication request.   |
| username | string | The username for authentication.      |
| password | string | The password for authentication.      |
| token    | string | The token to be validated. (optional) |

### Response

| HTTP Status Code | Description                        |
|------------------|------------------------------------|
| 200              | Authentication or validation successful. |
| 401              | Authentication or validation failed.     |

If the request is for login authentication:

- If the authentication is successful, the response body will contain an authentication token.
- If the authentication fails, the response will have a 401 status code.

If the request is for token validation:

- If the token is valid, the response will have a 200 status code.
- If the token is invalid, the response will have a 401 status code.`;

  const formattedText = inputString
    .split('\n')
    .map(line => md.render(line))
    .join('\n');

  res.send(formattedText);
});

export default router;
