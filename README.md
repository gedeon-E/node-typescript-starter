# NODE TYPESCRIPT STARTER

## Features

### 1 . DB Connection with Sequelize

In this module we connect express with sequelize
https://sequelize.org/docs/v6/getting-started/

In this project we use a Mysql DB, but sequelize also gives you possibility to connect to : 
- `Mariadb`
- `Postgres`
- `SQliteDB`
- `Microsoft SQL Server`
- `Oracle Database`	

The `docker-compose.yml` file, also is configured to connect the project on a MySQL Image, you should updated it, if you intend to use another DBMS


#### Note on usage of Typescript with Sequelize

The plugin used to combine typescript and sequelize is not the official of `sequelize.org`.
But as precised in the documentation, it still in work in progress. They recommand to use package `sequelize-typescript` 
(https://www.npmjs.com/package/sequelize-typescript) until their improvements are ready to be released.

Please check the official page to be informed on a potential update (https://sequelize.org/docs/v6/other-topics/typescript/)

### 2 . Protecting route with Json Web Token

In this module we use `jsonwebtoken` to protect the routes of this api

https://github.com/auth0/node-jsonwebtoken#readme

## Installation

1. Add environnement variables `cp .env.example .env`
2. Update variables in `.env` file
3. Update ***JWT_SECRET*** key in ***.env***
### you can generate new `JWT_SECRET` on https://jwtsecretkeygenerator.com/
4. Install dependencies: `yarn install`
5. Build TS to JS: `yarn build`
6. Run migrations: `yarn sequelize-cli db:migrate`
7. Run seeders: `yarn sequelize-cli db:seed:all`

## Run development server

Serve with hot reload at http://localhost:[port]/ : `yarn dev`

Api will runing on  http://localhost:[port]/api

## Run production server

Build for production and launch server:

```
yarn build
yarn start
```


## Generate static project

`yarn generate`


## DOCKER

- Create image `docker build . -t node-typecript-starter`

- Run container `docker run -p 8000:8000 -d node-typecript-starter`

With Docker compose

- Run the containers `docker compose up -d`

- Stop the containers `docker compose down`

- Rebuild images and run containers `docker compose up -d --build`