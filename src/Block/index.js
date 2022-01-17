
const SHA256 = require('crypto-js/sha256');
const hex2ascii = require('hex2ascii');


class Block {

  constructor(data) {
    this.body = Buffer(JSON.stringify(data)).toString('hex');   
		this.previousBlockHash = null;
    this.height = 0;  
		this.hash = null;                                                                                                            
  }
  
    validate() {
        let self = this;
        return new Promise((res, rej) => {
            let current_hash = self.hash;
						self.hash = null;

            var calculated_hash = SHA256(JSON.stringify(self)).toString();

						self.hash = current_hash;

            if (current_hash == calculated_hash) {
              return res(true);
            } else {
              return res(false);
            }
          
        });
    }

    getBData() {

			let self = this;
        return new Promise((res, rej) => {

            if (self.height == 0) {
                rej('Genesis Block - Height is missing - Block Information are missing');
            }

            let decodedBody = JSON.parse(hex2ascii(self.body));

            res(decodedBody);
        });
    }

}

module.exports.Block = Block;                 
