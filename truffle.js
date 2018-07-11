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
      from: "0x8229e841021080fa202a69d7bf0ef3b6656bee01 "
    },
    live: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gas: 3000000,
      from: "0x8229e841021080fa202a69d7bf0ef3b6656bee01",
    }
  }
};
