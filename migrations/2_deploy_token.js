const Token = artifacts.require('Token');
const getConfig = require('../config.js');

module.exports = function (deployer, network, accounts) {
  const config = getConfig(accounts);
  console.log(accounts)
  console.log(config)
  deployer.deploy(Token, 'MyCHIP', 'CHIP', config.tokenDecimalPlaces, config.options);
};
