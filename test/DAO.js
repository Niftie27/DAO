const { expect } = require("chai") 
const { ethers } = require("hardhat") 
// Importing ethers lib from hardhat lib
// destructuring ethers from hardhat
// Taking ethers part of hardhat library and assigning it to a variable

const tokens = (n) => {
    // Converts a number to a BigNumber representing the specified number of tokens
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
// Converts a number to a BigNumber with 18 decimal places
// This is used to handle token amounts in tests

const ether = tokens

describe('DAO', () => {
    let token, dao, accounts
    let deployer, funder

    beforeEach(async () => {
        // Set up accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        funder = accounts[1]

        // Deploy Token
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Dapp University', 'DAPP', '1000000')

        // Deploy DAO
        const DAO = await ethers.getContractFactory('DAO')
        dao = await DAO.deploy(token.address, '500000000000000000000001')

        // 100 Ether to DAO treasury for Governance
        await funder.sendTransaction({ to: dao.address, value: ether(100) })
    })

    describe('Deployment', () => {

        // checks ether balance of DAO treasury
        it('sends Ether to the DAO treasury', async () => {
            expect(await ethers.provider.getBalance(dao.address)).to.eq(ether(100))
        })

        
        it('returns token address', async () => {
            // Reads the 'name()' value from the deployed contract instance
            // Verifies that the token name is 'My Token'
            expect(await dao.token()).to.equal(token.address)
        })

        it('returns quorum', async () => {
            expect(await dao.quorum()).to.equal('500000000000000000000001')
            
        })

    })

})