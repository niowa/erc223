const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const assert = chai.assert;

const Token = artifacts.require('Token.sol');
const Crowdsale = artifacts.require('Crowdsale.sol');

const tokenCost = 100;
const newRate = 3;
const etherInWei = 100;

function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}

const investorsBalances = [
  110000,
  90000,
];

const createNewContract = async (
  name = 'PlayChip',
  symbol = 'CHIP',
  decimals = 0,
  lockPeriod = 0,
  tokenCost = 200,
  rate = 2,
) => {
  const token = await Token.new(name, symbol, decimals, lockPeriod);
  const crowdsaleContract = await Crowdsale.new(token.address, tokenCost, rate);

  return { token, crowdsaleContract };
};

contract('PlayChipCrowdsale', (accounts) => {
  context('After Deploy', () => {
    it('should be owned by creator', async () => {
      const { crowdsaleContract } = await createNewContract();
      await assert.equal(await crowdsaleContract.owner(), accounts[0]);
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
      const { crowdsaleContract, token } = await createNewContract(undefined, undefined, 5, 0);
      await token.setTokenGenerator(crowdsaleContract.address);

      const expectedBalance = await crowdsaleContract.convertEthToTokens(etherInWei);
      await sleep(1000);
      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei });
      const currentBalance = await token.balanceOf(accounts[1]);
      await assert.isBelow(+currentBalance, +expectedBalance);
    });
    it('decreases investor balance', async () => {
      const { crowdsaleContract, token } = await createNewContract(undefined, undefined, 5, 0);
      await token.setTokenGenerator(crowdsaleContract.address);
      const senderStartBalance = web3.eth.getBalance(accounts[1]);
      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      const senderBalance = web3.eth.getBalance(accounts[1]);
      await assert.equal(senderBalance.toNumber(), senderStartBalance.sub(etherInWei).toNumber());
    });
    it('transfers ether to withdrawal address', async () => {
      const { crowdsaleContract, token } = await createNewContract(undefined, undefined, 5, 0);
      await token.setTokenGenerator(crowdsaleContract.address);

      const withdrawStartBalance = web3.eth.getBalance(await crowdsaleContract.withdrawAddress());
      await crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });

      const withdrawBalance = web3.eth.getBalance(await crowdsaleContract.withdrawAddress());
      await assert.equal(withdrawBalance.toNumber(), withdrawStartBalance.add(tokenCost).toNumber());
    });
    it('reject if token generator has not set', async () => {
      const { crowdsaleContract } = await createNewContract(undefined, undefined, 5, 0);

      await assert.isRejected(crowdsaleContract.sendTransaction({ from: accounts[1], value: etherInWei }));
    });
  });

  describe('#tokenFallback', () => {
    it('throws in any token transaction', async () => {
      const { crowdsaleContract, token } = await createNewContract(undefined, undefined, 5, 0);
      await token.generateTokens(accounts[0], 1000);
      await assert.isRejected(token.transfer(crowdsaleContract.address, 100, { from: accounts[0] }));
    });
  });
});
