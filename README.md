# Scheda DnD 5e Backend


[![Postgres](https://img.shields.io/badge/Made%20with-postgres-%23316192.svg?style=plastic&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![NPM](https://img.shields.io/badge/Made%20with-NPM-%23CB3837.svg?style=plastic&logo=npm&logoColor=white)](https://www.npmjs.com/)
[![NodeJS](https://img.shields.io/badge/Made%20with-node.js-6DA55F?style=plastic&logo=node.js&logoColor=white)](https://nodejs.org/en)
[![Express.js](https://img.shields.io/badge/Made%20with-express.js-%23404d59.svg?style=plastic&logo=express&logoColor=%2361DAFB)](https://expressjs.com/it/)
[![JWT](https://img.shields.io/badge/Made%20with-JWT-black?style=plastic&logo=JSON%20web%20tokens)](https://jwt.io/)
[![TypeScript](https://img.shields.io/badge/Made%20with-typescript-%23007ACC.svg?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sequelize](https://img.shields.io/badge/Made%20with-Sequelize-52B0E7?style=plastic&logo=Sequelize&logoColor=white)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Made%20with-docker-%230db7ed.svg?style=plastic&logo=docker&logoColor=white)](https://www.docker.com/)
[![Postman](https://img.shields.io/badge/Made%20with-Postman-FF6C37?style=plastic&logo=postman&logoColor=white)](https://www.postman.com/)
[![Redis](https://img.shields.io/badge/Made%20with-Redis-FF6C37?style=plastic&logo=redis&logoColor=white)](https://redis.io/)
[![RxJS](https://img.shields.io/badge/Made%20with-RxJS-FF6C37?style=plastic&logo=rxjs&logoColor=white)](https://rxjs.dev/)

// TODO: chiarire termini characters, allies, monsters e entity

## UML diagrams

### Actors
The player roles can be mapped as follows. Note that although the client must be authenticated via JWT to participate in the combat session, there is still a route that does not require authentication, namely the `diceRoll/` route.

<img src="png/Actors.png" width="650rem">

### Session management
<img src="png/Session Management.png" width="650rem">

### Turn management
<img src="png/Turn Management.png" width="650rem">

### Attack management
<img src="png/Attack Management.png" width="650rem">

### Entity management
<img src="png/Entity State Management.png" width="650rem">

### History management
<img src="png/History Management.png" width="650rem">

## App Routes

The API server endpoints are listed in the following table. Blank lines separate the routes following the semantic division of the previous use cases.

### Session Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `GET` |` /sessions` | - | Returns all combact sessions for the user authenticated via JWT |
| `POST` |` /sessions` | characters, npc, monsters, mapSize | Creates a new combat session |
| `GET` |` /sessions/{sessionId}` | - | Returns all information on a combact session |
| `DELETE` |` /sessions/{sessionId}` | - | Deletes a combat session |
| `PATCH` |` /sessions/{sessionId}/start` | - | Starts a combat session |
| `PATCH` |` /sessions/{sessionId}/pause` | - | Pauses a combat session |
| `PATCH` |` /sessions/{sessionId}/continue` | - | Resumes a combat session |
| `PATCH` |` /sessions/{sessionId}/stop` | - | Ends a combat session |

### Entity Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `PATCH` |` /sessions/{sessionId}/entity` | entityType, entityInfo | Adds a new entity to a fight |
| `GET` |` /sessions/{sessionId}/monsters/{monsterId}` | - | Returns a monster's info in a session |
| `DELETE` |` /sessions/{sessionId}/entity` | entityId | Removes an entity from a session |
| `GET` |` /sessions/{sessionId}/{entityId}` | - | Returns entity info |
| `PATCH` |` /sessions/{sessionId}/{entityId}` | entityInfo | Modifies entity info |

### Turn Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `GET` |` /sessions/{sessionId}/turn` | - | Returns the turn of a session |
| `PATCH` |` /sessions/{sessionId}/turn/postpone` | entityId, predecessorEntityId | Postpones an entity's turn |
| `PATCH` |` /sessions/{sessionId}/turn/end` | entityId | Ends the turn of an entity |

### History Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `GET` |` /sessions/{sessionId}/history` | - | Returns the battle history |
| `POST` |` /sessions/{sessionId}/history` | message | Adds a message to the battle history |


### Attack Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `GET` |` /diceRoll` | diceList, modifier | Roll dice |
| `PATCH` |` /sessions/{sessionId}/attack` | attackInfo, attackerId, targetId | Makes one entity attack another |
| `GET` |` /sessions/{sessionId}/savingThrow` | entitiesId, difficultyClass, skill | Requests an entity to make a saving roll |
| `PATCH` |` /sessions/{sessionId}/effect` | entitiesId, effectType | Assign or remove an effect to an entity |
| `PATCH` |` /sessions/{sessionId}/reaction` | entitiesId | Enables entities reaction |


## Sequence diagrams

### Create Session
<img src="png/CreateSession.png" width="650rem">

### Start Session
<img src="png/StartSession.png" width="650rem">

### Attack
<img src="png/attack.png" width="650rem">

### Enable Reaction
<img src="png/EnableReaction.png" width="650rem">

### Connect To Session
<img src="png/ConnectToSession.png" width="650rem">

## Class diagram
<img src="png/Class Diagram.png" width="650rem">

