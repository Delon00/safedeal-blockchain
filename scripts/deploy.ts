import hre from "hardhat";

async function main() {
    console.log("🚀 Déploiement en cours...");

    const connection = await hre.network.connect();
    const ethers = connection.ethers;

    if (!ethers) {
        throw new Error("ethers n'est pas disponible dans Hardhat 3. Vérifie la connexion réseau.");
    }

    const safeDeal = await ethers.deployContract("SafeDeal");

    await safeDeal.waitForDeployment();

    console.log(`✅ SafeDeal déployé à l'adresse : ${safeDeal.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
