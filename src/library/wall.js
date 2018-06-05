import abi from './abi.json';
import config from './config.json';

var web3, contract;

// Gatsby isn't able to build the web3 npm and it's dependencies. This is hack to get around it.
// The wall page includes the web3.min.js from the CDN and wait's till the page has loaded
// before calling init.
function init() {
  return new Promise((resolve, reject) => {
    if (!window.web3) {
      reject(1);
    } else {
      web3 = new Web3(!config.local ? window.web3.currentProvider : config.host);
      web3.eth.net.getId().then((network) => {
        if (network != 3) {
          reject(2);
        } else {
          contract = new web3.eth.Contract(abi, !config.local ? config.ropstenAddress : config.localAddress);
          resolve();
        }
      });
    }
  })
}

function getAccount() {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      resolve(accounts[0]);
    });
  });
}

function verifyNetwork() {
  return new Promise((resolve, reject) => {
    web3.eth.net.getId((err, netId) => {
      if (netId == 3) resolve();
      else reject();
    });
  });
}

function getAddresses() {
  return web3.eth.getAccounts();
}

function createPost(text, font, red, green, blue) {
  return getAccount().then((account) => {
    return contract.methods.createPost(text, font, red, green, blue).send({from: account, gas: 250000});
  });
}

function updatePost(index, text, font, red, green, blue) {
  return getAccount().then((account) => {
    return contract.methods.updatePost(index, text, font, red, green, blue).send({from: account, gas: 200000});
  });
}

function getPostsCount() {
  return contract.methods.getPostsCount().call();
}

function listForSale(index, price) {
  return getAccount().then((account) => {
    return contract.methods.sellPost(index, web3.utils.toWei(price, 'ether')).send({from: account, gas: 70000});
  });
}

function unlistForSale(index) {
  return getAccount().then((account) => {
    return contract.methods.closePostSale(index).send({from: account, gas: 20000});
  });
}

function buyPost(index, price) {
  return getAccount().then((account) => {
    return contract.methods.buyPost(index).send({from: account, gas: 40000, value: web3.utils.toWei(price, 'ether')});
  });
}

function getPosts(offset, size) {
  return contract.methods.getPostsCount().call().then((result) => {
    let start = Math.min(offset, Math.max(result - 1, 0));
    let finish = Math.min(offset + size, result);
    let promises = [];
    for (let i = start; i < finish; i++) {
      promises.push(contract.methods.getPost(i).call());
    }
    
    return Promise.all(promises);
  }).then((posts) => {
    for (let i = 0; i < posts.length; i++) {
      posts[i].color = {r: posts[i].red, g: posts[i].green, b: posts[i].blue};
      posts[i].price = web3.utils.fromWei(posts[i].price, 'ether');
    }
    return Promise.resolve(posts);
  });
}

module.exports = {
  getAddresses,
  createPost,
  updatePost,
  getPosts,
  getPostsCount,
  getAccount,
  listForSale,
  unlistForSale,
  buyPost,
  init
};