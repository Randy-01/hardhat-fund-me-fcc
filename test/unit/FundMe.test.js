const { ethers, deployments } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", function () {
    let deployer, fundMe, mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer

        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer)
    })

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async function () {
            const priceFeed = await fundMe.getPriceFeed()
            assert.equal(priceFeed, mockV3Aggregator.address)
        })
    })

    describe("fund", function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!",
            )
        })
        it("Updates the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue })
            const fund = await fundMe.getFunder(0)
            assert.equal(fund, deployer)
        })
    })

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraws ETH from a single funder", async function () {
            const startFundMeBalance =
                await ethers.provider.getBalance(fundMe.address)
            const startDeployerBalance = await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
                
            const endFundMeBalance =
                await ethers.provider.getBalance(fundMe.address)
            const endDeployerBalance = await ethers.provider.getBalance(deployer)

            assert.equal(endFundMeBalance, 0)
            assert.equal(
                startFundMeBalance.add(startDeployerBalance).toString(),
                endDeployerBalance.add(gasCost).toString(),
            )
        })
        it("is allows us to withdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners()
            for(let i = 1; i < 6; i++){
                await fundMe.connect(accounts[i]).fund({value: sendValue})
            }
            const startFundMeBalance =
                await ethers.provider.getBalance(fundMe.address)
            const startDeployerBalance = await ethers.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
                
            const endFundMeBalance =
                await ethers.provider.getBalance(fundMe.address)
            const endDeployerBalance = await ethers.provider.getBalance(deployer)

            assert.equal(endFundMeBalance, 0)
            assert.equal(
                startFundMeBalance.add(startDeployerBalance).toString(),
                endDeployerBalance.add(gasCost).toString(),
            )

            await expect(fundMe.getFunder(0)).to.be.reverted
            for(let i = 1; i < 6; i++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
            }
        })
        it("Only allows the owner to withdraw", async function(){
            const accounts = await ethers.getSigners()
            const connectContract = await fundMe.connect(accounts[1])
            await expect(connectContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")
        })
    })
})
