
const SHA256 = require('crypto-js/sha256');
const BlockClass = require('../Block/index.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    constructor() {
        this.initializeChain();
        this.chain = [];
        this.height = -1;
    }

    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    getChainHeight() {
        return new Promise((res, rej) => {
            res(this.height);
        });
    }

    _addBlock(block) {
        let self = this;
        return new Promise(async (res, rej) => {
         block.height = self.chain.length;
         block.time = new Date().getTime().toString().slice(0,-3);
         if (self.chain.length > 0) {
           block.previousBlockHash = self.chain[self.chain.length -1].hash;
         }
         block.hash = SHA256(JSON.stringify(block)).toString();
         self.chain.push(block);
         res(block);
        });
    }

    requestMessageOwnershipVerification(address) {
        return new Promise((res) => {
          let msg = address + ":" + new Date().getTime().toString().slice(0,-3) + ":starRegistry";
          console.log(msg)
          res(msg);
        });
    }

    submitInfo(address, message, signature, info) {
        let self = this;
        return new Promise(async (res, rej) => {
          let msgTimestamp = parseInt(message.split(":")[1])
          let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
          //
          if (currentTime - msgTimestamp > 300) {
            rej("Time diff is greater than 5 minutes")
          }
          //
          if (bitcoinMessage.verify(message, address, signature) == false) {
                rej('Signature verification failed');
          }
          //
          let newBlock = new BlockClass.Block({owner: address, info: info});
          await this._addBlock(newBlock);
          res(newBlock);

        });
    }

    getBlockByHash(hash) {
        let self = this;
        return new Promise((res, rej) => {
          block = self.chain.filter(blk => blk.hash === hash)[0];
          if (block) {
              res(block);
          } else {
              rej("[BLOCK] NOT FOUND");
          }
        });
    }

    getBlockByHeight(height) {
        let self = this;
        return new Promise((res, rej) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                res(block);
            } else {
                res(null);
            }
        });
    }

    getInfoByWalletAddress (address) {
        let self = this;
        let info = [];
        return new Promise((res, rej) => {
          self.chain.forEach(async function(block) {

                await block.getBData().then(function(blockData) {
                  if (blockData.owner == address) {
                    info.push(blockData);
                  }

                });

            });
        res(info);
        });
    }

    validateChain() {
        let self = this;
        let errLog = [];
        return new Promise(async (res, rej) => {

          self.chain.forEach(async function(block, height) {

              let previousBlockHash = null;
              if (height > 0) {
                  previousBlockHash = self.chain[height-1].hash;
              }

              if (block.previousBlockHash != previousBlockHash) {
                  errLog.push('Previous Block Hash is invalid');
              }

              await block.validate().then(function(isValid) {
                  if (isValid == false) {
                      errLog.push('This Block is not valid.');
                  }
              });

          });

          res(errLog);
        });
    }

}

module.exports.Blockchain = Blockchain;
