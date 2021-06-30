import { HardhatUserConfig } from "hardhat/config"
import "hardhat-typechain"

import "@nomiclabs/hardhat-waffle"

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
    ],
  },
  typechain: {
    target: "ethers-v5",
  },
}

export default config
