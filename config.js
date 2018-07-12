module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLock: {
      amount: '10',
      unit: 'minutes',
    },
    options: {
      gasPrice: 10*1000000000,
      from: '0xe28eadfd8b2371a2678433c3164cdd2aed22005d'
    },
  };
}
