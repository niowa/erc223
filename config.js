module.exports = function(accounts) {
  return {
    tokenPrice: 100,
    tokenDecimalPlaces: 18,
    lockDate: Math.floor(Date.now() / 1000 + 60*24*60),
    operatingAccountAddress: '0xc8de971e5bbf1ef08bf2df1b48215481c290a7d5',
    options: {
      gasPrice: 10*1000000000,
      from: '0xc8de971e5bbf1ef08bf2df1b48215481c290a7d5'
    },
  };
};
