# MarketPOP - Cloud-native Web App

Welcome to **MarketPOP**! This project is a cloud-native web app for an online second-hand marketplace. This README provides instructions on how to set up and run the app using Docker.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Usage](#usage)

## Getting Started

To get started with **MarketPOP**, you will need to set up Docker and ensure that it's working on your machine. Once you have Docker installed, follow the instructions below to run the app.

## Prerequisites

Before running the app, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started): Make sure Docker is installed and running.
- [Docker Compose](https://docs.docker.com/compose/): Typically included with Docker installations.

### Verify Your Installation

To verify that Docker is installed correctly, run:

```bash
docker --version
```

To check Docer Compose, use:

```bash
docker compose version
```

## Installation

Clone the repository to your local machine:

```bash
git clone https://gitlab.surrey.ac.uk/nb00740/cloud-native-web-app
```

Navigate to the project directory:

```bash
cd cloud-native-web-app
```

## Usage

To build and run the application, use Docker Compose:

```bash
docker compose up --build
```

This command will build the Docker images and start the necessary containers. The app should be accessible at the following URL: http://localhost:3000. Check your Docker logs for additional details.

### Stopping the App

To stop the running containers, use:

```bash
docker compose down
```

This command stops and removes all running containers defined in the docker-compose.yml file.
