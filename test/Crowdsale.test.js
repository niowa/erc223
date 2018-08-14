const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const assert = chai.assert;

const Token = artifacts.require('Token.sol');
const Crowdsale = artifacts.require('Crowdsale.sol');
const EtherStorage = artifacts.require('EtherStorage.sol');

const tokenCost = 100;
const newRate = 3;
const etherInWei = 1000;

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

const createNewContract = async (
  decimals = 0,
  lockPeriod = 0,
  tokenCost = 200,
  rate = 2,
  name = 'PlayChip',
  symbol = 'CHIP',
) => {
  const token = await Token.new(name, symbol, decimals, lockPeriod);
  const crowdsaleContract = await Crowdsale.new(token.address, tokenCost, rate);
  const etherStorageContract = await EtherStorage.new(crowdsaleContract.address);

  return { token, crowdsaleContract, etherStorageContract };
};

contract('PlayChipCrowdsale', (accounts) => {
  context('After Deploy', () => {
    it('should be owned by creator', async () => {
      const { crowdsaleContract } = await createNewContract();
      await assert.equal(await crowdsaleContract.owner(), accounts[0]);
    });
  });
  describe('#constructor', () => {
    it('check props after crating', async () => {
      const token = await Token.new('PlayChip', 'CHIP', 0, 0);

      const tokenCost = 500;
      const rate = 4;

      const crowdsale = await Crowdsale.new(token.address, tokenCost, rate);

      assert.equal(await crowdsale.token(), token.address);
      assert.equal(await crowdsale.initPrice(), tokenCost);
      assert.equal(await crowdsale.rate(), rate);
    });
  });
  describe('#set rate', () => {
    it('available only for creator', async () => {
      const newTokenCost = 200;
      const { crowdsaleContract } = await createNewContract();
      await assert.isRejected(crowdsaleContract.setRate(newTokenCost, { from: accounts[1] }));
    });
    it('set rate value', async () => {
      const { crowdsaleContract } = await createNewContract();
      await crowdsaleContract.setRate(newRate, { from: accounts[0] });

      await assert.eventually.equal(crowdsaleContract.rate(), newRate);
    });
  });
  describe('#invest', () => {
    it('works if token decimal number is more than 0', async () => {
      const { crowdsaleContract, token, etherStorageContract } = await createNewContract(5, 0);
      await token.setTokenGenerator(crowdsaleContract.address);
      await crowdsaleContract.setEtherStorage(etherStorageContract.address);

      const expectedTokenBalance = await crowdsaleContract.convertEthToTokens(etherInWei);
      await sleep(1000);

      await crowdsaleContract.sendTransaction({ from: accounts[3], value: etherInWei });
      const currentTokenBalance = await token.balanceOf(accounts[1]);
      await assert.isBelow(+currentTokenBalance, +expectedTokenBalance);
    });
    it('decreases investor balance', async () => {
      const { crowdsaleContract, token, etherStorageContract } = await createNewContract(5, 0);
      await token.setTokenGenerator(crowdsaleContract.address);
      await crowdsaleContract.setEtherStorage(etherStorageContract.address);

      const senderStartBalance = web3.eth.getBalance(accounts[1]);
      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      const senderBalance = web3.eth.getBalance(accounts[1]);
      await assert.equal(senderBalance.toString(), senderStartBalance.sub(etherInWei).toString());
    });
    it('transfers ether to ether storage', async () => {
      const { crowdsaleContract, token, etherStorageContract } = await createNewContract(5, 0);
      await token.setTokenGenerator(crowdsaleContract.address);
      await crowdsaleContract.setEtherStorage(etherStorageContract.address);

      const oldEtherStorageBalance = web3.eth.getBalance(etherStorageContract.address);
      await crowdsaleContract.sendTransaction({ from: accounts[3], value: etherInWei });
      const newEtherStorageBalance = web3.eth.getBalance(etherStorageContract.address);
      await assert.equal(oldEtherStorageBalance.toString(), newEtherStorageBalance.sub(etherInWei).toString());
    });
    it('reject if lock period is active', async () => {
      const lockPeriod = 12; // seconds
      const mintedSupply = 20;
      const { crowdsaleContract, token, etherStorageContract } = await createNewContract(5, lockPeriod);
      await token.setTokenGenerator(crowdsaleContract.address);
      await crowdsaleContract.setEtherStorage(etherStorageContract.address);

      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei });
      await assert.isRejected(token.transfer(accounts[2], mintedSupply, { from: accounts[1] }));
    });
    it('successful if lock period has ended', async () => {
      const lockPeriod = 2; // 2 seconds
      const mintedSupply = 20;
      const { crowdsaleContract, token, etherStorageContract } = await createNewContract(5, lockPeriod);
      await token.setTokenGenerator(crowdsaleContract.address);
      await crowdsaleContract.setEtherStorage(etherStorageContract.address);

      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei });
      await assert.isRejected(token.transfer(accounts[2], mintedSupply, { from: accounts[1] }));
      await sleep(2000);
      await token.transfer(accounts[2], mintedSupply, { from: accounts[1] });
      await assert.eventually.equal(token.balanceOf(accounts[2]), mintedSupply);
    });
    it('reject if token generator has not set', async () => {
      const { crowdsaleContract } = await createNewContract(5, 0);

      await assert.isRejected(crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei }));
    });
  });

  describe('#tokenFallback', () => {
    it('throws in any token transaction', async () => {
      const { crowdsaleContract, token } = await createNewContract(5, 0);
      await token.generateTokens(accounts[0], 1000);
      await assert.isRejected(token.transfer(crowdsaleContract.address, 100, { from: accounts[0] }));
    });
  });
});
