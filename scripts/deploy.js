const { artifacts } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const Dynamic = await hre.ethers.getContractFactory("Dynamic");
  const dynamic = await Dynamic.deploy();
  await dynamic.deployed();
  console.log("Dynamic NFT Contract deployed to:", dynamic.address);
  storeContractData(dynamic);
}

function storeContractData(contractData) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/dynamic-address.json",
    JSON.stringify({ Dynamic: contractData.address }, undefined, 2)
  );

  const dynamicArtifacts = artifacts.readArtifactSync("Dynamic");

  fs.writeFileSync(
    contractsDir + "/Dynamic.json",
    JSON.stringify(dynamicArtifacts, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });