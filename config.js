module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    options: {
      gasPrice: 10*1000000000,
      from: '0x8229e841021080fa202a69d7bf0ef3b6656bee01'
    },
  };
}
