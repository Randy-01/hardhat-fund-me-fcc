const { ethers } = require("hardhat")

async function main() {
    const sendValue = ethers.utils.parseEther("0.01")
    let deployer = (await getNamedAccounts()).deployer
    let fundMe = await ethers.getContract("FundMe", deployer)
    const fundMeTxResponse = await fundMe.fund({ value: sendValue })
    fundMeTxResponse.wait()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
