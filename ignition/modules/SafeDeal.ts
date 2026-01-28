import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SafeDealModule = buildModule("SafeDeal", (m) => {
  const safeDeal = m.contract("SafeDeal");
  return { safeDeal };
});

export default SafeDealModule;