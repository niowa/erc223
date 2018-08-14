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

contract('EtherStorage', (accounts) => {
  context('After Deploy', () => {
    it('should be owned by creator', async () => {
      const { etherStorageContract } = await createNewContract();
      await assert.equal(await etherStorageContract.owner(), accounts[0]);
    });
  });
  describe('#constructor', () => {
    it('check props after crating', async () => {
      const etherStorage = await EtherStorage.new(accounts[1]);
      assert.equal(await etherStorage.crowdsale(), accounts[1]);
    });
  });
  describe('#setCrowdsale', () => {
    it('available only for creator', async () => {
      const { etherStorageContract } = await createNewContract();
      await assert.isRejected(etherStorageContract.setCrowdsale(accounts[1], { from: accounts[1] }));
    });
    it('set new crowdsale address', async () => {
      const { etherStorageContract } = await createNewContract();
      await etherStorageContract.setCrowdsale(accounts[1], { from: accounts[0] });

      await assert.eventually.equal(etherStorageContract.crowdsale(), accounts[1]);
    });
  });
  describe('#invest', () => {
    it('should increase amount raised', async () => {
      const {etherStorageContract} = await createNewContract(5, 0);
      const prevBalance = await etherStorageContract.amountRaised();
      await etherStorageContract.sendTransaction({from: accounts[1], value: etherInWei});
      const currentBalance = await etherStorageContract.amountRaised();
      assert.equal(+currentBalance, +prevBalance.add(etherInWei));
    });
    it('decreases investor balance', async () => {
      const {etherStorageContract} = await createNewContract(5, 0);
      const prevBalance = web3.eth.getBalance(accounts[1]);
      await etherStorageContract.sendTransaction({from: accounts[1], value: etherInWei, gasPrice: 0});
      const currentBalance = web3.eth.getBalance(accounts[1]);
      assert.equal(currentBalance.toString(), prevBalance.sub(etherInWei).toString());
    });
  });
  describe('#withdrawEtherToUser', () => {
    it('should decrease ether in ether storage', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      const prevBalance = await etherStorageContract.amountRaised();
      await etherStorageContract.withdrawEtherToUser(accounts[1], etherInWei, { from: accounts[0] });
      const currentBalance = await etherStorageContract.amountRaised();
      assert.equal(+currentBalance, +prevBalance.sub(etherInWei));
    });
    it('should decrease user balance', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      const prevBalance = web3.eth.getBalance(accounts[2]);
      await etherStorageContract.withdrawEtherToUser(accounts[2], etherInWei, { from: accounts[0] });
      const currentBalance = web3.eth.getBalance(accounts[2]);
      assert.equal(currentBalance.toString(), prevBalance.add(etherInWei).toString());
    });
    it('reject if amount for transfer greater than amount raised', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      await assert.isRejected(etherStorageContract.withdrawEtherToUser(accounts[1], etherInWei * 2, { from: accounts[0] }));
    });
    it('reject if amount for transfer greater than amount raised', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      await assert.isRejected(etherStorageContract.withdrawEtherToUser(accounts[1], etherInWei * 2, { from: accounts[0] }));
    });
    it('reject if sender is not crowdsale', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      await assert.isRejected(etherStorageContract.withdrawEtherToUser(accounts[1], etherInWei, { from: accounts[1] }));
    });
  });
  describe('#withdrawEtherToOwner', () => {
    it('should decrease ether in ether storage', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[1]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      const prevBalance = await etherStorageContract.amountRaised();
      await etherStorageContract.withdrawEtherToOwner(etherInWei, { from: accounts[1] });
      const currentBalance = await etherStorageContract.amountRaised();
      assert.equal(+currentBalance, +prevBalance.sub(etherInWei));
    });
    it('should decrease owner balance', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[1]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      const prevBalance = web3.eth.getBalance(accounts[0]);
      await etherStorageContract.withdrawEtherToOwner(etherInWei, { from: accounts[1] });
      const currentBalance = web3.eth.getBalance(accounts[0]);
      assert.equal(currentBalance.toString(), prevBalance.add(etherInWei).toString());
    });
    it('reject if amount for transfer greater than amount raised', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[1]);
      await etherStorageContract.sendTransaction({ from: accounts[0], value: etherInWei, gasPrice: 0 });
      await assert.isRejected(etherStorageContract.withdrawEtherToOwner(etherInWei * 2, { from: accounts[0] }));
    });
    it('reject if amount for transfer greater than amount raised', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      await assert.isRejected(etherStorageContract.withdrawEtherToOwner(accounts[1], etherInWei * 2, { from: accounts[0] }));
    });
    it('reject if sender is not crowdsale', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });
      await assert.isRejected(etherStorageContract.withdrawEtherToOwner(accounts[1], etherInWei, { from: accounts[1] }));
    });
  });
});