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

### Set

### Session

### Middleware



## Flashcard seletiona algorithm
