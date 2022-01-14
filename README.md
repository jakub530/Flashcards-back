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

| Field Name    | Type           | Required  | Unique |
| ------------- |:-------------:| :-----:| -----:|
| term          | String | Yes | No  |
| definition    | String | Yes | No | 
| set           | Set    | Yes | No  |

### Session

#### Description 

#### Properties

| Field Name    | Type           | Required  | Unique | Parent Field |
| ------------- |:-------------:| :-----:| :-----:| -----:|
| name          | String | Yes | No  | - |
| description   | String | Yes | No  | - |
| owner         | User   | Yes | No  | - |
| state         | Object   | Yes | No | - |
| sets          | Array (Set) | Yes | No | - |
| settings      | Object | Yes | No | - |

### SessionItem

#### Description 

#### Properties

| Field Name    | Type           | Required  | Unique |
| ------------- |:-------------:| :-----:| -----:|
| term          | String | Yes | No  |
| definition    | String | Yes | No | 
| set           | Set    | Yes | No  |

### Set

#### Description 

#### Properties

| Field Name    | Type           | Required  | Unique |
| ------------- |:-------------:| :-----:| -----:|
| term          | String | Yes | No  |
| definition    | String | Yes | No | 
| set           | Set    | Yes | No  |

## Endpoints

## Flashcard seletiona algorithm
