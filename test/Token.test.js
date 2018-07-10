const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const Token = artifacts.require('Token');

const assert = chai.assert;

const startSupply = 200;
const mintedSupply = 100;

const initialBalances = [
  120,
  80
];

contract('Token', function(accounts) {
  let initialAddresses = [
    accounts[2],
    accounts[3]
  ];
  context('After Deploy', function () {
    it('should be owned by creator', function (done) {
      Token.new('chip', 'chip', 0)
        .then(function (token) {
          assert.eventually.equal(token.owner(), accounts[0]);
          done();
        });
    });
    it('total supply of created tokens should be the same as provided in constructor', function (done) {
      Token.new('chip', 'chip', 0)
        .then(function (token) {
          assert.eventually.equal(token.totalSupply(), 0);
          done();
        });
    });
  });
  describe('#generateTokens', () => {
    it('changes investors balances',async () => {
      const token = await Token.new('chip', 'chip', 0);
      const investorStartBalance = await token.balanceOf(initialAddresses[0]);
      await token.generateTokens(initialAddresses, initialBalances);
      assert.equal(await token.balanceOf(initialAddresses[0]), initialBalances[0]);
    });
    it('rejected if `balances` and `investors` arrays have different length',async () => {
      const token = await Token.new('chip', 'chip', 0);
      await assert.isRejected(token.generateTokens(initialAddresses, []));
    });
  });
  describe('#approve', function () {
    it('changes allowance value', async () => {
      const token = await Token.new('chip', 'chip', 0);
      await token.generateTokens(initialAddresses, initialBalances);
      await token.approve(accounts[1], mintedSupply, { from: accounts[2] });
      assert.eventually.equal(token.allowance(accounts[2], accounts[1]), mintedSupply);
    });
    it('cannot be called if sender have no tokens', function (done) {
      Token.new('chip', 'chip', 0)
        .then(function (token) {
          assert.isRejected(token.approve(accounts[1], mintedSupply, { from: accounts[0] }));
          done();
        });
    });
  });
  describe('#transfer', function () {
    it('changes balance of address', async () => {
      const token = await Token.new('chip', 'chip', 0);
      await token.generateTokens(initialAddresses, initialBalances);
      await token.transfer(accounts[1], mintedSupply, { from: accounts[2] });
      assert.eventually.equal(token.balanceOf(accounts[2]), initialBalances[0] - mintedSupply);
      assert.eventually.equal(token.balanceOf(accounts[1]), mintedSupply);
    });
    it('is rejected if balance is not enough', function (done) {
      Token.new('chip', 'chip', 0)
        .then(function (token) {
          assert.isRejected(token.transfer(accounts[0], mintedSupply, { from: accounts[1] }));
          done();
        });
    });
    it('impossible to transfer on contract without token fallback function', async () =>{
      const token = await Token.new('chip', 'chip', 0);
      await token.generateTokens(initialAddresses, initialBalances);
      const tokenNonReciever = await Token.new('chip', 'chip', 0);
      await assert.isRejected(token.transfer(tokenNonReciever, mintedSupply, { from: accounts[1] }));
    });
  });
  describe('#transferFrom', function () {
    it(' changes balances of sender and receiver', async () => {
      const token = await Token.new('chip', 'chip', 0);
      await token.generateTokens(initialAddresses, initialBalances);
      await token.approve(accounts[1], mintedSupply, { from: accounts[2] });
      await token.transferFrom(accounts[2], accounts[1], mintedSupply, { from: accounts[1] });
      assert.eventually.equal(token.balanceOf(accounts[2]), initialBalances[0] - mintedSupply);
      assert.eventually.equal(token.balanceOf(accounts[1]), mintedSupply);
    });
    it('cannot transfer if sender balance not enough', async () =>  {
      const token = await Token.new('chip', 'chip', 0);
      await token.generateTokens(initialAddresses, initialBalances);
      await token.approve(accounts[1], mintedSupply, { from: accounts[2] });
      await token.transfer(accounts[3], mintedSupply, { from: accounts[2] });
      await assert.isRejected(token.transferFrom(accounts[2], accounts[1], mintedSupply, { from: accounts[1] }));
    });
    it('impossible to transfer on contract without token fallback function', async () =>{
      const token = await Token.new('chip', 'chip', 0);
      await token.generateTokens(initialAddresses, initialBalances);
      const tokenNonReciever = await Token.new('chip', 'chip', 0);
      await token.approve(accounts[1], mintedSupply, { from: accounts[2] });
      await assert.isRejected(token.transferFrom(accounts[2], tokenNonReciever, mintedSupply, { from: accounts[1] }));
    });
    it('is rejected with not allowed arguments', function (done) {
      let token;
      Token.new('chip', 'chip', 0)
        .then(function (token) {
          assert.isRejected(token.transferFrom(accounts[0], mintedSupply, { from: accounts[1] }));
          done();
        });
    });
  });
  describe('#transferOwnership', function () {
    it(' should transfer ownership', function (done) {
      let token;
      Token.new('chip', 'chip', 0)
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
});
