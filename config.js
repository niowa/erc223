module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    tokenRate: 2,
    transferLockPeriod: 60 * 60, // seconds
    options: {
      gasPrice: 10 * 1000000000,
      from: '0x80d9b898c6318767b014df4c8fff98cb457baba4'
    },
  };
};
