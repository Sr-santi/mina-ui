import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  UInt64,
  Poseidon,
} from 'snarkyjs';
import {
  createCommitment,
  createDeposit,
  createNullifier,
  deposit,
  generateNoteString,
  getAccountBalanceString,
  merkleTree,
  MixerZkApp,
  normalizeDepositEvents,
  parseNoteString,
  validateProof
} from './mixer';
import {
  MerkleWitness8
} from 'experimental-zkapp-offchain-storage';
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

async function updateState(
  zkAppInstance: MixerZkApp,
  zkAppPrivatekey: PrivateKey,
  deployerAccount: PrivateKey,
  commitment: Field
) {
  const txn = await Mina.transaction(deployerAccount, () => {
    zkAppInstance.updateMerkleTree(commitment);
  });
  await txn.prove();
  txn.sign([zkAppPrivatekey]);
  await txn.send();
}

async function sendFundsToMixer(
  senderAccount: PrivateKey,
  zkAppAddress: PublicKey,
  amount: any
) {
  const txn = await Mina.transaction(senderAccount, () => {
    let update = AccountUpdate.createSigned(senderAccount);
    update.send({ to: zkAppAddress, amount: amount });
  });
  await txn.prove();
  await txn.send();
}

async function getDepositEvents(zkapp: MixerZkApp) {
  let rawEvents = await zkapp.fetchEvents();
  let despositEvents = rawEvents.filter((a) => (a.type = `deposit`));
  let normalizedDepositEvents = normalizeDepositEvents(despositEvents);

  return normalizedDepositEvents;
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
    //TODO: Potential error here Error here
    setTimeout(shutdown, 30000);
  });

  it('generates and deploys the `Mixer` smart contract, also', async () => {
    const zkAppInstance = new MixerZkApp(zkAppAddress);
    await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
    //It test that the state is being updated succesfuly
    const num = zkAppInstance.output.get();
    expect(num).toEqual(new UInt64(Field(0)));
  });

  //Deposit logic tests
  describe('Deposit', () => {
    it('With a given object it generates a notestring in the correct format', async () => {
      let amount = 20;
      let nullifier = createNullifier(zkAppAddress);
      let secret = Field.random();

      const note = {
        currency: 'Mina',
        amount: new UInt64(amount),
        nullifier: nullifier,
        secret: secret,
      };
      const noteString = generateNoteString(note);
      const noteRegex =
        /Minado&(?<currency>\w+)&(?<amount>[\d.]+)&(?<nullifier>[0-9a-fA-F]+)%(?<secret>[0-9a-fA-F]+)&Minado/g;

      expect(noteString).toMatch(noteRegex);
    });

    it('With a given nullifier and secret it generates a commitment that is the poseidon hash of these two values', async () => {
      const nullifier = createNullifier(zkAppAddress);
      const secret = Field.random();
      const commitment = createCommitment(nullifier, secret);

      const expectedCommitment = Poseidon.hash([nullifier, secret]);

      expect( commitment ).toEqual( expectedCommitment );
    });

    describe('Merkle Tree State update', () => {
      it('Recieves a commitment,it must update the Merkle Tree Root, it must update the last index where a commitment was inserted, then it must emit a deposit event', async () => {
        const zkAppInstance = new MixerZkApp(zkAppAddress);
        await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
        let nullifier = createNullifier(zkAppAddress);
        let secret = Field.random();
        //TODO: We can add a test for the output of this function as well.
        let commitment = createCommitment(nullifier, secret);
        console.log('commitment=>>', commitment, toString());
        let initialMerkleTreeRoot = zkAppInstance.merkleTreeRoot.get();
        let lastIndexAdded = zkAppInstance.lastIndexAdded.get();
        let depositObject = {
          event: new DepositClass(commitment, lastIndexAdded, Field(2)),
          type: 'deposit',
        };
        await updateState(
          zkAppInstance,
          zkAppPrivateKey,
          deployerAccount,
          commitment
        );
        let updatedMerkleTreeRoot = zkAppInstance.merkleTreeRoot.get();
        let newIndex = new UInt64(zkAppInstance.lastIndexAdded.get());
        expect(newIndex).toEqual(new UInt64(lastIndexAdded.add(Field(1))));
        let events = await zkAppInstance.fetchEvents();
        let testArray = [];
        //TODO: CHnage to expect.containOnject
        testArray.push(depositObject);
        //The events should be in the deposit events
        expect(events).toEqual(expect.arrayContaining(testArray));
        //The merkle tree root should be different to the initail state
        expect(updatedMerkleTreeRoot.toString()).toEqual(
          expect.not.stringContaining(initialMerkleTreeRoot.toString())
        );
      });
    });
  });

  //Withdraw logic tests
  describe('Withdraw', () => {
    it('Takes a note, parse it and returns a deposit object in an expected format ', () => {
      let testingNote =
        'Minado&Mina&100&694070337045484131174875670050561624819435179753805616057744805525768806488%4724999261780669299422464210112568116127808857404186703382242819114614941792&Minado';
      const noteRegex =
        /Minado&(?<currency>\w+)&(?<amount>[\d.]+)&(?<nullifier>[0-9a-fA-F]+)%(?<secret>[0-9a-fA-F]+)&Minado/g;
      expect(testingNote).toMatch(noteRegex);
      let parsedNote = parseNoteString(testingNote);
      let expectedObject = {
        currency: 'Mina',
        amount: new UInt64(100),
        nullifier: new Field(
          '694070337045484131174875670050561624819435179753805616057744805525768806488'
        ),
        secret: new Field(
          '4724999261780669299422464210112568116127808857404186703382242819114614941792'
        ),
      };
      expect(parsedNote).toMatchObject(expectedObject);
    });

    describe('Create deposit object for withdraw', () => {
      it('With a given nullifier and secret it must create a deposit object with a specific structure', () => {
        const nullifier = createNullifier(zkAppAddress);
        const secret = Field.random();
        const commitment = createCommitment( nullifier, secret );

        const deposit = createDeposit( nullifier, secret );

        const expectedObjectStructure = {
          nullifier: nullifier,
          secret: secret,
          commitment: commitment
        }

        expect(deposit).toMatchObject(expectedObjectStructure);
        expect(deposit.commitment).toEqual(commitment);
      });
    });

    describe('Merkle proof verification in the smart contract', () => {
      it('With a given commitment and Merkle Proof it must validate a Merkle Path', async () => {
        const zkAppInstance = new MixerZkApp(zkAppAddress);
        await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
        
        const nullifier = createNullifier(zkAppAddress);
        const secret = Field.random();
        const commitment = createCommitment(nullifier, secret);

        await updateState(
          zkAppInstance,
          zkAppPrivateKey,
          deployerAccount,
          commitment
        );

        const merkleTreeWitness = merkleTree.getWitness(0n);
        const merkleProof = new MerkleWitness8(merkleTreeWitness);

        const zkAppMerkleRoot = zkAppInstance.merkleTreeRoot.get();
        const merkleProofRoot = merkleProof.calculateRoot(commitment);

        expect( zkAppMerkleRoot ).toEqual( merkleProofRoot );

        zkAppInstance.verifyMerkleProof(commitment, merkleProof);
      });

      it('With a wrong commitment and Merkle Witness it must reject the proof ', async () => {
        // Same structure as the previous test to operate over the same context

        const zkAppInstance = new MixerZkApp(zkAppAddress);
        await localDeploy(zkAppInstance, zkAppPrivateKey, deployerAccount);
        
        const nullifier = createNullifier(zkAppAddress);
        const secret = Field.random();
        const commitment = createCommitment(nullifier, secret);

        await updateState(
          zkAppInstance,
          zkAppPrivateKey,
          deployerAccount,
          commitment
        );

        const merkleTreeWitness = merkleTree.getWitness(0n);
        const merkleProof = new MerkleWitness8(merkleTreeWitness);

        const differentCommitment = createCommitment( nullifier, Field.random() )
        const zkAppMerkleRoot = zkAppInstance.merkleTreeRoot.get();
        const merkleProofRoot = merkleProof.calculateRoot(differentCommitment);
        
        expect( zkAppMerkleRoot ).not.toEqual( merkleProofRoot );

        let verifyMerkleProof = () => zkAppInstance.verifyMerkleProof(differentCommitment, merkleProof);
        expect( verifyMerkleProof ).toThrowError();
      });
    });
  });
});
