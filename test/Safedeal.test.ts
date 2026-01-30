import { expect } from "chai";
import hre from "hardhat";

describe("SafeDeal - Tests Examen (Hardhat 3)", function () {

  async function deploySafeDealFixture() {
    // 1. Connexion à l'environnement
    const { ethers, networkHelpers } = await hre.network.connect();
    // 2. Récupération du Provider (Indispensable pour lire les soldes ETH)
    const provider = ethers.provider;
    const [owner, user1, user2] = await ethers.getSigners();

    // 3. Déploiement
    const safeDealContract = await ethers.deployContract("SafeDeal");
    await safeDealContract.waitForDeployment();
    const safeDeal = safeDealContract as any;
    return { safeDeal, owner, user1, user2, ethers, networkHelpers, provider };
  }

  // --- TEST 1 : LIMITE DE POSSESSION ---
  it("EXIGENCE 1: Limite de 4 items par utilisateur", async function () {
    const { safeDeal, user1, networkHelpers } = await deploySafeDealFixture();
    for (let i = 0; i < 4; i++) {
      await safeDeal.connect(user1).createItem(`Item ${i}`, "Type", 100, "hash");
      await networkHelpers.time.increase(6 * 60); 
    }

    await expect(
      safeDeal.connect(user1).createItem("Item 5", "Trop", 100, "hash")
    ).to.be.revertedWith("Limite atteinte (Max 4 items)");
  });

  // --- TEST 2 : SÉCURITÉ TEMPORELLE (LOCK) ---
  it("EXIGENCE 2: Blocage des fonds (Lock 10 min)", async function () {
    const { safeDeal, user1, user2, ethers, networkHelpers } = await deploySafeDealFixture();
    const price = ethers.parseEther("1");

    await safeDeal.connect(user1).createItem("Maison", "Immo", price, "hash");

    await safeDeal.connect(user2).purchaseItem(0, { value: price });

    await expect(
      safeDeal.connect(user2).confirmReceipt(0)
    ).to.be.revertedWith("Periode de blocage non terminee");

    await networkHelpers.time.increase(11 * 60);

    await expect(safeDeal.connect(user2).confirmReceipt(0))
      .to.emit(safeDeal, "ItemReleased")
      .withArgs(0n, user1.address);
    
    const item = await safeDeal.items(0);
    expect(item.state).to.equal(2n); 
  });

  it(" EXIGENCE 3: Cycle complet & Transfert des fonds", async function () {
    const { safeDeal, user1, user2, ethers, networkHelpers, provider } = await deploySafeDealFixture();
    
    const price = ethers.parseEther("1");

    await safeDeal.connect(user1).createItem("Velo", "Sport", price, "hash");
    
    // Solde Vendeur AVANT
    const balanceBefore = await provider.getBalance(user1.address);

    // Achat + Attente
    await safeDeal.connect(user2).purchaseItem(0, { value: price });
    await networkHelpers.time.increase(11 * 60);

    // Validation (Libération des fonds)
    await safeDeal.connect(user2).confirmReceipt(0);

    // Solde Vendeur APRÈS
    const balanceAfter = await provider.getBalance(user1.address);
    
    // Vérification : Le vendeur a bien reçu l'argent
    expect(balanceAfter).to.be.greaterThan(balanceBefore);
    expect(balanceAfter).to.equal(balanceBefore + price);
  });

  // --- TEST 4 : COOLDOWN ---
  it("EXIGENCE 4: Cooldown entre deux actions", async function () {
    const { safeDeal, user1 } = await deploySafeDealFixture();

    await safeDeal.connect(user1).createItem("Item A", "Type", 100, "hash");

    // Action immédiate suivante -> Doit échouer
    await expect(
      safeDeal.connect(user1).createItem("Item B", "Type", 100, "hash")
    ).to.be.revertedWith("Cooldown actif: Veuillez patienter");
  });

});