module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    lockDate: Math.floor(Date.now() / 1000 + 60*24*60),
    operatingAccountAddress: '0x283b1ad88b45bdf00de438edd141c6d7fb08fa8c',
    cadInvestAccountAddress: '0x283b1ad88b45bdf00de438edd141c6d7fb08fa8c',
    crowdsaleWithdrawalAddress: '0x283b1ad88b45bdf00de438edd141c6d7fb08fa8c',
    options: {
      gasPrice: 10*1000000000,
      from: '0x283b1ad88b45bdf00de438edd141c6d7fb08fa8c'
    },
  };
};
