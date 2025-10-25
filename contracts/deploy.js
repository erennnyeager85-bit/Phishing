// Deployment script for PhishBlock contract using Hardhat
const hre = require("hardhat");

async function main() {
  console.log("Deploying PhishBlock contract...");

  // Get the contract factory
  const PhishBlock = await hre.ethers.getContractFactory("PhishBlock");
  
  // Deploy the contract
  const phishBlock = await PhishBlock.deploy();
  
  await phishBlock.deployed();
  
  console.log("PhishBlock deployed to:", phishBlock.address);
  console.log("\nSave this address for your frontend configuration!");
  console.log("\nVerify contract on PolygonScan:");
  console.log(`npx hardhat verify --network mumbai ${phishBlock.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });