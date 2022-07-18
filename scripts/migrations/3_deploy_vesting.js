// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const deployHelper = require("./deploy-helpers");

function convertMonthsToDaysForTesting(actualDays) {
  const DAYS_IN_MONTH = 30;
  const testDays = actualDays > 0 ? (actualDays < DAYS_IN_MONTH ? 1 : Math.trunc(actualDays / DAYS_IN_MONTH)) : 0;

  return testDays;
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const network = hre.network.name;

  const contractName = "Vesting";

  const vestingAllowAccumulate = process.env.VESTING_ALLOW_ACCUMULATE;
  if (vestingAllowAccumulate === undefined) {
    throw new Error("Unknown allow accumulate");
  }

  let vestingSchedule = {
    cliffDurationDays: process.env.VESTING_CLIFF_DURATION_DAYS,
    percentReleaseAtScheduleStart: hre.ethers.utils.parseEther(process.env.VESTING_PERCENT_RELEASE_AT_SCHEDULE_START),
    percentReleaseForEachInterval: hre.ethers.utils.parseEther(process.env.VESTING_PERCENT_RELEASE_FOR_EACH_INTERVAL),
    intervalDays: process.env.VESTING_INTERVAL_DAYS,
    gapDays: process.env.VESTING_GAP_DAYS,
    numberOfIntervals: process.env.VESTING_NUMBER_OF_INTERVALS,
    releaseMethod: process.env.VESTING_RELEASE_METHOD,
    allowAccumulate: vestingAllowAccumulate.toLowerCase() === "true",
  };

  let vestingTokenAddress;
  let vestingTokenDecimals;
  let vestingAdmin;
  let isPublicNetwork = true;

  console.log(`Contract Name: ${contractName}`);
  console.log(`Network: ${network}`);

  if (network === "bsc-mainnet") {
    vestingTokenAddress = process.env.BSC_MAINNET_VESTING_TOKEN_ADDRESS;
    vestingTokenDecimals = process.env.BSC_MAINNET_VESTING_TOKEN_DECIMALS;
    vestingAdmin = process.env.BSC_MAINNET_VESTING_ADMIN;
  } else if (network === "bsc-testnet") {
    vestingSchedule.cliffDurationDays = convertMonthsToDaysForTesting(vestingSchedule.cliffDurationDays);
    vestingSchedule.intervalDays = convertMonthsToDaysForTesting(vestingSchedule.intervalDays);
    vestingSchedule.gapDays = convertMonthsToDaysForTesting(vestingSchedule.gapDays);

    vestingTokenAddress = process.env.BSC_TESTNET_VESTING_TOKEN_ADDRESS;
    vestingTokenDecimals = process.env.BSC_TESTNET_VESTING_TOKEN_DECIMALS;
    vestingAdmin = process.env.BSC_TESTNET_VESTING_ADMIN;
  } else {
    throw new Error(`Unknown network: ${network}`);
  }

  if (vestingSchedule.cliffDurationDays === undefined) {
    throw new Error("Unknown vesting schedule cliff duration days");
  } else if (vestingSchedule.intervalDays === undefined) {
    throw new Error("Unknown vesting schedule interval days");
  } else if (vestingSchedule.gapDays === undefined) {
    throw new Error("Unknown vesting schedule gap days");
  } else if (vestingSchedule.numberOfIntervals === undefined) {
    throw new Error("Unknown vesting schedule number of intervals");
  } else if (vestingSchedule.releaseMethod === undefined) {
    throw new Error("Unknown vesting schedule release method");
  } else if (vestingTokenAddress === undefined) {
    throw new Error("Unknown vesting token address");
  } else if (vestingTokenDecimals === undefined) {
    throw new Error("Unknown vesting token decimals");
  } else if (vestingAdmin === undefined) {
    throw new Error("Unknown vesting admin");
  }

  // We get the contract to deploy
  const Vesting = await hre.ethers.getContractFactory(contractName);

  const vestingArgs = [
    vestingTokenAddress,
    vestingTokenDecimals,
    vestingSchedule.cliffDurationDays,
    vestingSchedule.percentReleaseAtScheduleStart,
    vestingSchedule.percentReleaseForEachInterval,
    vestingSchedule.intervalDays,
    vestingSchedule.gapDays,
    vestingSchedule.numberOfIntervals,
    vestingSchedule.releaseMethod,
    vestingSchedule.allowAccumulate,
  ];
  const vestingContract = await deployHelper.deployContract(Vesting, vestingArgs, true);

  await deployHelper.contractDeployed(vestingContract, isPublicNetwork);

  console.log("Vesting:", vestingContract.address);

  // Post Deployment Setup
  console.log("Post Deployment Setup");
  await vestingContract.setVestingAdmin(vestingAdmin);

  // Verify contract source code if deployed to public network
  if (isPublicNetwork) {
    console.log("Verify Contracts");

    await deployHelper.tryVerifyContract(vestingContract, vestingArgs);
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
