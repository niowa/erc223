module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLockPeriod: 60 * 60, // seconds
    options: {
      gasPrice: 10 * 1000000000,
      from: '0xf64aae0514df9428b742de3c635009d88936a209'
    },
  };
};
