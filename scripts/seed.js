
const hre = require("hardhat");
const config = require('../src/config.json') // so we can seed also on test network

const tokens = (n) => {
    // Converts a number to a BigNumber representing the specified number of tokens
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
// Converts a number to a BigNumber with 18 decimal places
// This is used to handle token amounts in tests

const ether = tokens

async function main() {
    console.log(`Fetching accounts & network...\n`)

    const accounts = await ethers.getSigners()
    const funder = accounts[0]    // also deployer
    const investor1 = accounts[1]
    const investor2 = accounts[2]
    const investor3 = accounts[3]
    const recipient = accounts[4]

    let transaction

    const { chainId } = await ethers.provider.getNetwork()

    console.log(`Fetching token and transferring to accounts...\n`)

    // Fetch deployed token
    const token = await ethers.getContractAt('Token', config[chainId].token.address)
    console.log(`Token fetched: ${token.address}\n`)

    // Send tokens to investors - each one gets 20%
    transaction = await token.transfer(investor1.address, tokens(200000))
    await transaction.wait()

    transaction = await token.transfer(investor2.address, tokens(200000))
    await transaction.wait()

    transaction = await token.transfer(investor3.address, tokens(200000))
    await transaction.wait()

    console.log(`Fetching DAO...\n`)

    // Fetch deployed dao
    const dao = await ethers.getContractAt('DAO', config[chainId].dao.address)
    console.log(`DAO deployed to: ${dao.address}\n`)

    // Funder sends Ether to DAO treasury
    // transaction = await funder.sendTransaction({ to: dao.address, value: ether(1000) })          // ❌ removed because of 6th HW instruction
    // await transaction.wait()                                                                     // ❌ removed because of 6th HW instruction
    // console.log('Sent funds to dao treasury...\n')                                               // ❌ removed because of 6th HW instruction
    // ✅ Fund DAO treasury with DAPP tokens instead of ETH
    transaction = await token.transfer(dao.address, tokens(200000))
    await transaction.wait()
    console.log('Sent DAPP to DAO treasury...\n')


    // Create 3 proposals and let them pass
    for (var i = 0; i < 3; i++) {
        // Create proposal
        // transaction = await dao.connect(investor1).createProposal(`Proposal ${i + 1}`, ether(100), recipient.address)    // ❌ removed because of 6th HW instruction
        transaction = await dao.connect(investor1).createProposal(`Proposal ${i + 1}`, tokens(100), recipient.address, "Fund Jane for web development")   // ✅ tokens, not Ether
        await transaction.wait()

        // Vote 1
        transaction = await dao.connect(investor1).vote(i + 1, true)
        await transaction.wait()

        // Vote 2
        transaction = await dao.connect(investor2).vote(i + 1, true)
        await transaction.wait()

        // Vote 3
        transaction = await dao.connect(investor3).vote(i + 1, true)
        await transaction.wait()

        // Finalize
        transaction = await dao.connect(investor1).finalizeProposal(i + 1)
        await transaction.wait()

        console.log(`Created & Finalized Proposal ${i + 1}\n`)
    }

    console.log(`Creating one more proposal ${i + 1}\n`)

    // Create one more proposal
    // transaction = await dao.connect(investor1).createProposal(`Proposal 4`, ether(100), recipient.address) // ❌ removed because of 6th HW instruction
    // ✅ One more proposal in DAPP
    transaction = await dao.connect(investor1).createProposal(`Proposal 4`, tokens(100), recipient.address, "Fund Eric for animation")
    await transaction.wait()

    // Vote 1
    transaction = await dao.connect(investor2).vote(4, true)
    await transaction.wait()

    // Vote 2
    transaction = await dao.connect(investor3).vote(4, true)
    await transaction.wait()

    console.log(`Finished.\n`)

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
    