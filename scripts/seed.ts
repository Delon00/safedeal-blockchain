import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();
  const ethers = connection.ethers;

  if (!ethers) {
    throw new Error("ethers n'est pas disponible. Vérifie la connexion.");
  }
  // -------------------------------------------------------------

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  const safeDeal = await ethers.getContractAt("SafeDeal", contractAddress);

  console.log("🌱 Création d'un premier article...");


  const tx = await safeDeal.createItem(
    "Windows 11 Pro Key", 
    "Software", 
    ethers.parseEther("1"), 
    "ipfs://bafkreih5j3...exemple"
  );

  await tx.wait();

  console.log(" Article créé ! ID: 0");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});