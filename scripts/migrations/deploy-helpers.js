const fs = require("fs").promises;
const path = require("path");
const hre = require("hardhat");

const TOKEN_MAX_DECIMALS = 18;

async function deployContract(contractFactory, constructorArgs, logConstructorArgs) {
  const contract = await contractFactory.deploy(...constructorArgs);

  if (logConstructorArgs) {
    console.log(`Constructor arguments for contract at ${contract.address}:`);
    constructorArgs.forEach((x) =>
      console.log(`  - ${x.toString().includes("[object Object]") ? JSON.stringify(x) : x.toString()}`)
    );
  }

  return contract;
}

async function contractDeployed(contract, isPublicNetwork) {
  console.log(`Waiting for contract deployment at ${contract.address}`);
  await contract.deployed();

  if (isPublicNetwork) {
    console.log(`Waiting for 5 confirmations of contract at ${contract.address}`);
    await contract.deployTransaction.wait(5);
  }

  console.log(`Deployed contract at ${contract.address}`);
}

async function tryVerifyContract(contract, verifyTaskArgs) {
  let explorer;
  let numberOfConfirmations;
  let verifyTask;

  switch (contract.deployTransaction.chainId) {
    case 56:
      explorer = "BscScan";
      numberOfConfirmations = 40; // 2mins for 3s block time (https://academy.binance.com/en/articles/an-introduction-to-binance-smart-chain-bsc)
      verifyTask = "verify:verify";
      break;
    case 97:
      explorer = "BscScan";
      numberOfConfirmations = 5;
      verifyTask = "verify:verify";
      break;
  }

  try {
    console.log(
      `Verifying the contract ${contract.address} on ${explorer} after ${numberOfConfirmations} confirmations ...`
    );

    await hre.ethers.provider.waitForTransaction(contract.deployTransaction.hash, numberOfConfirmations, 1800000); // 30 mins timeout for 300 confirmations in BSC mainnet at 3s block time

    console.log(`Running ${verifyTask} for address ${contract.address} with constructor arguments ${verifyTaskArgs}`);

    await hre.run(verifyTask, {
      address: contract.address,
      constructorArguments: verifyTaskArgs,
    });

    return true;
  } catch (err) {
    const REASON_ALREADY_VERIFIED = "Reason: Already Verified";
    if (err.toString().includes(REASON_ALREADY_VERIFIED)) {
      console.log(REASON_ALREADY_VERIFIED);
      return true;
    }

    console.error(`An error has occurred during verifying on ${explorer}:\n`, err);

    const network = hre.network.name;

    let verifyCommand;

    if (verifyTaskArgs.toString().includes("[object Object]")) {
      const projectArtifactsDirPath = hre.config.paths.artifacts;
      const projectConstructorArgsDirPath = path.join(projectArtifactsDirPath, "constructorArgs");
      const projectConstructorArgsFilename = `${contract.address}.js`;
      const projectConstructorArgsFilePath = path.join(projectConstructorArgsDirPath, projectConstructorArgsFilename);

      await writeFile(
        projectConstructorArgsDirPath,
        projectConstructorArgsFilename,
        `module.exports = ${JSON.stringify(verifyTaskArgs, null, 4)};`
      );

      verifyCommand = `npx hardhat verify --network ${network} --constructor-args ${projectConstructorArgsFilePath} ${contract.address}`;
    } else {
      const quotedConstructorArgs = verifyTaskArgs.map((x) => `"${x.toString().replace(/"/g, '\\"')}"`);
      verifyCommand = `npx hardhat verify --network ${network} ${contract.address} ${quotedConstructorArgs.join(" ")}`;
    }

    console.log(
      [
        `Failed to verify on ${explorer}, please run the following command to verify manually:`,
        "--------------------",
        verifyCommand,
        "--------------------",
      ].join("\n")
    );

    return false;
  }
}

async function writeFile(dirAbsPath, filename, filecontent) {
  const fileAbsPath = path.join(dirAbsPath, filename);

  try {
    await fs.mkdir(dirAbsPath);
  } catch (err) {
    if (err.errno === -17 && err.code === "EEXIST") {
      console.log(`${dirAbsPath} exists`);
    } else {
      console.error(`Error while creating directory ${dirAbsPath}:\n`, err);
    }
  }

  await fs.writeFile(fileAbsPath, filecontent, "utf8");
}

function scaleWeiToDecimals(weiAmount, decimals) {
  if (weiAmount.lte(0)) {
    throw new Error(`Invalid wei amount: ${weiAmount}`);
  }

  if (decimals < 0 || decimals > TOKEN_MAX_DECIMALS) {
    throw new Error(`Invalid decimals: ${decimals}`);
  }

  let decimalsAmount;

  if (decimals < TOKEN_MAX_DECIMALS) {
    const decimalsDiff = TOKEN_MAX_DECIMALS - decimals;
    const scale = hre.ethers.utils.parseEther("10").pow(decimalsDiff);
    decimalsAmount = weiAmount.div(scale);
  } else {
    decimalsAmount = weiAmount;
  }

  return decimalsAmount;
}

module.exports = {
  deployContract,
  contractDeployed,
  tryVerifyContract,
  scaleWeiToDecimals,
};
