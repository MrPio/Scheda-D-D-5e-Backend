# Scheda DnD 5e Backend
## How to run
The API server

```docker build -t api .```

```docker run -it --rm -p 3000:3000 --name api01 API```

The websocket server

```ts-node websocket.ts```
