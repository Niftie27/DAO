import Navbar from 'react-bootstrap/Navbar';
import logo from '../logo.png';
import '../App.css';

const Navigation = ({ account }) => {
    return(
        <Navbar>
            
            <img
                alt="logo"
                src={logo}
                width="80"
                height="80"
                className="d-inline-block align-top mx-4"
            />
            <Navbar.Brand href="#">Tangle DAO Voting</Navbar.Brand>
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                            {account ? (
                                <div className="button">{account.slice(0, 5) + '...' + account.slice(38, 42)}</div>
                            ) : (
                                <button className="button">Connect</button>
                            )}
                        </Navbar.Text>
                    </Navbar.Collapse>


        </Navbar>
    )
}

export default Navigation;
