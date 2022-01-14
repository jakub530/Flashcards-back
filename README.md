# Flashcards-back

## Schema

### User

#### Description

#### Properties

| Field Name    | Type           | Required  | Unique |
| ------------- |:-------------:| :-----:| -----:|
| name     | String | Yes | No  |
| email    | String | Yes | Yes | 
| password | String | Yes | No  |
| tokens   | Array  | No  | No  |

### Card

#### Description 

#### Properties

| Field Name    | Type           | Required  |
| ------------- |:-------------:| :-----| 
| term          | String | Yes |
| definition    | String | Yes |
| set           | Set    | Yes |

### Session

#### Description 

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

#### Description 

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

### Set

#### Description 

#### Properties

| Field Name    | Type           | Required  
| ------------- |:-------------:| :-----| 
| name          | String | Yes | 
| description    | String | No | 
| owner           | User    | Yes | 
| access           | String    | Yes | 
| settings           | Map    | No | 

## Endpoints

## Flashcard seletiona algorithm
