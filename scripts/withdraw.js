const { ethers } = require("hardhat")

async function main() {
    let { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const fundMeTxResponse = await fundMe.withdraw()
    fundMeTxResponse.wait()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
