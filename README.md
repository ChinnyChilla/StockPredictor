<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/6wj0hh6.jpg" alt="Project logo"></a>
</p>

<h3 align="center">Money Maker</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/kylelobo/The-Documentation-Compendium.svg)](https://github.com/ChinnyChilla/StockPredictor/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/kylelobo/The-Documentation-Compendium.svg)](https://github.com/ChinnyChilla/StockPredictor/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> Options algoithms during earnings.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [TODO](../TODO.md)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

This is a website that will hopefully give you some insights and algorithms you can use for option trading during earnings season.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

#### Note: I used Python 3.11.13 when making this

Firstly, download all the server pre-requisites by going into the `server` folder and then

`pip install -r requirements.txt`

Now rename the `.env.example` to just `.env` and fill in the blanks

#### Note: Node 22.x is required
Next, you want to download all the front-end requirements by going into the `stock-predictor` folder and then

`npm install`

#### Installing Nginx for reverse proxy

Run `sudo apt install nginx` if on Linux, or `brew install nginx` if on Mac

If on Linux:
1. Create a file in the directory `/etc/nginx/sites-available` and paste the config in `nginx.conf` into it, change the port to what you want
2. Run `sudo nginx -t` to make sure everything is OK
3. Run `sudo systemctl reload nginx` to save changes

If on Mac:
1. Create a directory in `/opt/homebrew/etc/nginx` called `servers
2. Create a file called `dev.conf` in that directory
3. Paste the config in `nginx.conf` into that file
4. In the file `/opt/bhomebrew/etc/nginx/nginx.conf` add the below line to the http dictionary
```
include servers/*;
```
5. Run `nginx -t` to make sure everything is OK
6. Run `sudo nginx -s reload` to save changes

### Installing

#### Running the backend
1. In a terminal, run `cd server`
2. Then start the backend by running
```
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Running the frontend
1. In a terminal, run `cd stock-predictor`
2. Then start the frontend by running
```
npm run dev
```

If you set up nginx correctly, now you can access the server from the port you specified in the config file!


## 🚀 Deployment <a name = "deployment"></a>

#### Deploying the backend
1. Make sure all the prerequisites are filled
2. Run either

(preferred)
```
fastapi run main.py --workers 4
```
or
```
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Deploying the frontend
1. Make sure all the prequisites are filled
2. In the `stock-predictor` folder, run `npm run build`
3. Then run `npm run start`

#### Changing the proxy
Ideally you want the server running on port 80 or port 443, so change the config file to do that

If you decide to use port 443, you need to add these 2 lines to your config file
```
 ssl_certificate /path/to/certificate;
 ssl_certificate_key /path/to/key;
```

## ⛏️ Built Using <a name = "built_using"></a>

- [MySQL](https://www.mysql.com/) - Database
- [FastAPI](https://fastapi.tiangolo.com) - Server
- [NextJS](https://nextjs.org) - Web Framework
- [Nginx](https://nginx.org) - Backend Proxy

## ✍️ Authors <a name = "authors"></a>

- [@ChinnyChilla](https://github.com/ChinnyChilla) - Idea and Coding

See also the list of [contributors](https://github.com/kylelobo/The-Documentation-Compendium/contributors) who participated in this project.

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- Thank you to (someone will find later) for the inital algorithm
