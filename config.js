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
      from: '0x8713c6236dd5d0ddc718751bb9186faf2a393447'
    },
  };
};
