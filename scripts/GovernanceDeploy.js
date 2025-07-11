// scripts/GovernanceDeploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const initialSupply = ethers.utils.parseUnits("1000000", 18);

  /* 1. deploy token */
  const Token = await ethers.getContractFactory("GovernanceToken");
  const token = await Token.deploy(initialSupply);
  await token.deployed();                     // wait until mined

  /* 2. deploy governor – pass the token.address (v5) */
  const Governor = await ethers.getContractFactory("GovernanceDAO");
  const governor = await Governor.deploy(token.address);
  await governor.deployed();

  console.log("GovernanceToken:", token.address);
  console.log("GovernanceDAO  :", governor.address);
}

main().catch(console.error);
