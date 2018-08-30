module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLockPeriod: 60 * 60, // seconds
    investmentGoal: 40 ** 18,
    investmentSample: 3,
    amountLuckyInvestments: 4,
    options: {
      gasPrice: 10 * 1000000000,
      from: '0x9cff499f2ed3171c505badffb046285958c2a99d'
    },
  };
};
