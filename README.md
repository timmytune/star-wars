# STAR WARS API

API for getting star wars movies, characters and also to add comments to the movies

for Postman collection click [here](https://documenter.getpostman.com/view/3507920/UVCBC5Ng)

## Stack

- typescript
- expressJS(server framework)
- sequelize(ORM)
- MySQL(Database)  
- git (for cloning code)

## Pre-requisities

- Runs on Node versions >= 12
- Active connection to a MySQL Database Instance

## Getting code  

```bash
git clone
```

## Installing

From the project root directory

```bash
npm install
```

## Enviroment variables

Make sure you have the required envirement varaibles set without the them the apllication will fail to start, the required ones are

- DB_NAME (MySQL database name)
- DB_PASS (MySQL Password)
- DB_HOST (MYSQL HOST)
- DB_USER (MySQL user)
- DB_PORT (MySQL Port)

There are also optional ones

- SWAPI_BASE             (Base URL for the swapi service )
- FILM_CACHE_TIME        (time in hours to store movies in cache)
- FILM_CACHE_LIMIT       (maximum number of films that can be cached)
- CHARACTER_CACHE_TIME   (time in hours to store characters in cache)
- CHARACTER_CACHE_LIMIT  (maximum number of characters to store in cache)
- PORT                   (port to listen to)

You can provide the eviroment varibles any how you can as long as it is accessible to the process but you can also provide a .env file at the root of the project and the variables stored in it will be accessible in the process, a typical example of a .env file:

```env
DB_HOST=localhost
DB_USER=test
DB_NAME=test
DB_PASS=test_password
DB_PORT=3306
```

## Running the code locally (dev)

From the project root directory

```bash
npm run dev
```

## Running the code locally (production)

From the project root directory

```bash
npm run build

npm run start
```

## Run code with docker

From the project root directory (Asuming you have a .env file at the root folder and please don't quote your variables because docker will add the quotes as part of the variable)

```bash

docker build -t starwars .

docker run --env-file ./.env  -dp 3000:3000 starwars 

```

## Data structure

The API only consist of get and post requests with the following 4 status codes:

- 200 (Request completed without issues)
- 206 (Request completed with partial issues)
- 400 (Request failed validation)
- 500 (Something wrong happened but it is not your fault)

There also some common fields:

- message (type string) telling you generally about the request this field is always present
- errors  (type string array) array of error messages recieved this field is always populated with status codes 206, 400 and 500
- data (object or array) this the actual results and is only present with status code 200 and 206

## Endpoins

There are only 5 endpoiints for this service:

### Home

Returns a string message

TYPE: GET

URL:

```javascript
{{base}}
```

PARAMETERS: (none)

SAMPLE RESPONSE 1 (200):

```json
{
    "message": "Welcome to the star wars API"
}
```

### GET FILMS

Returns the list of all star wars films

TYPE: GET

URL:

```javascript
{{base}}/api/v1/films
```

PARAMETERS: (none)

SAMPLE RESPONSE: (check postman collection)

### GET CHARACTERS

Returns the list of characters in a movie

TYPE: GET

URL:

```javascript
{{base}}/api/v1/characters/:film_id/:sort/:sort_type/:filter
```

PARAMETERS:

- film_id (number): id of the fil you want to get characters for
- sort (one of height|name|gender): field to use in sorting the result
- sort_type (one of asc|dsc): wether to sort the result ascending or descending order
- filter (one of na|valid string|all): filter by gender of character, na stands for "n/a" because the "n/a" is not valid in a URL, all stands for all genders that is no filters and any valid string too is allowed and will return a result as long as there is a character with that gender value

SAMPLE RESPONSE: (Check postman collection)

### CREATE COMMENT

Adds a comment to a movie

TYPE: POST

URL:

```javascript
{{base}}/api/v1/comments
```

PARAMETERS: (none)

Body: (json)

```json
{
    "film_id": 26,
    "body": "dd"
}
```

- film_id (number): a valid film id you want to comment on
- body (string): not more than 500 characters of the comment body


SAMPLE RESPONSE: (Check postman collection)


### GET COMMENTS

Returns the list of comments

TYPE: GET

URL:

```javascript
{{base}}}/api/v1/comments
```

QUERY PARAMETERS:

- page (number): (optional) page of comments for the current prameters, if the page is not a valid number error is returned
- search (string): (optional) used to search the body of the result
- film_id (number): (optional) id of film you want to load comments for

SAMPLE RESPONSE: (Check postman collection)

## License 
MIT
