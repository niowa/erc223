const moment = require('moment');
const Token = artifacts.require('Token');
const Crowdsale = artifacts.require('Crowdsale');
const getConfig = require('../config.js');

module.exports = function (deployer, network, accounts) {
  let deployedToken;
  const config = getConfig(accounts);
  const lokedAt = Math.floor(moment().add(config.transferLock.amount, config.transferLock.unit));

  return deployer.then(() => (
    deployer.deploy(Token, 'MyCHIP', 'CHIP', config.tokenDecimalPlaces, lokedAt, config.options)
  ))
    .then((token) => {
      deployedToken = token;
      return deployer.deploy(Crowdsale, token.address, config.tokenPrice, config.tokenRate, config.options)
    })
    .then((deployedCrowdsale) => (
      deployedToken.setTokenGenerator(deployedCrowdsale.address, config.options)
    ))
};
