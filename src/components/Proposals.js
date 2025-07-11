import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { ethers, BigNumber } from 'ethers';                       // ✅ removed BigNumber
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

// props: add `account`
const Proposals = ({ provider, dao, token, proposals, quorum, account, setIsLoading }) => { // Something is missing here, look at TIMELINE
  /* ---------------- state: did this wallet already vote? ---------------- */
  const [voted, setVoted] = useState({});               // { [proposalId]: true|false }
  const [balances, setBalances] = useState({});         // ✅ live ETH recipient balances
  const [decimals, setDecimals] = useState(18);         // ✅ ERC-20 decimals
  const [symbol, setSymbol] = useState('token');        // ✅ ERC-20 symbol

  /* ---------- load token metadata once ---------- */
  useEffect(() => {                                      // ✅
    if (!token) return;
    (async () => {
      setDecimals(await token.decimals());
      setSymbol(await token.symbol());
    })();
  }, [token]);

  /* ---------- who already voted? ---------- */
  useEffect(() => {
    if (!dao || !account) return;    // ✅ minimal guard                   // ✅ tighter guard - if (!dao || !account || !proposals.length) return; - this is somehow proper version
    (async () => {
      const map = {};
      for (const { id } of proposals) {
        map[id.toString()] = await dao.hasVoted(account, id);         // ✅ on‑chain check
      }
      setVoted(map);
    })();
  }, [dao, account, proposals]);

  /* ---------- load each recipient's ETH balance ---------- */
  useEffect(() => {                                      // ✅
    if (!token) return;
    (async () => {
      const map = {};
      for (const { recipient } of proposals) {                
        if (!map[recipient]) {                                  // avoid duplicate RPC calls
          map[recipient] = await token.balanceOf(recipient);    // fetch balance
        }
      }
      setBalances(map);
    })();
  }, [token, proposals]);

  /* ------------ Helpers ------------ */
  const toNum = (v) => (BigNumber.isBigNumber(v) ? Number(ethers.utils.formatUnits(v, 0)) : 0); // ✅ BN‑to‑number

  const voteHandler = async (id, support) => {
    try {
      const signer = await provider.getSigner();
      await (await dao.connect(signer).vote(id, support)).wait(); // two-arg vote           // before - const tx = await dao.connect(signer).vote(id, support);
    } catch {
      window.alert('User rejected or tx reverted');
    }
    setIsLoading(true);
  };

  const finalizeHandler = async (id) => {
    try {
      const signer = await provider.getSigner();
      await (await dao.connect(signer).finalizeProposal(id)).wait();
    } catch {
      window.alert('User rejected or tx reverted');
    }
    setIsLoading(true);
  };

  /* ------------ UI ------------ */
  return (
    <Table striped bordered hover responsive className="table-dark text-center align-middle">
      <thead>
        <tr>
          <th>#</th>
          <th>Proposal Name</th>
          <th>Description</th>
          <th>Recipient Address</th>
          <th>Recipient Balance (DAPP)</th>               {/* ✅ new header */}
          <th>Amount ({symbol})</th>                     {/* ✅ header */}
          <th>Status</th>
          <th>Up / Down</th>
          <th>Cast Vote</th>
          <th>Finalize</th>
        </tr>
      </thead>

      <tbody>
        {proposals.map((p, i) => (
          <tr key={i}>
            <td>{p.id.toString()}</td>
            <td>{p.name}</td>
            <td>{p.description}</td>
            <td>{p.recipient}</td>
            <td>                                           {/* ✅ show live balance */}
              {balances[p.recipient]
                ? Number(ethers.utils.formatEther(balances[p.recipient])).toFixed(4)
                : '…'}
            </td>

            {/* ✅ proposal amount in token units */}
            <td>{ethers.utils.formatUnits(p.amount, decimals)} {symbol}</td>
            <td>{p.finalized ? 'Approved' : 'In Progress'}</td>

            {/* vote counts */}
            <td>
              <FaArrowUp size={12} className="me-1 text-success" />
              {ethers.utils.formatUnits(p.upvotes || 0, 0)}
              <span className="mx-1">/</span>
              <FaArrowDown size={12} className="me-1 text-danger" />
              {ethers.utils.formatUnits(p.downvotes || 0, 0)}
            </td>

            {/* ---------- CAST VOTE BUTTONS ---------- */}
            <td className="text-center align-middle">
              {!p.finalized && !voted[p.id] && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm me-1"
                    onClick={() => voteHandler(p.id, true)}
                  >
                    <FaArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => voteHandler(p.id, false)}
                  >
                    <FaArrowDown size={16} />
                  </button>
                </>
              )}
            </td>

            {/* finalize */}
            <td>
              {!p.finalized && Number(p.upvotes) > Number(quorum) && (
                <Button
                  variant="success"
                  style={{ width: '100%' }}
                  onClick={() => finalizeHandler(p.id)}
                >
                  Finalize
                </Button>
              )}
            </td>
          </tr>
        ))}                                              {/* ✅ map closes cleanly */}
      </tbody>
    </Table>
  );
};

export default Proposals;
