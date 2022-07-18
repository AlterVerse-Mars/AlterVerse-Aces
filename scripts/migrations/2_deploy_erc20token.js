// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const deployHelper = require("./deploy-helpers");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const network = hre.network.name;

  const tokenName = "AlterVerse";
  const tokenSymbol = "ACE";
  const tokenCap = hre.ethers.utils.parseEther("1000000000");

  let isPublicNetwork = true;

  console.log(`Network: ${network}`);

  if (network === "bsc-mainnet") {
  } else if (network === "bsc-testnet") {
  } else if (network === "mainnet") {
  } else {
    throw new Error(`Unknown network: ${network}`);
  }

  // We get the contract to deploy
  const Erc20Token = await hre.ethers.getContractFactory("Erc20Token");

  const erc20TokenArgs = [tokenName, tokenSymbol, tokenCap];
  const erc20TokenContract = await deployHelper.deployContract(Erc20Token, erc20TokenArgs, true);

  await deployHelper.contractDeployed(erc20TokenContract, isPublicNetwork);

  console.log("ERC20 Token:", erc20TokenContract.address);

  // Verify contract source code if deployed to public network
  if (isPublicNetwork) {
    console.log("Verify Contracts");

    await deployHelper.tryVerifyContract(erc20TokenContract, erc20TokenArgs);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
