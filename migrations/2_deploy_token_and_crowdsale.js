const Token = artifacts.require('Token');
const Crowdsale = artifacts.require('Crowdsale');
const getConfig = require('../config.js');

module.exports = function (deployer, network, accounts) {
  const config = getConfig(accounts);
  // deployer.deploy(Token, 'MyCHIP', 'CHIP', config.tokenDecimalPlaces, config.options);
  return deployer.then(() => (
    deployer.deploy(Token, 'MyCHIP', 'CHIP', config.tokenDecimalPlaces, config.options)
  ))
    .then((token) => (
      deployer.deploy(Crowdsale, token.address, config.tokenPrice, config.tokenFactor, config.options)
    ));
};
