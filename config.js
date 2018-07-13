module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLockPeriod: 60 * 60, // seconds
    options: {
      gasPrice: 10 * 1000000000,
      from: '0xa3742a5930f1efc9e54a15df44c73fd5ded7e1db'
    },
  };
};
