import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';

// Components
import Navigation from './Navigation';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
// import TOKEN_ABI from '../abis/Token.json'
// Config: Import your network config here
// import config from '../config.json';

// ABIs

// config
import config from '../config.json';

function App() {

    // null means "no provider yet", 0 means "0 tokens yet"
    // userState hook
    const [provider, setProvider] = useState(null)

    const [account, setAccount] = useState(null)
    const [accountBalance, setAccountBalance] = useState(0)

    const [price, setPrice] = useState(0)

    const [isLoading, setIsLoading] = useState(true)

    const loadBlockchainData = async () => {
        // Initiate provider, create ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)

        // Initiate contracts
        const token = new ethers.Contract(config[31337].token.address, TOKEN_ABI, provider)
        console.log("Token deployed to:", token.address);

        // Set accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)

        // Fetch account balance
        const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)
        setAccountBalance(accountBalance)

        setIsLoading(false)
    }

    useEffect(() => {
        if (isLoading) {
            loadBlockchainData()
        }  
    }, [isLoading])

    return(
        <Container>
            <Navigation />

            <h1 className='my-4 text-center'>Introducing DApp Token!</h1>

            {isLoading ? (
                <Loading />
            ) : (
                <>
                <p className ='text-center'><strong>Current Price:</strong> {price} ETH</p>
                </>
            )}

            <hr />
          
        </Container>
    )
}

export default App;
