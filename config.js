module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLockPeriod: 60 * 60, // seconds
    options: {
      gasPrice: 10 * 1000000000,
      from: '0xe7f572164972e430d334f4e4fe61c860c950febd'
    },
  };
};
