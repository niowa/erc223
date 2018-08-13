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
      from: "0xe7f572164972e430d334f4e4fe61c860c950febd "
    },
    live: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gas: 3000000,
      from: "0xe7f572164972e430d334f4e4fe61c860c950febd",
    }
  }
};
