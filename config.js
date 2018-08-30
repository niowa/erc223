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
      from: '0x0c90e94892509a0817c8e64f439659aefe67ae73'
    },
  };
};
