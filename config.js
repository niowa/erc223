module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    options: {
      gasPrice: 10*1000000000,
      from: '0x4514c7316c5d80bbdf04777bb21d0774b15576c6'
    },
  };
}
