require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require("hardhat-gas-reporter");
require("solidity-coverage");

const SOLIDITY_VERSION = "0.7.6";
const SOLIDITY_OPTIMIZER_RUNS = 200;

const blockchainPlatform = process.env.BLOCKCHAIN_PLATFORM;

const bscScanApiKey = process.env.BSCSCAN_API_KEY;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
const polygonscanApiKey = process.env.POLYGONSCAN_API_KEY;

const coinmarketcapApiKey = process.env.COINMARKETCAP_API_KEY;

const bscTestnetPrivateKey = process.env.BSC_TESTNET_PRIVATE_KEY;
const bscMainnetPrivateKey = process.env.BSC_MAINNET_PRIVATE_KEY;
const ropstenPrivateKey = process.env.ROPSTEN_PRIVATE_KEY;
const mainnetPrivateKey = process.env.MAINNET_PRIVATE_KEY;
const polygonMumbaiPrivateKey = process.env.POLYGON_MUMBAI_PRIVATE_KEY;
const polygonMainnetPrivateKey = process.env.POLYGON_MAINNET_PRIVATE_KEY;

let verifyContractApiKey;

if (blockchainPlatform === "BSC") {
  verifyContractApiKey = bscScanApiKey;
} else if (blockchainPlatform === "ETH") {
  verifyContractApiKey = etherscanApiKey;
} else if (blockchainPlatform === "POLYGON") {
  verifyContractApiKey = polygonscanApiKey;
} else {
  throw new Error(`Unknown Blockchain Platform: ${blockchainPlatform}`);
}

if (verifyContractApiKey === undefined) {
  throw new Error("Unknown Verify Contract API Key");
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const config = {
  solidity: {
    version: SOLIDITY_VERSION,
    settings: {
      optimizer: {
        enabled: true,
        runs: SOLIDITY_OPTIMIZER_RUNS,
      },
    },
  },
  mocha: {
    timeout: 120000,
  },
  etherscan: {
    apiKey: verifyContractApiKey,
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: coinmarketcapApiKey,
    outputFile: "gas-usage.txt",
    noColors: true,
  },
};

if (!config.networks) {
  config.networks = {};
}

config.networks["hardhat"] = {
  initialBaseFeePerGas: 0,
  accounts: {
    count: 210,
  },
};

if (blockchainPlatform === "BSC" && bscTestnetPrivateKey) {
  config.networks["bsc-testnet"] = {
    url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    accounts: [`0x${bscTestnetPrivateKey}`],
    gasMultiplier: 2, // For testnet only
  };
}

if (blockchainPlatform === "BSC" && bscMainnetPrivateKey) {
  config.networks["bsc-mainnet"] = {
    url: "https://bsc-dataseed.binance.org",
    accounts: [`0x${bscMainnetPrivateKey}`],
    gasMultiplier: 1.02,
  };
}

if (blockchainPlatform === "ETH" && ropstenPrivateKey) {
  const alchemyApiKey = process.env.ROPSTEN_ALCHEMY_API_KEY;

  config.networks["ropsten"] = {
    url: `https://eth-ropsten.alchemyapi.io/v2/${alchemyApiKey}`, // `https://ropsten.infura.io/v3/${infuraProjectId}`
    accounts: [`0x${ropstenPrivateKey}`],
  };
}

if (blockchainPlatform === "ETH" && mainnetPrivateKey) {
  const alchemyApiKey = process.env.MAINNET_ALCHEMY_API_KEY;

  config.networks["mainnet"] = {
    url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`, // `https://mainnet.infura.io/v3/${infuraProjectId}`
    accounts: [`0x${mainnetPrivateKey}`],
  };
}

if (blockchainPlatform === "POLYGON" && polygonMumbaiPrivateKey) {
  const alchemyApiKey = process.env.POLYGON_MUMBAI_ALCHEMY_API_KEY;

  config.networks["polygon-mumbai"] = {
    url: `https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`,
    accounts: [`0x${polygonMumbaiPrivateKey}`],
    gasMultiplier: 2, // For testnet only
  };
}

if (blockchainPlatform === "POLYGON" && polygonMainnetPrivateKey) {
  const alchemyApiKey = process.env.POLYGON_MAINNET_ALCHEMY_API_KEY;

  config.networks["polygon-mainnet"] = {
    url: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
    accounts: [`0x${polygonMainnetPrivateKey}`],
    gasMultiplier: 1.02,
  };
}

module.exports = config;
