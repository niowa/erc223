const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const Token = artifacts.require('Token');

const assert = chai.assert;

const mintedSupply = 100;
const initialBalances = [
  120,
  80
];

const createTokenContract = (lockPeriod = 0, decimals = 0, name = 'PlayChip', symbol = 'CHIP') => {
  return Token.new(name, symbol, decimals, lockPeriod);
};

contract('Token', function(accounts) {
  let initialAddresses = [
    accounts[2],
    accounts[3]
  ];
  context('After Deploy', function () {
    it('should be owned by creator', function (done) {
      createTokenContract()
        .then(function (token) {
          assert.eventually.equal(token.owner(), accounts[0]);
          done();
        });
    });
    it('total supply of created tokens should be the same as provided in constructor', function (done) {
      createTokenContract()
        .then(function (token) {
          assert.eventually.equal(token.totalSupply(), 0);
          done();
        });
    });
  });
  describe('#constructor', () => {
    it('check props after crating', async () => {
      const name = 'Test';
      const symbol = 'test';
      const decimals = 6;
      const lockPeriod = 8;

      const token = await Token.new(name, symbol, decimals, lockPeriod);

      assert.equal(await token.name(), name);
      assert.equal(await token.symbol(), symbol);
      assert.equal(await token.decimals(), decimals);
      assert.equal(await token.transferLockPeriod(), lockPeriod);
    });
  });
  describe('#generateTokens', () => {
    it('changes investors balances',async () => {
      const token = await createTokenContract();

      await token.generateTokens(initialAddresses[0], initialBalances[0]);
      assert.equal(await token.balanceOf(initialAddresses[0]), initialBalances[0]);
    });
    it('rejected if is not owner', async () => {
      const token = await createTokenContract();
      await assert.isRejected(token.generateTokens(initialAddresses[1], initialBalances[1], {
        from: initialAddresses[1],
      }));
    });
  });
  describe('#approve', function () {
    it('changes allowance value', async () => {
      const token = await createTokenContract();
      await token.generateTokens(initialAddresses[0], initialBalances[0]);
      await token.approve(accounts[1], mintedSupply, { from: accounts[2] });
      await assert.eventually.equal(token.allowance(accounts[2], accounts[1]), mintedSupply);
    });
    it('cannot be called if sender have no tokens', function (done) {
      createTokenContract()
        .then(function (token) {
          assert.isRejected(token.approve(accounts[1], mintedSupply, { from: accounts[0] }));
          done();
        });
    });
  });
  describe('#transfer', function () {
    it('changes balance of address', async () => {
      const token = await createTokenContract();
      await token.generateTokens(initialAddresses[0], initialBalances[0]);
      await token.transfer(accounts[1], mintedSupply, { from: accounts[2] });
      assert.eventually.equal(token.balanceOf(accounts[2]), initialBalances[0] - mintedSupply);
      assert.eventually.equal(token.balanceOf(accounts[1]), mintedSupply);
    });
    it('is rejected if balance is not enough', function (done) {
      createTokenContract()
        .then(function (token) {
          assert.isRejected(token.transfer(accounts[0], mintedSupply, { from: accounts[1] }));
          done();
        });
    });
    it('impossible to transfer on contract without token fallback function', async () =>{
      const token = await createTokenContract();
      await token.generateTokens(initialAddresses[0], initialBalances[0]);
      const tokenNonReciever = await createTokenContract();
      await assert.isRejected(token.transfer(tokenNonReciever, mintedSupply, { from: accounts[1] }));
    });
  });
  describe('#transferFrom', function () {
    it(' changes balances of sender and receiver', async () => {
      const token = await createTokenContract();
      await token.generateTokens(initialAddresses[0], initialBalances[0]);
      await token.approve(accounts[1], mintedSupply, { from: accounts[2] });
      await token.transferFrom(accounts[2], accounts[1], mintedSupply, { from: accounts[1] });
      assert.eventually.equal(token.balanceOf(accounts[2]), initialBalances[0] - mintedSupply);
      assert.eventually.equal(token.balanceOf(accounts[1]), mintedSupply);
    });
    it('cannot transfer if sender balance not enough', async () =>  {
      const token = await createTokenContract();
      await token.generateTokens(initialAddresses[0], initialBalances[0]);
      await token.approve(accounts[1], mintedSupply, { from: accounts[2] });
      await token.transfer(accounts[3], mintedSupply, { from: accounts[2] });
      await assert.isRejected(token.transferFrom(accounts[2], accounts[1], mintedSupply, { from: accounts[1] }));
    });
    it('impossible to transfer on contract without token fallback function', async () =>{
      const token = await createTokenContract();
      await Promise.all([
        token.generateTokens(initialAddresses[0], initialBalances[0]),
        token.generateTokens(initialAddresses[1], initialBalances[1]),
      ]);
      const tokenNonReciever = await createTokenContract();
      await token.approve(accounts[1], mintedSupply, { from: accounts[2] });
      await assert.isRejected(token.transferFrom(accounts[2], tokenNonReciever, mintedSupply, { from: accounts[1] }));
    });
    it('is rejected with not allowed arguments', function (done) {
      let token;
      createTokenContract()
        .then(function (token) {
          assert.isRejected(token.transferFrom(accounts[0], mintedSupply, { from: accounts[1] }));
          done();
        });
    });
  });
  describe('#transferOwnership', function () {
    it('should transfer ownership', function (done) {
      let token;
      createTokenContract()
        .then(function (instance) {
          token = instance;
          return token.transferOwnership(accounts[1], { from: accounts[0] });
        })
        .then(function () {
          assert.eventually.equal(token.owner(), accounts[1]);
          done();
        });
    });
  });
  describe('#lockTransfer', () => {
    it('reject if locked', async () => {
      const lockedPeriod = 60; // seconds;
      const token = await createTokenContract(lockedPeriod);
      await token.generateTokens(initialAddresses[0], initialBalances[0]);
      await token.lockTransfer(initialAddresses[0]);
      await assert.isRejected(token.transfer(initialAddresses[1], mintedSupply, { from: initialAddresses[0] }));
    });
  });
  describe('#burnTokens', () => {
    it('should burns tokens', async () => {
      const token = await createTokenContract();
      await token.setTokenGenerator(initialAddresses[0]);

      await token.generateTokens(initialAddresses[0], initialBalances[0]);

      await assert.eventually.equal(token.balanceOf(initialAddresses[0]), initialBalances[0]);

      await token.burnTokens(initialAddresses[0], initialBalances[0], { from: initialAddresses[0] });
      await assert.eventually.equal(token.balanceOf(initialAddresses[0]), 0);
      await assert.eventually.equal(token.totalSupply(), 0);
    });
    it('reject if amount equal 0', async () => {
      const token = await createTokenContract();
      await token.setTokenGenerator(initialAddresses[0]);

      await token.generateTokens(initialAddresses[0], initialBalances[0]);

      await assert.isRejected(token.burnTokens(initialAddresses[0], 0, { from: initialAddresses[0] }));
    });
    it('reject if amount greater than total supply', async () => {
      const token = await createTokenContract();
      await token.setTokenGenerator(initialAddresses[0]);

      await token.generateTokens(initialAddresses[0], initialBalances[0]);

      await assert.isRejected(token.burnTokens(initialAddresses[0], initialBalances[0] + 1, { from: initialAddresses[0] }));
    });
    it('reject if sender is not token generator', async () => {
      const token = await createTokenContract();
      await token.setTokenGenerator(initialAddresses[0]);

      await token.generateTokens(initialAddresses[0], initialBalances[0]);

      await assert.isRejected(token.burnTokens(initialAddresses[0], initialBalances[0], { from: initialAddresses[1] }));
    });
  });
});
