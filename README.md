# Scheda DnD 5e Backend

TODO: Descrizione obiettivo
TODO: Descrizione pattern
TODO: Aggiustare class diagram
TODO: Spiegare come testare soprattutto per le WS

######
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

<a name="index"></a>
## 📘 Table of Contents

* [📄 Use case diagram](#Usecasediagram)
  * [Actors](#Actors)
  * [Session management](#Sessionmanagement)
  * [Turn management](#Turnmanagement)
  * [Attack management](#Attackmanagement)
  * [Entity management](#Entitymanagement)
  * [History management](#Historymanagement)
* [🚩 App Routes](#AppRoutes)
  * [Session](#SessionRoutes)
  * [Turn](#TurnRoutes)
  * [Attack](#AttackRoutes)
  * [Entity](#EntityRoutes)
  * [History](#HistoryRoutes)
* [⏱ Sequence diagram](#Sequencediagram)
  * [Create Session](#CreatSession)
  * [Start Session](#StartSession)
  * [Enable Reaction](#EnableReaction)
  * [Connect To Session](#ConnectToSession)
* [📐 Class diagram](#Classdiagram)

<!-- * [🪄 Patterns used](#Patternsused)
  * [Middlewares: Chain of Responsability](#ChainofResponsability)
  * [Exceptions handling: Factory](#ChainofResponsability)
  * [Data sources handling: Repository + Factory + Singleton](#ChainofResponsability)
  * [Websocket communication: Observer](#ChainofResponsability) -->

<a name="Usecasediagram"></a>
## 📄 Use case diagram

<a name="Actors"></a>
### Actors
The player roles can be mapped as follows. Note that although the client must be authenticated via JWT to participate in the combat session, there is still a route that does not require authentication, namely the `diceRoll/` route.

<img src="png/Actors.png" width="450rem">

<a name="Actors"></a>
### Session management
<img src="png/Session Management.png" width="550rem">

<a name="Turnmanagement"></a>
### Turn management
<img src="png/Turn Management.png" width="550rem">

<a name="Attackmanagement"></a>
### Attack management
<img src="png/Attack Management.png" width="550rem">

<a name="Entitymanagement"></a>
### Entity management
<img src="png/Entity State Management.png" width="550rem">

<a name="Historymanagement"></a>
### History management
<img src="png/History Management.png" width="550rem">

<a name="AppRoutes"></a>
## 🚩 App Routes

The API server endpoints are listed in the following table. Blank lines separate the routes following the semantic division of the previous use cases.

<a name="SessionRoutes"></a>
### Session Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `GET` |`/sessions` | - | Provides the index of all sessions in which the authenticated user has the role of player or master. |
| `POST` |`/sessions` | characters, npc, monsters, mapSize | Creates a new session. Returns the new session. |
| `GET` |`/sessions/{sessionId}` | - | Returns all information from `sessionId`. |
| `DELETE` |`/sessions/{sessionId}` | - | Deletes `sessionId`.|
| `PATCH` |`/sessions/{sessionId}/start` | - | Starts `sessionId`. Its current status must be `created`. |
| `PATCH` |`/sessions/{sessionId}/pause` | - | Pauses `sessionId`. Its current status must be `ongoing`. |
| `PATCH` |`/sessions/{sessionId}/continue` | - | Resumes `sessionId`. Its current status must be `paused`. |
| `PATCH` |`/sessions/{sessionId}/stop` | - | Ends `sessionId`. Its current status must be `ongoing` or `paused`. |

<a name="TurnRoutes"></a>
### Turn Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `GET` |`/sessions/{sessionId}/turn` | - | Provides the current turn of `sessionId`. |
| `PATCH` |`/sessions/{sessionId}/turn/postpone` | entityId, predecessorEntityId | Postpones the turn of the `entityId` after the turn of the `predecessorEntityId`. |
| `PATCH` |`/sessions/{sessionId}/turn/end` | entityId | Ends the turn of the `entityId`. Notifies the next playing entity. |

<a name="AttackRoutes"></a>
### Attack Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `GET` |`/diceRoll` | diceList, modifier? | Rolls the dice in the `diceList` and adds up any `modifier`. The `diceList` must be non empty.  |
| `PATCH` |`/sessions/{sessionId}/attack` | attackInfo, attackerId, targetId | Causes `attackerId` to attack `targetId`. The attack may be melee or enchantment. The `attackInfo` must contain the attempt dice roll. If this is greater than the target's AC, the attacker is asked to roll the damage dice. |
| `GET` |`/sessions/{sessionId}/savingThrow` | entitiesId, difficultyClass, skill | Requests all the `entitiesId` to make a save roll on `skill`. The result is positive if greater than `difficultyClass`.|
| `PATCH` |`/sessions/{sessionId}/effect` | entityId, effect | Assigns the `effect` to the `entityId`. If `effect` is null, the effects of the entities are deleted. |
| `PATCH` |`/sessions/{sessionId}/reaction` | entityId | Enables the reaction for the `entityId`. Notifies it. |

<a name="EntityRoutes"></a>
### Entity Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `PATCH` |`/sessions/{sessionId}/entities` | entityType, entityInfo | Adds an entity to the `sessionId`. If the `entityType` is monster, `entityInfo` must contain all of its information. Otherwise it must only contain the uid.  |
| `DELETE` |`/sessions/{sessionId}/entities/{entityId}` | - | Removes `entityId` from `sessionId`. Fails if not found. |
| `GET` |`/sessions/{sessionId}/entities/{entityId}` | - | Returns all the info from `entityId`. Fails if not found in `sessionId`.|
| `PATCH` |`/sessions/{sessionId}/entities/{entityId}` | entityInfo | Updates the info of `entityId`. Fails if not found in `sessionId`. |

<a name="HistoryRoutes"></a>
### History Routes

| Type | Route | Parameters | Description |
| --- | --- | --- | --- |
| `GET` |`/sessions/{sessionId}/history` | actionType? | Returns the whole `sessionId` history. Filter it by `actionType` if provided. |
| `POST` |`/sessions/{sessionId}/history` | message | Adds a message to the `sessionId` history. Notifies all players except the one who posted the message. |


<a name="Sequencediagram"></a>
## ⏱ Sequence diagram

<a name="CreateSession"></a>
### Create Session
<img src="png/CreateSession.png" width="550rem">

<a name="StartSession"></a>
### Start Session
<img src="png/StartSession.png" width="550rem">

<a name="Attack"></a>
### Attack
<img src="png/attack.png" width="550rem">

<a name="EnableReaction"></a>
### Enable Reaction
<img src="png/EnableReaction.png" width="550rem">

<a name="ConnectToSession"></a>
### Connect To Session
<img src="png/ConnectToSession.png" width="550rem">

<a name="Classdiagram"></a>
## 📐 Class diagram
<img src="png/Class Diagram.png" width="550rem">
