const Token = artifacts.require('Token');
const Crowdsale = artifacts.require('Crowdsale');
const getConfig = require('../config.js');

module.exports = function (deployer, network, accounts) {
  let deployedToken;
  const config = getConfig(accounts);
  return deployer.then(() => (
    deployer.deploy(Token, 'MyCHIP', 'CHIP', config.tokenDecimalPlaces, config.options)
  ))
    .then((token) => {
      deployedToken = token;
      return deployer.deploy(Crowdsale, token.address, config.tokenPrice, config.tokenRate, config.options)
    })
    .then((deployedCrowdsale) => (
      deployedToken.setTokenGenerator(deployedCrowdsale.address, config.options)
    ))
};
