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
      from: "0x80d9b898c6318767b014df4c8fff98cb457baba4 "
    },
    live: {
      host: "localhost",
      port: 8545,
      network_id: 1,
      gas: 3000000,
      from: "0x80d9b898c6318767b014df4c8fff98cb457baba4",
    }
  }
};
