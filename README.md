# Scheda DnD 5e Backend
## How to run
The API server

```docker build -t api .```

```docker run -it --rm -p 3000:3000 --name api01 API```

The websocket server

```ts-node websocket.ts```

// TODO: chiarire termini characters, allies, monsters e entity
// - : no param
// x : descrizioni da riempire

## App Routes

| Type | Route | Parameters | Description
| --- | --- | --- | --- |
| `GET` | /sessions | - | x |
| `POST` | /sessions | characters, allies, monsters, mapSize |
| `GET` | /sessions/{sessionId} | - | x |
| `DELETE` | /sessions/{sessionId} | - | x |
| `PATCH` | /sessions/{sessionId}/start | - | x |
| `PATCH` | /sessions/{sessionId}/pause | - | x |
| `PATCH` | /sessions/{sessionId}/continue | - | x |
| `PATCH` | /sessions/{sessionId}/stop | - | x |
| `PATCH` | /sessions/{sessionId}/addEntity | entityInfo | x |
| `GET` | /sessions/{sessionId}/monsters/{monsterId} | - | x |
| `POST` | /sessions/{sessionId}/monsters | monsterInfo | x |
| `DELETE` | /sessions/{sessionId}/entity | entityId | x |
|  |  |  |  |
| `GET` | /diceRoll | diceList, modifier | x |
| `GET` | /sessions/{sessionId}/turn | - | x |
| `GET` | /sessions/{sessionId}/turn/postpone | entityId, predecessorEntityId | x |
| `GET` | /sessions/{sessionId}/turn/end | entityId | x |
|  |  |  |  |
| `PATCH` | /sessions/{sessionId}/attack | attackInfo, attacker, targetId | x |
| `GET` | /sessions/{sessionId}/savingThrow | entitiesId, difficultyClass, skill | x |
|  |  |  |  |
| `PATCH` | /sessions/{sessionId}/addEffect | - | entitiesId, effectType |
| `GET` | /sessions/{sessionId}/{entityId} | - | x |
| `PATCH` | /sessions/{sessionId}/{entityId} | entityInfo | x |
| `GET` | /sessions/{sessionId}/reaction | entitiesId | x |
|  |  |  |  |
| `GET` | /sessions/{sessionId}/history | - | x |
| `POST` | /sessions/{sessionId}/history | message | x |