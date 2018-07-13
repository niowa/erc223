const Crowdsale = artifacts.require('Crowdsale');
const EtherStorage = artifacts.require('EtherStorage');
const getConfig = require('../config.js');

module.exports = function (deployer, network, accounts) {
  const config = getConfig(accounts);

  return deployer.then(function () {
    return Crowdsale.deployed();
  })
    .then(function (crowdsale) {
      return deployer.deploy(EtherStorage, crowdsale.address, config.options);
    });
};
