# Scheda DnD 5e Backend

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
[![Axios](https://img.shields.io/badge/Made%20with-Axios-5A29E3?style=plastic&logo=axios&logoColor=white)](https://axios-http.com/)

<a name="index"></a>
## 📘 Table of Contents

* [🎯 Project Goal](#Projectgoal)
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
  * [Create Session](#CreateSession)
  * [Start Session](#StartSession)
  * [Enable Reaction](#EnableReaction)
  * [Connect To Session](#ConnectToSession)
* [📐 Class diagram](#Classdiagram)
* [🪄 Patterns used](#Patternsused)
  * [Middlewares: Chain of Responsability](#ChainofResponsability)
  * [Higher Order Functions](#Hof)
  * [Exceptions handling: Factory Method](#Factory)
  * [Data sources handling: Repository](#RepFacSingleton)
  * [Websocket communication: Observer](#Observer)
* [🐋 Docker](#Docker)
* [⚙️ Technologies used](#Technologiesused)
* [👨🏻‍💻 Authors](#Authors)

<a name="Projectgoal"></a>
## 🎯 Project Goal

### Complete Management of DnD Combat Sessions

The backend is designed to offer complete management of combat sessions in "_Dungeons & Dragons 5e_", integrating directly with character created by players and npc sheets created by the master. These are created through the dedicated Flutter application, "_SchedaDnD5e_", which serves as the frontend for interaction with the system.

> ### [📱 Scheda D&D 5E - The mobile app](https://github.com/MrPio/Scheda_DnD_5e/tree/master)


### Main Backend Features

The requirements for this project are detailed in the following document, unfortunately in 🇮🇹 language.

> ### [📘 Scheda D&D 5E Backend - Requirements](/doc/Scheda%20DnD%205E%20Requirements.docx)

<!-- 1. **Combat Session Management**
   - **Creation and Update**: Allows the creation of new combat sessions and the update of existing sessions. Each session includes attributes such as name, session status, map size, and participants (characters, NPCs, monsters).
   - **Status Monitoring**: Manages and updates session status (created, in progress, paused, ended), and maintains event history via historical messages.

2. **Entity Management**
   - **Characters and Monsters**: Manages character and monster sheets and their variations during combat. Such variations can include, for example, decreased HP, spell castings with consumable slots, and much more allowed by the game rules. Each entity can also have a reaction status with respect to other entities that can be enabled or disabled during play.
   - **Turn Management**: Monitors and updates the states and positions of entities during game turns, keeping track of their location on the map and turn index.

3. **Real-Time Interaction**
   - **WebSocket for Real-Time Updates**: Uses WebSocket to provide real-time updates during combat sessions. This includes handling dice rolls and other actions that require instant interactions between players and the master.
   - **Synchronization**: Ensures that all changes made by player actions or status changes are synchronized in real time with the frontend, enhancing the interactive gaming experience.

4. **Authentication and Security**
   - **JWT for Authentication**: Uses JSON Web Tokens (JWT) to manage user authentication. This ensures that only authorized users can access and modify combat sessions and entities.

5. **Performance and Caching**
   - **Data Caching**: Implements a caching system through Redis to improve the performance of frequent requests and reduce the load on the database. Temporarily stores information for quick access without having to query Sequelize or Firestore each time.
   - **Error Management and Feedback**: Provides clear and detailed responses for common errors, such as entities not found or attempts at impermissible actions.

6. **Persistence and Synchronization**
   - **Data Persistence**: Ensures that all changes to entities and sessions are saved in the database. Uses Sequelize for data management, ensuring persistent and consistent updates.
   - **Synchronization with Frontend**: Maintains data synchronization between the backend and frontend, ensuring that changes to sessions and entities are reflected in real time in the user interface. -->

<a name="Usecasediagram"></a>
## 📄 Use case diagram

<a name="Actors"></a>
### Actors
The player roles can be mapped as follows. Note that although the client must be authenticated via JWT to participate in the combat session, there is still a route that does not require authentication, namely the `diceRoll/` route.

<img src="png/Actors.png" width="450rem">

<a name="Sessionmanagement"></a>
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
| `PATCH` |`/sessions/{sessionId}/attack` | entityId, attackInfo, attackType | Causes `attackerId` to attack an entity. The `attackType` must contain the type of attack being made, which can be melee or enchantment. The `attackInfo` must contain the attempt dice roll. If this is greater than the target's AC, the attacker is asked to roll the damage dice. |
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

<a name="Patternsused"></a>
## 🪄 Patterns Used

The following patterns have been used in the development of solutions for the most critical aspects of the project. 

---
<a name="ChainofResponsability"></a>
### Chain of Responsability

The adoption of the Model-View-Controller architectural pattern makes it possible to decouple the management of the business logic, which is handled by the model, from the routing, which is handled by the controller.

However, the introduction of middleware in conjunction with the Chain of Responsability pattern allows the request validation phase to be decoupled from the response generation phase. In essence, the controller is only reached if all the middleware succeeds.

Middleware is natively supported by [_Express_](https://github.com/expressjs/express), and each can be thought of as a validator for a single aspect of the client request, independent of all others. This allows them to be reused across multiple routes in a very elegant way.

---
<a name="Hof"></a>
### Higher Order Functions

To generalize the middleware, higher order functions were used.

For example, _body parameter type validation_ has been separated from the per-route middleware and delegated to the standalone `checkMandadoryParams` middleware.

```typescript
app.get('/diceRoll',
  checkMandadoryParams(['diceList']),
  checkParamsType({ diceList: ARRAY(ENUM(Dice)), modifier: INTEGER }),
  ...
```

`checkParamsType` is a higher order function that takes as input an object where the keys are the body parameters and the value is the type checker function, and returns the middleware for that particular type check validation.

The type checker functions may be themselves higher order functions. For example, `ARRAY` takes a type checker function as input and returns a type checker function that checks that the object provided is an array and then applies the latter to all the elements of the array.

```typescript
export const ARRAY =
  (next: (arg0: object) => boolean) =>
    (obj: object) =>
      Array.isArray(obj) && obj.every(it => next(it));
```

---
<a name="Factory"></a>
### Factory Method

The factory method pattern has been used to centralize both client-side and server-side exceptions that may arise when handling the client request. It provides a **lever of abstraction** that helps the client code to ignore the actual error response generation, instead only requiring it to specify which [`ErrorProduct`](/src/error/error_product.ts) to use.

This is implemented in the [`/src/error`](/src/error/) directory.

---
<a name="RepFacSingleton"></a>
### Repository

In this project, three different data sources are used:
- `Firebase Firestore`: Stores the mobile app objects, such as **players**, **characters**, **enchantments** and **npc**.
- `PostgreSQL`: Stores the combat session related information, such as **sessions** and **monsters**.
- `Redis`: Implements an abstraction layer on top of the other two. Also caches the **Firebase JWT** with a short TTL to help reduce validation calls to the Firebase API (necessary because Firebase Auth uses a rolling public key, which is needed to validate the JWT signature).

As different objects are stored in different places, the repository pattern comes in very handy for decoupling from the location of the data.

Thanks to the repository pattern, client code can ignore not only which database the object is stored in, but also the caching policy, which is handled entirely by the repository itself.

This is implemented in the [`/src/repository`](/src/repository/) directory.

<a name="Observer"></a>
### Observer
The websocket server makes extensive use of the observer design pattern using the [_RxJS_](https://rxjs.dev/) library.

Callback functions are subscribed to `Subject` objects, which are called repeatedly by the `open`, `message` and `close` websocket events.

The `timer` observable is used to prevent starvation when waiting for a player response through websocket. If the player answers or disconnects instead, the timer is interrupted using the `takeUntil` function, which interrupts the timer emission before it reaches the abort `Subject`.

This is implemented in the [`/src/websocket/websocket.ts`](/src/websocket/websocket.ts) directory.

<a name="Docker"></a>
## 🐋 Docker

The project is containerized using Docker and Docker Compose. In particular, the `docker.api` file contains the instructions for containerizing the API server, while the `docker.websocket` file outlines the process of containerizing the WebSocket server. Additionally, the `docker-compose.yml` file contains also instructions for creating containers dedicated to the Postgres and Redis databases. These containers are based on public images sourced from Docker Hub.

### The following commands are to be used to start the four containers:
- Build API container with image tag **api_img**: `docker build -t api_img -f .\Dockerfile.api .`
- Build Websocket containerwith image tag **websocket_img**: `docker build -t websocket_img -f .\Dockerfile.websocket .`
- Start all four containers: `docker-compose up -d`

In _compose up_ **-d option**, or _detached mode_, enables the creation and initiation of containers that run in the background, thus freeing up the terminal for other tasks.

<a name="Technologiesused"></a>
## ⚙️ Technologies used

- **Database**: _Sequelize_ with support for _PostgreSQL_ for entity and session management.
- **Data Modeling**: _Sequelize ORM_ for defining models and managing relationships between entities.
- **Authentication**: _JWT_ to ensure secure and authorized access.
- **Caching**: _Redis_ for cache management and performance improvement.
- **API**: _RESTful API_ for communication between the frontend and backend, managed with _Express_.
- **WebSocket**: For real-time communication during combat sessions.
- **Package Management**: _NPM_ for package and dependency management.
- **Containerization**: _Docker_ for creating and managing isolated environments.
- **Reactive Programming**: _RxJS_ for handling data streams and asynchronous events.
- **HTTP requests**: _Axios_ for handling HTTP requests and interaction between the two API servers.
- **Testing**: _Postman_ for creating API requests used for testing.

<a name="Authors"></a>
## 👨🏻‍💻 Authors

| Name            | Email           | GitHub                        |
|-----------------|-------------------------------|-------------------------------|
| Valerio Morelli | s1118781@studenti.univpm.it    | [MrPio](https://github.com/MrPio) |
| Enrico Maria Sardellini | s1120355@studenti.univpm.it | [Ems01](https://github.com/Ems01)|
| Federico Staffolani | s1114954@studenti.univpm.it | [fedeStaffo](https://github.com/fedeStaffo) |
