import Web3 from 'web3';
import './App.css';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContrat } from './utils/load-contract';
import { useEffect, useState, useCallback } from 'react';
function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contrat: null
  });
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [shouldReload, reload] = useState(false);

  const reloadEffect = useCallback(() => reload(!shouldReload), [shouldReload]);

  const setAccountListener = (provider) => {
    provider.on('accountsChanged', (accounts) => setAccount(accounts[0]));
  };

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      const contract = await loadContrat('Faucet', provider);

      if (provider) {
        setAccountListener(provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        });
      } else {
        console.error('Please, install Metamask.');
      }
    };
    loadProvider();
  }, []);

  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };
    web3Api.web3 && getAccounts();
  }, [web3Api.web3]);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);

      setBalance(web3.utils.fromWei(balance, 'ether'));
    };
    web3Api.contract && loadBalance();
  }, [web3Api, shouldReload]);

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api;
    await contract.addFunds({
      from: account,
      // to: contract.address,
      value: web3.utils.toWei('1', 'ether')
    });
    reloadEffect();
  }, [web3Api, account, reloadEffect]);

  const withDraw = useCallback(async () => {
    const { contract, web3 } = web3Api;
    const withdrawAmount = web3.utils.toWei('0.1', 'ether');
    await contract.withdraw(withdrawAmount, {
      from: account
    });
    reloadEffect();
  }, [web3Api, account, reloadEffect]);

  return (
    <>
      <div className='faucet-wrapper'>
        <div className='faucet'>
          <div className='is-flex is-align-items-center'>
            <span>
              <strong className='mr-2'>Account: </strong>
            </span>
            {account ? (
              <div>{account}</div>
            ) : (
              <button
                className='button is-small'
                onClick={() =>
                  web3Api.provider.request({ method: 'eth_requestAccounts' })
                }
              >
                Connect Wallet
              </button>
            )}
          </div>
          <div className='balance-view is)-size-2 my-4'>
            Current Balance: <strong>{balance}</strong> ETH
          </div>

          <button className='button is-link mr-2' onClick={addFunds}>
            Donate 1 ETH
          </button>
          <button className='button is-primary' onClick={withDraw}>
            Withdraw
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
