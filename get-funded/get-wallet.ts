import { privateKeyToAccount } from "viem/accounts";
const account = privateKeyToAccount("0x5b78a25a7116307ce6291c17e182ca241c1f2c9bca74e1be8bc2ae23014d6cd4");
console.log("Wallet Address:", account.address);
