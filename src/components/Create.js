import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';

const Create = ({ provider, dao, setIsLoading }) => {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('0')
  const [address, setAddress] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [description, setDescription] = useState('')


  const createHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    try {
      const signer = await provider.getSigner()
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether')
      
      const transaction = await dao.connect(signer).createProposal(name, formattedAmount, address, description)
      await transaction.wait()
    } catch {
      window.alert('User rejected or tx reverted')
    }

      setIsLoading(true)
  }


  return(
    <Form onSubmit={createHandler}>
      <Form.Group style={{ maxWidth: '450px', margin: '20px auto 50px auto' }} >
        <h4 className="mb-3 text-start">Create proposal</h4>

        <Form.Control
          className="my-1"
          type='text'
          placeholder="Enter name"
          onChange={(e) => setName(e.target.value)}
        />
        <Form.Control
          className="my-1"
          type='number'
          placeholder="Enter amount"
          onChange={(e) => setAmount(e.target.value)}
        />
        <Form.Control
          className="my-1"
          type='text'
          placeholder="Enter recipient"
          onChange={(e) => setAddress(e.target.value)}
        />
        <Form.Control
          className="my-1"
          type='text'
          placeholder="Enter description"
          onChange={(e) => setDescription(e.target.value)}
        />
        {isWaiting ? (
          <Spinner animation="border" style= {{ display: 'block', margin: '0 auto' }}/>
        ) : (
          <Button variant="success" type="submit" style={{ width: '100%' }}>
            Create
          </Button>
        )}

      </Form.Group>
    </Form>

  )

}

export default Create;

