const Crowdsale = artifacts.require('Crowdsale');
const EtherStorage = artifacts.require('EtherStorage');
const getConfig = require('../config.js');

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    const config = getConfig(accounts);

    const crowdsaleContract = await Crowdsale.deployed();

    const etherStorageContract = await deployer.deploy(
      EtherStorage,
      crowdsaleContract.address,
      config.investmentSample,
      config.investmentGoal,
      config.investmentsWithoutCheck,
      config.options
    );

    await crowdsaleContract.setEtherStorage(etherStorageContract.address, config.options);
  });
};
