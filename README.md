# Flashcards-back

This repository holds code for backend of https://flashcards-jj.com. It is written in Node.js with Express framework. It is hosted using Heroku. 

## Schema

### User

Represents a single user. New user gets created during registration via post endpoint. Tokens field stores list of available tokens, meaning user can be logged in from multiple devices at the same time.

#### Fields

| Field Name    | Type           | Required  | Unique |
| ------------- |:-------------:| :-----:| -----:|
| name     | String | Yes | No  |
| email    | String | Yes | Yes | 
| password | String | Yes | No  |
| tokens   | Array  | No  | No  |

### Set

Represents set of flashcards belonging to particular user. Two of the fields (access and settings) are currently unused. The idea of access field is to make it possible to share your sets with other people, provided you set it to public. 

#### Properties

| Field Name    | Type           | Required  
| ------------- |:-------------:| :-----| 
| name          | String | Yes | 
| description    | String | No | 
| owner           | User    | Yes | 
| access           | String    | Yes | 
| settings           | Map    | No | 

### Card

Represents a flashcard of the set. Contains term and definition as well as the set that it belongs to.

There are no endpoints affecting single card directly, it is always changed together with other Cards in the Set.

#### Properties

| Field Name    | Type           | Required  |
| ------------- |:-------------:| :-----| 
| term          | String | Yes |
| definition    | String | Yes |
| set           | Set    | Yes |

### Session

Represents a learning session belonging to particular user. It can hold multiple sets. During Session creation SessionItem is created for each card in sets selected in the session. 

The most important property of the session is state, since it holds all information needed to progress learning session. State is changed by simple endpoint, which takes a single argument - whether or not flashcard has been answered correctly. 

#### Properties

| Field Name    | Type           | Required  | Parent Field |
| ------------- |:-------------:| :-----:|  -----:|
| name          | String | Yes   | - |
| description   | String | Yes   | - |
| owner         | User   | Yes  | - |
| sets          | Array (Set) | Yes  | - |
| state         | Object   | Yes  | - |
| previousItems      | Array (SessionItem) | Yes  | state |
| currentItem      | SessionItem | Yes  | state |
| currentBucket      | Nummber | Yes  | state |
| currentCount      | Nummber | Yes  | state |
| itemFlag      | String | Yes  | state |
| bucketLevels      | Array (Number) | Yes  | state |
| noItems      | Boolean | Yes  | state |
| settings      | Object | Yes  | - |
| buckets      | Number | Yes  | settings |

### SessionItem

Represent a signle card in particular learning session. 

Simmilar to card SessionItem has no endpoints affecting it directly. It gets changed alongside its Session.

#### Properties

| Field Name    | Type           | Parent Field  | 
| ------------- |:-------------:| -----:| 
| session          | String ( Session ID) | 
| card    | String (Card ID) | -  | 
| bucket           | Number    |   -  | 
| finished           | Boolean    |   -  | 
| history            | Array (Object) |   -  | 
| date | Date | history|
| outcome | String | history |



## Endpoints

### User

1. POST /users: 

Creates a new user. In addition it generates and return a token used for authorization. 

2. POST /users/login: 

Logs in user based on given credintials and return authorization token.

3. GET  /users/me:

Returns information about the current user.

4. POST /users/logout:

Deletes the authorization token used by the request, effectively logging user out from current device.

5. POST /users/logoutAll:

Deletes all authorization tokens, logging user out from all devices.

6. PATCH /users/me:

Modifies current user profile. 

7. DELETE /users/me:

Deletes current user from database.

### Set
1. POST /sets

Creates a set and flashcards for the set. 

2. POST /sets/copy/:id

Takes public set and creates a copy of the set assigned to currently logged in user.

3. GET /sets

Returns list of all sets belonging to currently logged in user.

4. GET /sets/:id

Returns single set alongside all of the cards belonging to the given set.

5. PATCH /sets/:id

Modifies a set and all of the cards within the set. It matches cards based on their ID and modifies/deletes/creates cards accordingly.

6. DELETE /sets/:id

Deletes a set and all of the card belonging to the given set.


### Session
1. POST /session

Creates a new session, taking a list of sets as argument. It also creates all SessionItems corresponding to the cards in selected sets.

2. POST /session/evolve/:id

Changes state of the session, based on correct/incorrect response to the flashcard.

3. GET /session

Retruns all of the sessions owned by a given user.

4. GET /session/state/:id

Returns a state of a given session. 

5. DELETE /session/:id

Deletes a session alongside all of the SessionItems connected to the session.

6. GET /session/cards/:id

Returns SessionItems and their corresponding card information for a given session.


### Middleware

The middleware used for most endpoints is an auth middleware. It validates that the token, passed in header is a valid one, and finds a user corresponding to the given token. It later passes this user to the actual endpoint.


## Flashcard selection algorithm

Algorithm used for selection of the next flashcard works in the following way:
1. When a bucket is decided, flashcards will be drawn from the bucket until either 20 flashcards are drawn, or the bucket is empty.
2. Next bucket selected is the rightmost bucket, which has at least 10 cards.
3. If there is no such bucket, the rightmost non-empty bucket is selected instead.
4. Algorithm works best on session with a size of 100+.
