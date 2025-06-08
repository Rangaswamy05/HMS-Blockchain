const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HMSRecords contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const HMSRecords = await ethers.getContractFactory("HMSRecords");
  const hmsRecords = await HMSRecords.deploy();

  await hmsRecords.deployed();

  console.log("HMSRecords deployed to:", hmsRecords.address);
  console.log("Transaction hash:", hmsRecords.deployTransaction.hash);

  // Wait for a few confirmations
  console.log("Waiting for confirmations...");
  await hmsRecords.deployTransaction.wait(5);

  console.log("Deployment completed!");
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: hmsRecords.address,
    deployer: deployer.address,
    network: hre.network.name,
    blockNumber: hmsRecords.deployTransaction.blockNumber,
    transactionHash: hmsRecords.deployTransaction.hash,
    timestamp: new Date().toISOString()
  };

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2));

  // Verify contract if on testnet
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Verifying contract on block explorer...");
    try {
      await hre.run("verify:verify", {
        address: hmsRecords.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });