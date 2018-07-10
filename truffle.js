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
      from: "0xc8de971e5bbf1ef08bf2df1b48215481c290a7d5 "
    },
    live: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gas: 3000000,
      from: "0xc8de971e5bbf1ef08bf2df1b48215481c290a7d5",
    }
  }
};
