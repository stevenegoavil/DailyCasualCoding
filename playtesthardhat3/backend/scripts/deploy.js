const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

let main = async () => {
  try {

  const contractLauncher = await hre.ethers.getContractFactory("playfile");
  const playfilecontract = await contractLauncher.deploy();

  await playfilecontract.waitForDeployment(); 

  const launcherAddress = await playfilecontract.getAddress();
  console.log("Solidity contract deployed to:", launcherAddress);


  const frontendPath = path.resolve(__dirname, "../frontend/js/contract-address.js");
  fs.writeFileSync(
      frontendPath,
      `export const CONJURED_CONTRACT_ADDRESS = "${playfilecontract.target}";\n`
  );

  console.log("Contract address written to:", frontendPath);
  console.log(`TokenLauncher deployed to: ${launcherAddress}`);

  process.exitCode = 0;
}

catch(error){
  console.log(error, "Error, ");
  process.exitCode = 1;
}
};

main();