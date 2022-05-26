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
  const [isProviderLoaded, setProviderLoaded] = useState(false);
  const [balance, setBalance] = useState(null);
  const [shouldReload, reload] = useState(false);

  const canConnectToContract = account && web3Api.contract;

  const reloadEffect = useCallback(() => reload(!shouldReload), [shouldReload]);

  const setAccountListener = (provider) => {
    // provider.on('accountsChanged', (accounts) => setAccount(accounts[0]));
    provider.on('accountsChanged', (_) => window.location.reload());
    provider.on('chainChanged', (_) => window.location.reload());
  };

  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();

      if (provider) {
        const contract = await loadContrat('Faucet', provider);
        setAccountListener(provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        });
        setProviderLoaded(true);
      } else {
        setWeb3Api({
          ...web3Api
        });
        setProviderLoaded(true);
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
          {isProviderLoaded ? (
            <div className='is-flex is-align-items-center'>
              <span>
                <strong className='mr-2'>Account: </strong>
              </span>
              {account ? (
                <div>{account}</div>
              ) : !web3Api.provider ? (
                <>
                  <div className='notification is-warning is-size-6 is-rounded'>
                    Wallet is not detected!{` `}
                    <a target='_blank' href='https://docs.metamask.io'>
                      Install Metamask
                    </a>
                  </div>
                </>
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
          ) : (
            <span>Looking for Web3...</span>
          )}
          <div className='balance-view is-size-2 my-4'>
            Current Balance: <strong>{balance}</strong> ETH
          </div>
          {!canConnectToContract && (
            <i className='is-block'>Connect to Ganache</i>
          )}
          <button
            disabled={!canConnectToContract}
            onClick={addFunds}
            className='button is-link mr-2'
          >
            Donate 1eth
          </button>
          <button
            disabled={!canConnectToContract}
            onClick={withDraw}
            className='button is-primary'
          >
            Withdraw
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
