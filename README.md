# Scheda DnD 5e Backend
## How to run
The API server

```docker build -t api .```

```docker run -it --rm -p 3000:3000 --name api01 API```

The WebSocket server

```ts-node websocket.ts```

// TODO: chiarire termini characters, allies, monsters e entity

## UML diagrams

### Actors
The player roles can be mapped as follows. Note that although the client must be authenticated via JWT to participate in the combat session, there is still a route that does not require authentication, namely the `diceRoll/` route.

<img src="png/Actors.png" width="500rem">

### Session management
<img src="png/Session Management.png" width="500rem">

### Turn management
<img src="png/Turn Management.png" width="500rem">

### Attack management
<img src="png/Attack Management.png" width="500rem">

### Entity management
<img src="png/Entity State Management.png" width="500rem">

### History management
<img src="png/History Management.png" width="500rem">

## App Routes

The API server endpoints are listed in the following table. Blank lines separate the routes following the semantic division of the previous use cases.

| Type | Route | Parameters | Description
| --- | --- | --- | --- |
| `GET` |` /sessions` | - | Returns all combact sessions for the user authenticated via JWT |
| `POST` |` /sessions` | characters, allies, monsters, mapSize | Creates a new combat session |
| `GET` |` /sessions/{sessionId}` | - | Returns all information on a combact session |
| `DELETE` |` /sessions/{sessionId}` | - | Deletes a combat session |
| `PATCH` |` /sessions/{sessionId}/start` | - | Starts a combat session |
| `PATCH` |` /sessions/{sessionId}/pause` | - | Pauses a combat session |
| `PATCH` |` /sessions/{sessionId}/continue` | - | Resumes a combat session |
| `PATCH` |` /sessions/{sessionId}/stop` | - | Ends a combat session |
| `PATCH` |` /sessions/{sessionId}/addEntity` | entityInfo | Adds a new entity to a fight |
| `GET` |` /sessions/{sessionId}/monsters/{monsterId}` | - | Returns a monster's info in a session |
| `POST` |` /sessions/{sessionId}/monsters` | monsterInfo | Adds a monster to a session |
| `DELETE` |` /sessions/{sessionId}/entity` | entityId | Removes an entity from a session |
|  |  |  |  |
| `GET` |` /diceRoll` | diceList, modifier | Roll dice |
| `GET` |` /sessions/{sessionId}/turn` | - | Returns the turn of a session |
| `PATCH` |` /sessions/{sessionId}/turn/postpone` | entityId, predecessorEntityId | Postpones an entity's turn |
| `PATCH` |` /sessions/{sessionId}/turn/end` | entityId | Ends the turn of an entity |
|  |  |  |  |
| `PATCH` |` /sessions/{sessionId}/attack` | attackInfo, attackerId, targetId | Makes one entity attack another |
| `GET` |` /sessions/{sessionId}/savingThrow` | entitiesId, difficultyClass, skill | Requests an entity to make a saving roll |
|  |  |  |  |
| `PATCH` |` /sessions/{sessionId}/addEffect` | entitiesId, effectType | Attaches an effect to an entity |
| `GET` |` /sessions/{sessionId}/{entityId}` | - | Returns entity info |
| `PATCH` |` /sessions/{sessionId}/{entityId}` | entityInfo | Modifies entity info |
| `PATCH` |` /sessions/{sessionId}/reaction` | entitiesId | Enables entities reaction |
|  |  |  |  |
| `GET` |` /sessions/{sessionId}/history` | - | Returns the battle history |
| `POST` |` /sessions/{sessionId}/history` | message | Adds a message to the battle history |
