module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLockPeriod: 60 * 60, // seconds
    options: {
      gasPrice: 10 * 1000000000,
      from: '0xfacf662a7defd03b525f59dfec47f3472c75a1c4'
    },
  };
};
