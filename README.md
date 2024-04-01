
# Betpoa Backend API

Betpoa backend api is an API server for a sports gambling application built with nodejs and fastify. It allows for placing bets with automated bets reconcilitation and payouts


## Documentation

[Documentation](https://walrus-app-24qv2.ondigitalocean.app/api/documentation)

![App Screenshot](https://github.com/cyrillekey/betpoa-backend/blob/master/screely-1711998173715.png?raw=true)


## Demo

You can access a live demo of the application at [Demo](https://walrus-app-24qv2.ondigitalocean.app/)


## Tech Stack

**Server:** Node, Fastify
**Tools** Sentry,Scalar
**Deployment** Docker
**Payment processing** Mpesa
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL`
`APP_EMAIL_HOST`
`APP_EMAIL_PASSWORD`
`APP_EMAIL_ADDRESS`
`APPLICATION_NAME`
`STK_ROOT_DOMAIN`
`XRapidAPIKey`
`XRapidAPIHost`
`AFRICAS_TALKING_API_KEY`
`LEOPARD_APP_NAME`
`LEOPARD_API_KEY`
`LEOPARD_API_SECRET`
`LEOPARD_ACCESS_TOKEN`
`JWT_SECRET_KEY`

refer to .env.sample to create an .env file needed for the project to run

## Run Locally

Clone the project

```bash
  git clone https://github.com/cyrillekey/betpoa-backend.git
```

Go to the project directory

```bash
  cd betpoa-backend
```

Install dependencies

```bash
  npm install
```
Build the server
```bash
  npm run build:ts
```
Start the server

```bash
  npm run start
```


## Deployment

To deploy this project you will need to docker hub account and basic docker skills or use the automated actions by filling in the actions secret to build and push the image to your favourite registry and use it in whichever provider you prefer

Secret envs are:

`DOCKERHUB_USERNAME`.   
`DOCKERHUB_TOKEN`.   


You can find more resources about docker at:  
[Docker](https://www.docker.com/).  
[Digital ocean tutorial](https://www.digitalocean.com/community/tutorial-collections/how-to-install-and-use-docker)



## Feedback

If you have any feedback, please reach out to us at cyrilleotieno7@gmail.com


## Contributing

Contributions are always welcome!


