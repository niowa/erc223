const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const assert = chai.assert;

const Token = artifacts.require('Token.sol');
const Crowdsale = artifacts.require('Crowdsale.sol');

const tokenCost = 100;
const rate = 2;
const newRate = 3;
const newTokenCost = 200;
const transferAmount = 100;
const notEnoughAmount = 50;
const contractDecimals = 5;
const etherInWei = 100;

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

const investorsBalances = [
  110000,
  90000,
];

const createNewContract = async (accounts) => {
  const token = await Token.new('PlayChip', 'CHIP', 0);
  const crowdsaleContract = await Crowdsale.new(token.address, tokenCost, rate);

  return { token, crowdsaleContract };
};

contract('PlayChipCrowdsale', (accounts) => {
  context('After Deploy', () => {
    it('should be owned by creator', async () => {
      const { crowdsaleContract, token } = await createNewContract(accounts);
      await assert.equal(await crowdsaleContract.owner(), accounts[0]);
    });
  });
  describe('#set rate', () => {
    it('available only for creator', async () => {
      const { crowdsaleContract, token } = await createNewContract(accounts);
      await assert.isRejected(crowdsaleContract.setRate(newTokenCost, { from: accounts[1] }));
    });
    it('set rate value', async () => {
      const { crowdsaleContract } = await createNewContract(accounts);
      await crowdsaleContract.setRate(newRate, { from: accounts[0] });

      await assert.eventually.equal(crowdsaleContract.rate(), newRate);
    });
  });
  describe('#invest', () => {
    it('works if token decimal number is more than 0', async () => {
      const token = await Token.new('PlayChip', 'CHIP', contractDecimals);
      const crowdsaleContract = await Crowdsale.new(token.address, 1, rate);
      await token.setTokenGenerator(crowdsaleContract.address);

      const expectedBalance = await crowdsaleContract.convertEthToTokens(etherInWei);
      await sleep(1000);
      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei });
      const currentBalance = await token.balanceOf(accounts[1]);
      await assert.isBelow(+currentBalance, +expectedBalance);
    });
    it('decreases investor balance', async () => {
      const token = await Token.new('PlayChip', 'CHIP', contractDecimals);
      const crowdsaleContract = await Crowdsale.new(token.address, 1, rate);
      await token.setTokenGenerator(crowdsaleContract.address);
      const senderStartBalance = web3.eth.getBalance(accounts[1]);
      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      const senderBalance = web3.eth.getBalance(accounts[1]);
      await assert.equal(senderBalance.toNumber(), senderStartBalance.sub(etherInWei).toNumber());
    });
    it('transfers ether to withdrawal address', async () => {
      const token = await Token.new('PlayChip', 'CHIP', contractDecimals);
      const crowdsaleContract = await Crowdsale.new(token.address, 1, rate);
      await token.setTokenGenerator(crowdsaleContract.address);

      const withdrawStartBalance = web3.eth.getBalance(await crowdsaleContract.withdrawAddress());
      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });

      const withdrawBalance = web3.eth.getBalance(await crowdsaleContract.withdrawAddress());
      await assert.equal(withdrawBalance.toNumber(), withdrawStartBalance.add(tokenCost).toNumber());
    });
    it('reject if token generator has not set', async () => {
      const token = await Token.new('PlayChip', 'CHIP', contractDecimals);
      const crowdsaleContract = await Crowdsale.new(token.address, 1, rate);

      await assert.isRejected(crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei }));
    });
  });

  describe('#tokenFallback', () => {
    it('throws in any token transaction', async () => {
      const tokenContract = await Token.new('chip', 'chip', 0);
      const crowdsaleContract = await Crowdsale.new(tokenContract.address, tokenCost, rate);
      await tokenContract.generateTokens(accounts[0], 1000);
      await assert.isRejected(tokenContract.transfer(crowdsaleContract.address, 100, {from: accounts[0]}));
    });
  });
});
