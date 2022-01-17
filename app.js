
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");


const Blockchain = require('./src/blockchain/index.js');


class Server {

	constructor() {
	
		this.app = express();
		this.initExpress();
		this.initExpressMiddleWare();
		this.initControllers();
		this.start();

		this.blockchain = new Blockchain.Blockchain();
	}

	initExpress() {
		this.app.set("port", 8888);
	}

	initExpressMiddleWare() {
		this.app.use(morgan("dev"));
		this.app.use(bodyParser.urlencoded({extended:true}));
		this.app.use(bodyParser.json());
	}

	initControllers() {
        require("./src/BlockchainController")(this.app, this.blockchain);
	}

	start() {
		let self = this;
		this.app.listen(this.app.get("port"), () => {
			console.log(`Server is Running on port: ${self.app.get("port")}`);
		});
	}

}

new Server();