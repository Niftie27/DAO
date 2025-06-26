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

describe('Token', () => {
    let token, accounts, deployer, receiver, exchange

    beforeEach(async () => {
        // Loads the compiled Token.sol contract (ABI + bytecode) from artifacts
        // Sets up a contract factory to deploy new instances
        const Token = await ethers.getContractFactory('Token')

        // Deploys a new contract instance to Hardhat’s in-memory test blockchain
        // Sends bytecode in a transaction and gets back a contract address
        token = await Token.deploy('Dapp University', 'DAPP', '1000000')

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
    })

    describe('Deployment', () => {
        const name = 'Dapp University'
        const symbol = 'DAPP'
        const decimals = '18'
        const totalSupply = tokens('1000000')

    
    it('has correct name', async () => {
        // Reads the 'name()' value from the deployed contract instance
        // Verifies that the token name is 'My Token'
        expect(await token.name()).to.equal(name)
    })

    it('has correct symbol', async () => {
        expect(await token.symbol()).to.equal(symbol)
    })

    it('has correct decimals', async () => {
        expect(await token.decimals()).to.equal(decimals)
    })

    it('has correct total supply', async () => {
        // Reads the 'totalSupply()' value from the deployed contract instance
        // Verifies that the total supply is 1 million tokens

        expect(await token.totalSupply()).to.equal(totalSupply)
    })

    it('assigns total supply to the deployer', async () => {
        // Reads the 'balanceOf()' value for the deployer address
        // Reads the balance of the deployer address
        // Verifies that the deployer has the total supply of tokens
        expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
    })

    })

    describe('Sending Tokens', () => {
        let amount, transaction, result

        describe('Success', () => {

            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).transfer(receiver.address, amount)
                result = await transaction.wait()
            })

            it('transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
            })

            it('emits a Transfer event', async () => {
                // Checks if the transaction emits a Transfer event
                // Gets the first event from the transaction result
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
                // Verifies that the event name is 'Transfer'
                // Checks the event arguments
                // The event should have the following arguments:
                // from: deployer address
                // to: receiver address
                // value: amount transferred

                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })
        })

        describe('Failure', () => {
            it('rejects insufficient balances', async () => {
                const invalidAmount = tokens(10000000000)
                // to.be.reverted is special Waffle matcher (Assertion library)
                // It checks if the transaction reverts with an error
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
            })

            it('rejects invalid recipient', async () => {
                // Checks if the transaction reverts when trying to send tokens to the zero address
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted

            



            })
        })
    })

    describe('Approving Tokens', () => {

        beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).approve(exchange.address, amount)
                result = await transaction.wait()
            })

        describe('Success', () => {
            it('allocates an allowance for delegated token spending', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
            })

            it('emits an Approval event', async () => {
 
                const event = result.events[0]
                expect(event.event).to.equal('Approval')
 

                const args = event.args
                expect(args.owner).to.equal(deployer.address)
                expect(args.spender).to.equal(exchange.address)
                expect(args.value).to.equal(amount)
            })
        })

        describe('Failure', () => {
            it('rejects invalid spenders', async () => {
                const invalidAmount = tokens(10000000000)
                // to.be.reverted is special Waffle matcher (Assertion library)
                // It checks if the transaction reverts with an error
                await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })

    describe('Delegated Token Transfers', () => {
        let amount, transaction, result

        beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).approve(exchange.address, amount)
                result = await transaction.wait()
            })

        describe('Success', () => {
            beforeEach(async () => {
                transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
                result = await transaction.wait()
            })

            it('transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
            })

            it('resets the allowance', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(0)
            })

            it('emits a Transfer event', async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')

                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })

        describe('Failure', async () => {
                const invalidAmount = tokens(10000000000)
                await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
            })
        })
    })
})