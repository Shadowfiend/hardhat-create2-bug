# Hardhat CREATE2 bug

This repository is a minimal reproduction of a bug with the Hardhat Waffle
provider's CREATE2 deployment handling. The repository contains a single empty
dummy contract, [`Dummy.sol`](./contracts/Dummy.sol), as well as a test file
with the two demonstrative tests, [`DummyTest.ts`](./test/DummyTest.ts).

The test runs the exact same CREATE2 deployment using Waffle's bare
MockProvider, and using Hardhat's wrapped version of that provider. The hardhat
version does not result in deployed code, while the Waffle MockProvider test
results in deployed code.

The CREATE2 deployment is done using the
[EIP-2470](https://eips.ethereum.org/EIPS/eip-2470) `SingletonFactory`. The
factory is deployed using the preconstructed transaction specified in the EIP,
and the dummy contract is then deployed by using the Ethers `ContractFactory`
to fetch the deployment bytes. A simple static salt is used for the deployment.

