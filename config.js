module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLockPeriod: 60 * 60, // seconds
    investmentGoal: 40 ** 18,
    options: {
      gasPrice: 10 * 1000000000,
      from: '0x9e83db85b464ab367e6f64d322ccd9f4c99a57c2'
    },
  };
};
