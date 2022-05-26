import Contract from '@truffle/contract';

export const loadContrat = async (name, provider) => {
  const res = await fetch(`/contracts/${name}.json`);
  const Artifact = await res.json();
  const _contract = Contract(Artifact);
  _contract.setProvider(provider);
  let deployedContract = null;
  try {
    deployedContract = await _contract.deployed();
  } catch {
    console.error('You are connected to the wrong network');
  }

  return deployedContract;
};
