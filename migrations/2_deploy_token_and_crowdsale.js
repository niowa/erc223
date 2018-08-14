const Token = artifacts.require('Token');
const Crowdsale = artifacts.require('Crowdsale');
const getConfig = require('../config.js');

module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {
    const config = getConfig(accounts);

    const token = await deployer.deploy(Token, 'MyCHIP', 'CHIP', config.tokenDecimalPlaces, config.transferLockPeriod, config.options);
    const crowdsale = await deployer.deploy(Crowdsale, token.address, config.tokenPrice, config.tokenRate, config.options);
    await token.setTokenGenerator(crowdsale.address, config.options)
  });
};
