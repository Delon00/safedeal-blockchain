import hre from "hardhat";

async function main() {
  // --- 1. RECUPERATION DE ETHERS (Comme dans tes autres scripts) ---
  const connection = await hre.network.connect();
  const ethers = connection.ethers;

  if (!ethers) {
    throw new Error("Ethers introuvable. Vérifie ta config Hardhat.");
  }
  // -----------------------------------------------------------------

  // On prend le compte #1 (l'acheteur) - Le compte #0 est le vendeur (seller)
  const [seller, buyer] = await ethers.getSigners();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log(`👤 Acheteur : ${buyer.address}`);
  
  // Vérification du solde réel
  const balance = await ethers.provider.getBalance(buyer.address);
  console.log(`💰 Solde réel : ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error("❌ ERREUR : Ce compte a vraiment 0 ETH !");
    console.log("👉 Conseil : Si tu vois 0, essaie d'utiliser le compte #2 ou #3 en changeant l'index dans 'getSigners()'");
    return;
  }

  // Connexion au contrat en tant qu'acheteur
  const safeDeal = await ethers.getContractAt("SafeDeal", contractAddress, buyer);

  console.log("🛒 Tentative d'achat de l'article 0...");
  
  // Achat (1 ETH)
  // Note : On utilise 'ethers.parseEther', pas 'hre.network.parseEther'
  const tx = await safeDeal.purchaseItem(0, { value: ethers.parseEther("1.0") });
  await tx.wait();

  console.log("✅ Achat réussi via script !");
  console.log("🔄 Retourne sur Angular et rafraîchis la page. L'état devrait être LOCKED.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});