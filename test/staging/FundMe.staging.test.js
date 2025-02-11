const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", function () {
          let deployer, fundMe
          const sendValue = ethers.utils.parseEther("0.01")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async function () {
              const fundTxResponse = await fundMe.fund({ value: sendValue })
              fundTxResponse.wait(1)
              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address,
              )
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal...",
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
