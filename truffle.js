module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      network_id: 4,
      gas: 4612388,
      from: "0x378cba25357d38e60883306ba186c5b1b9cd8101 "
    },
    live: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gas: 3000000,
      from: "0x378cba25357d38e60883306ba186c5b1b9cd8101",
    }
  }
};
