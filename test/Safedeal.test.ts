import { expect } from "chai";
import hre from "hardhat";
import SafeDealModule from "../ignition/modules/SafeDeal.js"; 



// Pour avancer le temps (Cooldown / Lock)
async function increaseTime(provider: any, seconds: number) {
  await provider.send("evm_increaseTime", [seconds]);
  await provider.send("evm_mine", []);
}

// Pour vérifier qu'une transaction échoue (remplace 'revertedWith')
async function expectRevert(promise: Promise<any>, expectedErrorMessage: string) {
  try {
    await promise;
    expect.fail("La transaction aurait dû échouer mais a réussi !");
  } catch (error: any) {
    // On vérifie si le message d'erreur contient ce qu'on cherche
    const message = error.message || error.reason || "";
    if (!message.includes(expectedErrorMessage)) {
      console.error(`\nATTENTION: Erreur reçue: "${message}"`);
      console.error(`On attendait: "${expectedErrorMessage}"\n`);
    }
    expect(message).to.include(expectedErrorMessage, `Mauvais message d'erreur. Reçu: ${message}`);
  }
}

// --- LES TESTS DE L'EXAMEN ---

describe("SafeDeal - Tests Examen (Hardhat 3)", function () {
  
  // Fonction pour récupérer le setup propre avant chaque test
  async function setup() {
    const connection = await hre.network.connect();
    // On déploie via Ignition
    const { safeDeal } = await connection.ignition.deploy(SafeDealModule);
    const [owner, user1, user2] = await connection.ethers.getSigners();
    return { safeDeal, owner, user1, user2, provider: connection.provider };
  }

  it("✅ EXIGENCE 1: Limite de 4 items par utilisateur", async function () {
    const { safeDeal, user1, provider } = await setup();

    // 1. Création de 4 items (Autorisé)
    for (let i = 0; i < 4; i++) {
      console.log(`   Creation item ${i + 1}/4...`);
      await safeDeal.connect(user1).createItem(`Item ${i}`, "Type", 100, "hash");
      // On avance de 6 minutes pour passer le Cooldown entre chaque création
      await increaseTime(provider, 6 * 60);
    }

    // 2. Tentative de création du 5ème item (Doit échouer)
    console.log("   Tentative creation 5eme item (doit echouer)...");
    await expectRevert(
      safeDeal.connect(user1).createItem("Item 5", "Trop", 100, "hash"),
      "Limite" // Mot clé attendu dans l'erreur (ex: "Limite atteinte")
    );
  });

  it("✅ EXIGENCE 2: Blocage des fonds (Lock 10 min)", async function () {
    const { safeDeal, user1, user2, provider } = await setup();
    const price = hre.ethers.parseEther("1");

    // Création
    await safeDeal.connect(user1).createItem("Maison", "Immo", price, "hash");

    // Achat
    await safeDeal.connect(user2).purchaseItem(0, { value: price });

    // Tentative immédiate de validation (Doit échouer)
    console.log("   Tentative validation immediate (doit echouer)...");
    await expectRevert(
      safeDeal.connect(user2).confirmReceipt(0),
      "Lock" // Mot clé attendu (ex: "Trop tot (Lock 10 min)")
    );

    // On avance le temps de 11 minutes
    console.log("   ⏩ Avance rapide de 11 minutes...");
    await increaseTime(provider, 11 * 60);

    // Tentative après délai (Doit réussir)
    console.log("   Validation après délai...");
    await safeDeal.connect(user2).confirmReceipt(0);
    
    // Vérification : L'état doit être RELEASED (2)
    const item = await safeDeal.items(0);
    expect(item.state).to.equal(2n); // 2n car BigInt
  });

  it("✅ EXIGENCE 3: Cycle complet (Achat -> Réception -> Virement)", async function () {
    const { safeDeal, user1, user2, provider } = await setup();
    const price = hre.ethers.parseEther("1");

    // Création
    await safeDeal.connect(user1).createItem("Velo", "Sport", price, "hash");
    
    // Solde Vendeur AVANT
    const balanceBefore = await provider.getBalance(user1.address);

    // Achat
    await safeDeal.connect(user2).purchaseItem(0, { value: price });

    // Attente 11 min
    await increaseTime(provider, 11 * 60);

    // Validation
    await safeDeal.connect(user2).confirmReceipt(0);

    // Solde Vendeur APRÈS
    const balanceAfter = await provider.getBalance(user1.address);
    
    console.log(`   Solde avant: ${hre.ethers.formatEther(balanceBefore)} ETH`);
    console.log(`   Solde apres: ${hre.ethers.formatEther(balanceAfter)} ETH`);

    // Le vendeur doit avoir gagné environ 1 ETH
    expect(balanceAfter).to.be.greaterThan(balanceBefore);
  });
});