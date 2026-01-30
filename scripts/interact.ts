const hre = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

    const safeDeal = await hre.ethers.getContractAt("SafeDeal", CONTRACT_ADDRESS);

    console.log("Lecture des items...");
    // ... ta logique ici
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});