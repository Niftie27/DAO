const { ethers } = require("hardhat");

async function main() {
    // Deployment/Migration goes here...

    const NAME = 'Dapp University'
    const SYMBOL = 'DAPP'
    const MAX_SUPPLY = '1000000'

    // Fetch and Deploy
    const Token = await hre.ethers.getContractFactory('Token')
    let token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY)
    await token.deployed()

    console.log(`Token deployed to: ${token.address}\n`)

    const DAO = await hre.ethers.getContractFactory('DAO')
    let dao = await DAO.deploy(token.address, '500000000000000000000001')
    await dao.deployed()
    
    console.log(`DAO deployed to: ${dao.address}\n`)
}


main()
    .then(() => process.exit(0))
    // The `then` method is used to handle the promise returned by the `main` function.
    // The `process.exit(0)` method is used to exit the process with a success code.
    // The `catch` method is used to handle any errors that occur during the execution of the `main` function.
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// The `catch` method is used to handle any errors that occur during the execution of the `main` function.
// The `process.exit(1)` method is used to exit the process with an error code.