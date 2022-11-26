import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  UInt64,
} from 'snarkyjs';
import { MixerZkApp,createNullifier,createCommitment } from './mixer';
import { DepositClass, NullifierClass } from './proof_system';
import { jest } from '@jest/globals';

let proofsEnabled = false;
function createLocalBlockchain() {
  const Local = Mina.LocalBlockchain({ proofsEnabled });
  Mina.setActiveInstance(Local);
  return Local.testAccounts[0].privateKey;
}

async function localDeploy(
  zkAppInstance: MixerZkApp,
  zkAppPrivatekey: PrivateKey,
  deployerAccount: PrivateKey
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    zkAppInstance.deploy({ zkappKey: zkAppPrivatekey });
    zkAppInstance.initState();
  });
  await txn.prove();
  txn.sign([zkAppPrivatekey]);
  await txn.send();
}
async function updateState(zkAppInstance: MixerZkApp,
    zkAppPrivatekey: PrivateKey,
    deployerAccount: PrivateKey,
    commitment:Field
    ){
    const txn = await Mina.transaction(deployerAccount, () => {
        zkAppInstance.updateMerkleTree(commitment);
      });
      await txn.prove();
      txn.sign([zkAppPrivatekey]);
      await txn.send();
}
describe('Mixer', () => {
  let deployerAccount: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey;

  beforeAll(async () => {
    await isReady;
    if (proofsEnabled) MixerZkApp.compile();
  });

  beforeEach(() => {
    deployerAccount = createLocalBlockchain();
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
  });

  afterAll(async () => {
    // `shutdown()` internally calls `process.exit()` which will exit the running Jest process early.
    // Specifying a timeout of 0 is a workaround to defer `shutdown()` until Jest is done running all tests.
    // This should be fixed with https://github.com/MinaProtocol/mina/issues/1094
    setTimeout(shutdown, 0);
  });

  //For each test I need to generate a local instance for MIna
  it('generates and deploys the `Mixer` smart contract, aldso', async () => {
    const zkAppInstance = new MixerZkApp(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    //It test that the state is being updated succesfuly
    const num = zkAppInstance.output.get();
    expect(num).toEqual(new UInt64(Field(0)));
  });

  describe('Merkle Tree State update', () => {
 it('Recieves a commitment,it must update the Merkle Tree Root and then emits a deposit event', async () => {
    const zkAppInstance = new MixerZkApp(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    let nullifier = await createNullifier(zkAppAddress);
    let secret = Field.random();
    let commitment = await createCommitment(nullifier, secret);
    let initialMerkleTreeRoot=zkAppInstance.merkleTreeRoot.get()
    let lastIndexAdded=zkAppInstance.lastIndexAdded.get()
    console.log('commitment => ',commitment.toString())
    await updateState(zkAppInstance, zkAppPrivateKey, deployerAccount,commitment)
    let updatedMerkleTree=zkAppInstance.merkleTreeRoot.get()
    let newIndex= new UInt64 (zkAppInstance.lastIndexAdded.get())
    console.log('LAST INDEX => ',newIndex)
    expect(newIndex).toEqual(new UInt64(lastIndexAdded.add(Field(1))))
  });
  });
  // it('correctly updates the output state on the `Vwap` smart contract when result is integer', async () => {
  //   const zkAppInstance = new Vwap(zkAppAddress);
  //   await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
  //   const txn = await Mina.transaction(deployerAccount, () => {
  //     const prices = new InputArray(
  //       padArrayEnd([Field(10_000_000), Field(10_000_000)])
  //     );
  //     const volumes = new InputArray(
  //       padArrayEnd([Field(25_000_000), Field(25_000_000)])
  //     );
  //     zkAppInstance.calculate(prices, volumes);
  //   });
  //   await txn.prove();
  //   await txn.send();

  //   const updatedNum = zkAppInstance.output.get();
  //   expect(updatedNum).toEqual(new UInt64(Field(10_000_000)));
  // });

  // it('correctly updates the output state on the `Vwap` smart contract when result is a rational number', async () => {
  //   const zkAppInstance = new Vwap(zkAppAddress);
  //   await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
  //   const txn = await Mina.transaction(deployerAccount, () => {
  //     const prices = new InputArray(
  //       padArrayEnd([Field(1_000_000), Field(10_000_000)])
  //     );
  //     const volumes = new InputArray(
  //       padArrayEnd([Field(1_000_000), Field(50_000_000)])
  //     );
  //     zkAppInstance.calculate(prices, volumes);
  //   });
  //   await txn.prove();
  //   await txn.send();

  //   const updatedNum = zkAppInstance.output.get();
  //   expect(updatedNum).toEqual(new UInt64(Field(9_823_529)));
  // });
});
