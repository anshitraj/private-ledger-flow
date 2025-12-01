import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // FHEVM compiler settings (for Zama FHEVM compilation)
      // Note: The actual FHEVM compiler is typically provided via Docker or local installation
      // This config is for Hardhat to recognize FHE types
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: process.env.VITE_SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 120000, // 120 seconds
      httpHeaders: {},
    },
    // Zama FHEVM testnet (when available)
    // For local FHEVM, use the localhost network after starting Docker
    fhevm: {
      url: process.env.FHEVM_RPC_URL || "http://localhost:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42069, // Example chainId - verify with Zama docs
    },
  },
  etherscan: {
    apiKey: process.env.VERIFY_API_KEY || "",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;

