import Contract from '@truffle/contract';

export const loadContrat = async (name, provider) => {
  const res = await fetch(`/contracts/${name}.json`);
  const Artifact = await res.json();
  const _contract = Contract(Artifact);
  _contract.setProvider(provider);
  const deployedContract = await _contract.deployed();

  return deployedContract;
};
