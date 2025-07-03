import Navbar from 'react-bootstrap/Navbar';

import logo from '../logo.png'

const Navigation = () => {
    return(
        <Navbar>
            <img
                alt="logo"
                src={logo}
                width="60"
                height="60"
                className="d-inline-block align-top mx-3"
            />
            <Navbar.Brand href="#">Tangle DAO Voting</Navbar.Brand>        
        </Navbar>
    )
}

export default Navigation;