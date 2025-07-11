import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';

// Components
import Navigation from './Navigation';
import Create from './Create';
import Proposals from './Proposals';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
import TOKEN_ABI from '../abis/Token.json'                      // ✅ 6th HW instruction
// Config: Import your network config here
// import config from '../config.json';

// ABIs
// import TOKEN_ABI from '../abis/Token.json'
import DAO_ABI from '../abis/DAO.json'

import GOVERNANCEDAO_ABI from '../abis/GovernanceDAO.json'
import GOVERNANCETOKEN_ABI from '../abis/GovernanceToken.json'

// config
import config from '../config.json';

function App() {

    // null means "no provider yet", 0 means "0 tokens yet"
    // userState hook
    const [provider, setProvider] = useState(null)
    const [dao, setDao] = useState(null)
    const [token, setToken]             = useState(null);               // ✅ 6th HW instruction
    const [daoToken, setDaoToken]      = useState(null);
    const [daoGovernance, setDaoGovernance]      = useState(null);
    const [treasuryBalance, setTreasuryBalance] = useState(0)

    const [account, setAccount] = useState(null)

    const [proposals, setProposals] = useState(null)
    const [quorum, setQuorum] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const loadBlockchainData = async () => {
        // Initiate provider, create ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)

        // Initiate DAO contract
        const dao = new ethers.Contract(config[31337].dao.address, DAO_ABI, provider)
        setDao(dao)
        console.log("Dao deployed to:", dao.address);

        // ✅ ERC-20 token                                                                  // ✅ 6th HW instruction
        const token = new ethers.Contract(config[31337].token.address, TOKEN_ABI, provider)
        setToken(token);

        //dao token //replace ABIs
        const daoToken = new ethers.Contract(config[31337].governanceDao.address, GOVERNANCETOKEN_ABI, provider)
        setDaoToken(daoToken); // 

        //dao governance //replace ABIs
        const daoGovernance = new ethers.Contract(config[31337].governanceToken.address, GOVERNANCEDAO_ABI, provider)
        setDaoGovernance(daoToken); // 





        // Fetch treasury balance
        let treasuryBalance = await provider.getBalance(dao.address)
        treasuryBalance = ethers.utils.formatUnits(treasuryBalance, 18)
        setTreasuryBalance(treasuryBalance)

        // Fetch accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)

        const count = await dao.proposalCount()
        const items = []

        for(var i = 0; i < count; i++) {
            // Fetch proposals
            const proposal = await dao.proposals(i + 1)
            items.push(proposal)
        }

        setProposals(items)

        setQuorum(await dao.quorum())

        setIsLoading(false)
    }

    useEffect(() => {
        if (isLoading) {
            loadBlockchainData()
        }  
    }, [isLoading, account] )

    return(
        <Container>
            <Navigation account={account}/>

            <h1 className='my-4 text-center'>Welcome to our DAO</h1>

            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <Create 
                        provider={provider}
                        dao={dao}
                        setIsLoading={setIsLoading}
                    />

                    <hr className="my-4 border border-primary border-2 opacity-20" />
                    
                    {/*<p className='text-center'><strong>Treasury Balance:</strong> {treasuryBalance} ETH</p> - in version without upvotes downvotes*/}   

                    {/* ✅ NEW: Show quorum */}
                    <p className='text-center'>
                    <strong>Treasury Balance:</strong> {treasuryBalance} ETH&nbsp;&nbsp;|&nbsp;&nbsp;
                    <strong>Quorum:</strong> {ethers.utils.formatUnits(quorum, 0)} votes
                    </p>
                    
                    <hr className="my-4 border border-primary border-2 opacity-20" />

                    <Proposals
                        provider={provider}
                        dao={dao}
                        token={token}               // ✅ 6th HW instruction
                        proposals={proposals}
                        quorum={quorum}
                        account={account}
                        daoToken={daoToken}
                        daoGovernance={daoGovernance}
                        setIsLoading={setIsLoading}
                    />
                </>
            )}
            
        </Container>
    )
}

export default App;
