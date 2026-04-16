import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying FairChainEscrow...');
  console.log('  Deployer address:', deployer.address);
  console.log('  Deployer balance:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'MATIC');

  const Factory = await ethers.getContractFactory('FairChainEscrow');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('\n✅ FairChainEscrow deployed!');
  console.log('   Contract address:', address);
  console.log('\nCopy this to your .env:');
  console.log(`   ESCROW_CONTRACT_ADDRESS=${address}`);
  console.log('\nVerify on Polygonscan (optional):');
  console.log(`   npx hardhat verify --network polygonAmoy ${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
