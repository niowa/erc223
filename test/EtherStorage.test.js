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
const investmentSample = 3;

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
  investmentGoal = etherInWei * 3,
  investmentSample = 3,
) => {
  const token = await Token.new(name, symbol, decimals, lockPeriod);
  const crowdsaleContract = await Crowdsale.new(token.address, tokenCost, rate);
  const etherStorageContract = await EtherStorage.new(crowdsaleContract.address, investmentGoal, investmentSample);

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
      const etherStorage = await EtherStorage.new(accounts[1], etherInWei, investmentSample);
      assert.equal(await etherStorage.crowdsale(), accounts[1]);
      assert.equal(await etherStorage.investmentGoal(), etherInWei);
      assert.equal(await etherStorage.investmentSample(), investmentSample);
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
  describe('#setInvestmentGoal', () => {
    const investmentGoal = 200;
    it('should set investment goal', async () => {
      const { etherStorageContract } = await createNewContract();
      await etherStorageContract.setInvestmentGoal(investmentGoal);
      const newInvestmentGoal = await etherStorageContract.investmentGoal();
      assert.equal(+newInvestmentGoal, investmentGoal);
    });
    it('available only for creator', async () => {
      const { etherStorageContract } = await createNewContract();

      await assert.isRejected(etherStorageContract.setInvestmentGoal(investmentGoal, { from: accounts[1]}));
    });
    it('reject if investment goal is non-natural number', async () => {
      const investmentGoal = 0;
      const { etherStorageContract } = await createNewContract();

      await assert.isRejected(etherStorageContract.setInvestmentGoal(investmentGoal));
    });
  });
  describe('#invest', () => {
    it('should increase amount raised', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      const prevBalance = await etherStorageContract.amountRaised();
      await etherStorageContract.sendTransaction({from: accounts[1], value: etherInWei});
      const currentBalance = await etherStorageContract.amountRaised();
      assert.equal(+currentBalance, +prevBalance.add(etherInWei));
    });
    it('decreases investor balance', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      const prevBalance = web3.eth.getBalance(accounts[1]);
      await etherStorageContract.sendTransaction({from: accounts[1], value: etherInWei, gasPrice: 0});
      const currentBalance = web3.eth.getBalance(accounts[1]);
      assert.equal(currentBalance.toString(), prevBalance.sub(etherInWei).toString());
    });
    it('should transfer ether to owner when contract reaches investment goal', async () => {
      const bigBet = etherInWei * 3;
      const { etherStorageContract } = await createNewContract(5, 0);
      const prevBalance = web3.eth.getBalance(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: bigBet });
      const currentBalance = web3.eth.getBalance(accounts[0]);
      assert.equal(currentBalance.toString(), prevBalance.add(bigBet).toString());
    });
    it('should save data about investment', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });

      const investments = await etherStorageContract.investments.call([0]);
      assert.equal(+investments[0], etherInWei);
    });
    it('should save data about investment', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });

      const investments = await etherStorageContract.investments.call([0]);
      assert.equal(+investments[0], etherInWei);
    });
    it('should not to withdraw if investments grow', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setInvestmentGoal(etherInWei * 10);

      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });
      await sleep(1000);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });
      await sleep(1000);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });
      await sleep(1000);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });

      const amountRaised = await etherStorageContract.amountRaised();

      assert.equal(+amountRaised, etherInWei * 4);
    });
  });
  describe('#withdrawEtherToUser', () => {
    it('should decrease ether in ether storage', async () => {
      const { etherStorageContract, crowdsaleContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[0]);
      await crowdsaleContract.setEtherStorage(etherStorageContract.address);

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
      await etherStorageContract.setInvestmentGoal(etherInWei);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });

      const currentBalance = await etherStorageContract.amountRaised();
      assert.equal(0, +currentBalance);
    });
    it('should increase owner balance', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setCrowdsale(accounts[1]);
      await etherStorageContract.setInvestmentGoal(etherInWei);
      const prevBalance = web3.eth.getBalance(accounts[0]);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei, gasPrice: 0 });

      const currentBalance = web3.eth.getBalance(accounts[0]);
      assert.equal(currentBalance.toString(), prevBalance.add(etherInWei).toString());
    });
    it('should increase owner balance if investment have fallen', async () => {
      const { etherStorageContract } = await createNewContract(5, 0);
      await etherStorageContract.setInvestmentGoal(etherInWei * 10);

      const prevBalance = web3.eth.getBalance(accounts[0]);

      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });
      await sleep(1000);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });
      await sleep(1000);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei });
      await sleep(1000);
      await etherStorageContract.sendTransaction({ from: accounts[1], value: etherInWei / 2 });

      const amountRaised = await etherStorageContract.amountRaised();
      const currentBalance = web3.eth.getBalance(accounts[0]);

      assert.equal(+amountRaised, 0);
      assert.equal(currentBalance.toString(), prevBalance.add(etherInWei * 3 + (etherInWei / 2)));
    });
  });
});
