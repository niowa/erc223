module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLockPeriod: 60 * 60, // seconds
    investmentGoal: 40 ** 18,
    investmentSample: 3,
    options: {
      gasPrice: 10 * 1000000000,
      from: '0x38f15d917f7583b0a202b32795576ab6d96a8727'
    },
  };
};
