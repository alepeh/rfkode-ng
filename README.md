# RfkodeNg

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.1.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npm run test` to execute the unit tests via [Jest](https://jestjs.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Hosting
The repository contains a cloudformation template to setup static hosting on AWS making use of Route 53, Cloudfront and S3. A prerequisite to run the template is to setup a hosted zone in Route 53 as well as a certificate for your domain in ACM.
Create Public hosted zone using a domain name of your choosing.
If your domain is currently hosted by a different provider, you need to update the DNS configuration and add the Route 53 nameservers as NS records to your domain.

## Authentication
Is delegated to auth0.
The auth0 client needs to be initiaöized with the domain and clientId that you get from the auth0 management dashboard for your app.
These values should be put in a ```.env``` file locally.

```
AUTH0_CLIENTID=
AUTH0_DOMAIN=
```
The github action looks for these values in the repository secrets and sets them as environment values during build.
The setEnv.ts script generates the angular environment files and sets the values so we can use them to initialize the client.
[github source for setEnv.ts](https://gist.github.com/richierich25/ba4170ef5bdcc4ea3739bdec3c04e97d#file-setenv-ts) 

## State Management
