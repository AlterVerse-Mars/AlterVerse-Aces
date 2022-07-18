const hre = require("hardhat");

const BN = web3.utils.BN;
const BN_ZERO = new BN("0");
const BN_ONE = new BN("1");
const BN_SECONDS_IN_DAY = new BN("86400");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function ether(ether) {
  return new BN(web3.utils.toWei(ether, "ether"));
}

function wei(wei) {
  return new BN(web3.utils.fromWei(wei, "wei"));
}

async function getBlockTimestamp(blockHashOrBlockNumber) {
  const block = await web3.eth.getBlock(blockHashOrBlockNumber);
  return new BN(block.timestamp);
}

function bnAbsDiff(bn1, bn2) {
  return bn1.gt(bn2) ? bn1.sub(bn2) : bn2.sub(bn1);
}

function bnAbsDiffLte(bn1, bn2, bnMaxDiff) {
  const absDiff = bnAbsDiff(bn1, bn2);
  return absDiff.lte(bnMaxDiff);
}

async function newErc20Token(tokenName, tokenSymbol, tokenCap) {
  const defaults = {
    tokenName: "AlterVerse",
    tokenSymbol: "ACE",
    tokenCap: ether("1000000000"),
  };

  const tokenNameValue = await getValueOrDefault(tokenName, () => defaults.tokenName);
  const tokenSymbolValue = await getValueOrDefault(tokenSymbol, () => defaults.tokenSymbol);
  const tokenCapValue = await getValueOrDefault(tokenCap, () => defaults.tokenCap);

  const Erc20Token = artifacts.require("Erc20Token");
  return await Erc20Token.new(tokenNameValue, tokenSymbolValue, tokenCapValue);
}

async function newMockErc20Token(tokenName, tokenSymbol, tokenCap, tokenDecimals) {
  const defaults = {
    tokenName: "Mock ERC20 Token",
    tokenSymbol: "MERC20",
    tokenCap: wei("1000000000000000"),
    tokenDecimals: 6,
  };

  const tokenNameValue = await getValueOrDefault(tokenName, () => defaults.tokenName);
  const tokenSymbolValue = await getValueOrDefault(tokenSymbol, () => defaults.tokenSymbol);
  const tokenCapValue = await getValueOrDefault(tokenCap, () => defaults.tokenCap);
  const tokenDecimalsValue = await getValueOrDefault(tokenDecimals, () => defaults.tokenDecimals);

  const MockErc20Token = artifacts.require("MockErc20Token");
  return await MockErc20Token.new(tokenNameValue, tokenSymbolValue, tokenCapValue, tokenDecimalsValue);
}

async function newVesting(
  tokenAddress,
  tokenDecimals,
  cliffDurationDays,
  percentReleaseAtScheduleStart,
  percentReleaseForEachInterval,
  intervalDays,
  gapDays,
  numberOfIntervals,
  releaseMethod,
  allowAccumulate
) {
  const defaults = {
    tokenDecimals: new BN("18"),
    cliffDurationDays: new BN("30"),
    percentReleaseAtScheduleStart: BN_ZERO,
    percentReleaseForEachInterval: ether("10"),
    intervalDays: new BN("30"),
    gapDays: new BN("0"),
    numberOfIntervals: new BN("10"),
    releaseMethod: new BN("1"), // LinearlyPerSecond
    allowAccumulate: false,
  };

  const tokenDecimalsValue = await getValueOrDefault(tokenDecimals, () => defaults.tokenDecimals);
  const cliffDurationDaysValue = await getValueOrDefault(cliffDurationDays, () => defaults.cliffDurationDays);
  const percentReleaseAtScheduleStartValue = await getValueOrDefault(
    percentReleaseAtScheduleStart,
    () => defaults.percentReleaseAtScheduleStart
  );
  const percentReleaseForEachIntervalValue = await getValueOrDefault(
    percentReleaseForEachInterval,
    () => defaults.percentReleaseForEachInterval
  );
  const intervalDaysValue = await getValueOrDefault(intervalDays, () => defaults.intervalDays);
  const gapDaysValue = await getValueOrDefault(gapDays, () => defaults.gapDays);
  const numberOfIntervalsValue = await getValueOrDefault(numberOfIntervals, () => defaults.numberOfIntervals);
  const releaseMethodValue = await getValueOrDefault(releaseMethod, () => defaults.releaseMethod);
  const allowAccumulateValue = await getValueOrDefault(allowAccumulate, () => defaults.allowAccumulate);

  const Vesting = artifacts.require("Vesting");
  return await Vesting.new(
    tokenAddress,
    tokenDecimalsValue,
    cliffDurationDaysValue,
    percentReleaseAtScheduleStartValue,
    percentReleaseForEachIntervalValue,
    intervalDaysValue,
    gapDaysValue,
    numberOfIntervalsValue,
    releaseMethodValue,
    allowAccumulateValue
  );
}

async function getValueOrDefault(value, defaultAsyncFn) {
  if (value !== undefined) {
    return value;
  } else {
    return await defaultAsyncFn();
  }
}

module.exports = {
  BN,
  BN_ZERO,
  BN_ONE,
  BN_SECONDS_IN_DAY,
  ZERO_ADDRESS,
  ether,
  wei,
  getBlockTimestamp,
  bnAbsDiff,
  bnAbsDiffLte,
  newErc20Token,
  newMockErc20Token,
  newVesting,
};
