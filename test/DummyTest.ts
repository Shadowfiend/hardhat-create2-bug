import { ethers, waffle } from "hardhat"
import { MockProvider } from "ethereum-waffle"
import { expect } from "chai"

import DummyJSON from "../artifacts/contracts/Dummy.sol/Dummy.json"

describe("Dummy", () => {
  async function runDeployWithProvider(provider) {
    const wallet = provider.getWallets()[0]

    const singletonFactoryAddress = "0xce0042B868300000d44A59004Da54A005ffdcf9f"
    const singletonFactoryDeployerAddress =
      "0xBb6e024b9cFFACB947A71991E386681B1Cd1477D"
    const singletonFactoryDeploymentCost =
      ethers.BigNumber.from("24700000000000000")
    const singletonFactoryDeploymentTx =
      "0xf9016c8085174876e8008303c4d88080b90154608060405234801561001057600080fd5b50610134806100206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80634af63f0214602d575b600080fd5b60cf60048036036040811015604157600080fd5b810190602081018135640100000000811115605b57600080fd5b820183602082011115606c57600080fd5b80359060200191846001830284011164010000000083111715608d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550509135925060eb915050565b604080516001600160a01b039092168252519081900360200190f35b6000818351602085016000f5939250505056fea26469706673582212206b44f8a82cb6b156bfcc3dc6aadd6df4eefd204bc928a4397fd15dacf6d5320564736f6c634300060200331b83247000822470"

    const singletonFactoryABI = [
      {
        constant: false,
        inputs: [
          { internalType: "bytes", name: "_initCode", type: "bytes" },
          { internalType: "bytes32", name: "_salt", type: "bytes32" },
        ],
        name: "deploy",
        outputs: [
          {
            internalType: "address payable",
            name: "createdContract",
            type: "address",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ]

    await wallet.sendTransaction({
      to: singletonFactoryDeployerAddress,
      value: singletonFactoryDeploymentCost,
    })
    // Wait for confirmation.
    await (await provider.sendTransaction(singletonFactoryDeploymentTx)).wait()

    const factory = new ethers.Contract(
      singletonFactoryAddress,
      singletonFactoryABI,
      wallet
    )

    expect(
      await provider.getCode(singletonFactoryAddress, "latest")
    ).to.not.equal(
      "0x",
      `expected non-empty code at singleton factory address ${singletonFactoryAddress}`
    )

    const dummyFactory = new ethers.ContractFactory(
      DummyJSON.abi,
      DummyJSON.bytecode
    )

    const dummyDeploySalt = ethers.utils.solidityKeccak256(
      ["string"],
      ["dummy"]
    )

    const dummyDeployBytes = dummyFactory.getDeployTransaction().data
    const dummyAddress = ethers.utils.getCreate2Address(
      singletonFactoryAddress,
      dummyDeploySalt,
      ethers.utils.solidityKeccak256(["bytes"], [dummyDeployBytes])
    )

    const address = await factory.callStatic.deploy(
      dummyDeployBytes,
      dummyDeploySalt
    )
    expect(address).to.equal(dummyAddress)

    const deploymentTransaction = await factory.deploy(
      dummyDeployBytes,
      dummyDeploySalt
    )
    const deploymentResult = await deploymentTransaction.wait()

    expect(deploymentResult.status).to.equal(1)
    expect(await provider.getCode(dummyAddress, "latest")).to.not.equal(
      "0x",
      `expected non-empty code at Dummy CREATE2 address ${dummyAddress}`
    )
  }

  it("should deploy the dummy contract with a Waffle provider", async () => {
    await runDeployWithProvider(new MockProvider)
  })

  it("should deploy the dummy contract with a Hardhat provider", async () => {
    await runDeployWithProvider(waffle.provider)
  })
})
