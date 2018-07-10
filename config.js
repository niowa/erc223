module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenFactor: 2,
    options: {
      gasPrice: 10*1000000000,
      from: '0xef8ffc5f2ad6ce86e9570812575e3653e8d0bece'
    },
  };
}
