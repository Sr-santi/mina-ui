import {
  matrixProp,
  CircuitValue,
  Field,
  SmartContract,
  PublicKey,
  method,
  PrivateKey,
  Mina,
  state,
  State,
  isReady,
  Poseidon,
  AccountUpdate,
  Bool,
  Experimental,
  Circuit,
  DeployArgs,
  Permissions,
  UInt64,
  Int64,
  MerkleTree,
  Signature,
} from 'snarkyjs';
import {
  OffChainStorage,
  MerkleWitness8,
} from 'experimental-zkapp-offchain-storage';
import DepositClass from './proof_system/models/DepositClass.js';
import NullifierClass from './proof_system/models/NullifierClass.js';
import { Events } from 'snarkyjs/dist/node/lib/account_update.js';
// import fs from 'fs';
// import XMLHttpRequestTs, { XMLHttpRequest } from 'xmlhttprequest-ts';
// const NodeXMLHttpRequest =XMLHttpRequestTs.XMLHttpRequest as any as typeof XMLHttpRequest
// export { deploy };

await isReady;
export {
  deploy,
  depositTestFunds,
  deposit,
  getAccountBalance,
  getAccountBalanceString,
  returnAddresses,
  withdraw,
};

type Witness = { isLeft: boolean; sibling: Field }[];

const MerkleTreeHeight = 8;
/** Merkle Tree
 * Instance for global reference. It must be stored off-chain.
 */
const MerkleTreeInit = MerkleTree;
const merkleTree = new MerkleTreeInit(MerkleTreeHeight);
// class MerkleWitness extends MerkleWitness(MerkleTreeHeight) {}
//
let initialIndex: Field = new Field(0n);
function normalizeNullifier(nullifierEvent: any) {
  let newEvents = [];
  for (let i = 0; i < nullifierEvent.length; i++) {
    let element = nullifierEvent[i].event;
    let eventsNormalized = element.toFields(element);
    //TODO:CHeck if we want this as string
    let object = {
      nullifier: eventsNormalized[0],
      timeStamp: Field,
    };
    newEvents.push(object);
  }
  return newEvents;
}
export class MixerZkApp extends SmartContract {
  //state variables
  @state(Field) x = State<Field>();
  // @state(Field) merkleTreeVariable = State<MerkleTree>();
  @state(Field) merkleTreeRoot = State<Field>();
  @state(Field) lastIndexAdded = State<Field>();
  //State variables offchain storage
  @state(PublicKey) storageServerPublicKey = State<PublicKey>();
  @state(Field) storageNumber = State<Field>();
  @state(Field) storageTreeRoot = State<Field>();

  events = {
    deposit: DepositClass,
    nullifier: NullifierClass,
  };

  async deploy(args: DeployArgs) {
    super.deploy(args);
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
      send: Permissions.proofOrSignature(),
    });
    // let serverPublicKey = await offChainStorageSetup()
    //TODO: Check the functionality of this line
    this.lastIndexAdded.set(initialIndex);
  }
  @method initState() {
    
    const merkleTreeRoot = merkleTree.getRoot();
    // this.storageServerPublicKey.set();
    //Setting the state of the Merkle Tree
    //TODO: DELETE
    this.merkleTreeRoot.set(merkleTreeRoot);
    const emptyTreeRoot = new MerkleTree(8).getRoot();
    this.storageTreeRoot.set(emptyTreeRoot);
    //Used to make sure that we are storing states
    this.storageNumber.set(Field.zero);
  }
  //
  //TODO:  Verify Merke Tree before inserting a commitment
  @method updateMerkleTree(commitment: Field) {
    

    /**
     * Getting Merkle Tree State in the contract
     */
    let merkleTreeRoot = this.merkleTreeRoot.get();
    this.merkleTreeRoot.assertEquals(merkleTreeRoot);
    let lastIndex = this.lastIndexAdded.get();
    this.lastIndexAdded.assertEquals(lastIndex);
    let lastIndexFormated = lastIndex.toBigInt();

    //Modifying the Merkle Tree, inserting the commitment

    merkleTree.setLeaf(lastIndexFormated, commitment);
    let newMerkleTree = merkleTree;
    let newMerkleTreeRoot = newMerkleTree.getRoot();
    //Validating that the root is valid
    newMerkleTreeRoot.assertEquals(newMerkleTree.getRoot());

    //Updating the Merkle Tree root
    this.merkleTreeRoot.set(newMerkleTreeRoot);

    // Updating the index variable
    let newIndex = lastIndex.add(new Field(1));
    
    newIndex.assertEquals(lastIndex.add(new Field(1)));
    this.lastIndexAdded.set(newIndex);

    //Emiting a deposit event
    
    let deposit= new DepositClass (commitment,lastIndex,Field(2))
    this.emitEvent('deposit', deposit);
    
    

    // this.emitNullifierEvent(Field(1))
  }
  @method updateOffchain(
    leafIsEmpty: Bool,
    oldLeaf: Field,
    commitment: Field,
    path: MerkleWitness8,
    storedNewRootNumber: Field,
    storedNewRootSignature: Signature
  ) {
    //Get the state of the contract
    const storedRoot = this.storageTreeRoot.get();
    this.storageTreeRoot.assertEquals(storedRoot);
    
    let storedNumber = this.storageNumber.get();
    this.storageNumber.assertEquals(storedNumber);

    let storageServerPublicKey = this.storageServerPublicKey.get();
    this.storageServerPublicKey.assertEquals(storageServerPublicKey);
    

    //Check that the new leaf is greated than the old leaf
    let leaf = [oldLeaf];
    let newLeaf = [commitment];

    const updates = [
      {
        leaf,
        leafIsEmpty,
        newLeaf,
        newLeafIsEmpty: Bool(false),
        leafWitness: path,
      },
    ];
    //Fucntion to verify that the update really came from the existing

    const storedNewRoot = OffChainStorage.assertRootUpdateValid(
      storageServerPublicKey,
      storedNumber,
      storedRoot,
      updates,
      storedNewRootNumber,
      storedNewRootSignature
    );

    this.storageTreeRoot.set(storedNewRoot);
    this.storageNumber.set(storedNewRootNumber);

  }
  /**
   * Verification Method for Merkle Tree
   */
  @method verifyMerkleProof(commitment: Field, merkleProof: MerkleWitness8) {
    let witnessMerkleRoot = merkleProof.calculateRoot(commitment);
    
    //TODO: SHOULD COMO OFF-CHAIN
    let stateMerkleTreeRoot = this.merkleTreeRoot.get();
    this.merkleTreeRoot.assertEquals( stateMerkleTreeRoot );

    witnessMerkleRoot.assertEquals( stateMerkleTreeRoot );
  }
  @method emitNullifierEvent(nullifierHash: Field) {
    let nullifierEvent = {
      nullifier: nullifierHash,
      timeStamp: Field(1),
    };
    //TODO: BUG HERE
    this.emitEvent('nullifier', nullifierEvent);
    
  }
  @method async verifyNullifier(nullifier: Field) {
    
    // let rawEvents = await this.fetchEvents();
    // let nullifierEvents =  rawEvents.filter((a) => (a.type = `nullifier`));
    // 
    // let normalizedNullifierEvents =normalizeNullifier(nullifierEvents);
    // 
    // 
    //Search for an event with a given commitment
    // let eventWithNullifier = normalizedNullifierEvents.find(
    // (e) => e.nullifier.toString() === nullifier.toString()
    // );
    // 
  }
}

// setup
const Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);
const storageServerAddress = 'http://localhost:3001';
// const serverPublicKey = await OffChainStorage.getPublicKey(
//   storageServerAddress,
//   NodeXMLHttpRequest
// );
// a test account that pays all the fees, and puts additional funds into the zkapp
//For our Mixer case the minadoFeePayer will be the HarpoAccount
let minadoFeePayer = Local.testAccounts[0].privateKey;
let minadoFeePayerAccount = minadoFeePayer.toPublicKey();

// ZK APP ACCOUNT
let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();
let zkapp = new MixerZkApp(zkappAddress);
//This initial balance will fund our minadoFeePayer
// let initialBalance = 10_000_001;

//TODO: ADD STATE INTERFACE IF NECESSARY
type Interface = {
  // getState(): { commitment1: string; commitment2: string, hits1: string, hits2: string, turn: string, guessX: string, guessY: string };
};
async function deploy() {
  
  let tx = await Mina.transaction(minadoFeePayer, () => {
    AccountUpdate.fundNewAccount(minadoFeePayer);
    zkapp.deploy({ zkappKey: zkappKey });
    zkapp.initState();
    zkapp.sign(zkappKey);
    
  });
  await tx.send();
}
//todo: Off-chain storage
// async function offChainStorageSetup() {
// Connecting to the server
// }
// async function updateMerkleTreeOffchain(commitment: Field) {
//   //Get the root of the Merkle Tree
//   // get the existing tree
//   /**
//    * TODO: CHANGE FOR REAL LAST INDEX WHEN REFACTOR IS COMPLETED
//    */
//   //  let index =zkapp.lastIndexAdded.get()
//   //  zkapp.lastIndexAdded.assertEquals(index);
//   const index = BigInt(Math.floor(Math.random() * 4));
//   
//   const treeRoot = await zkapp.storageTreeRoot.get();
//   const idx2fields = await OffChainStorage.get(
//     storageServerAddress,
//     zkappAddress,
//     MerkleTreeHeight,
//     treeRoot,
//     NodeXMLHttpRequest
//   );
//   // RECONSTRUCTING THE TREE
//   const tree = OffChainStorage.mapToTree(MerkleTreeHeight, idx2fields);
//   //Crearing the merkle witness
//   //TODO: Turn leaf index into a BigInt
//   const leafWitness = new MerkleWitness8(tree.getWitness(index));

//   // get the previopus commitment
//   const priorCommitmentInLeaf = !idx2fields.has(index);
//   let priorCommitment: Field;
//   //TODO:CHECK THIS LOGIC
//   if (!priorCommitmentInLeaf) {
//     priorCommitment = idx2fields.get(index)![0];
//     //Change for new commitment
//   } else {
//     priorCommitment = Field.zero;
//   }
//   // update the leaf, and save it in the storage server
//   idx2fields.set(index, [commitment]);
//   const [storedNewStorageNumber, storedNewStorageSignature] =
//     await OffChainStorage.requestStore(
//       storageServerAddress,
//       zkappAddress,
//       MerkleTreeHeight,
//       idx2fields,
//       NodeXMLHttpRequest
//     );
//   
//   
//     'changing index',
//     index,
//     'from',
//     priorCommitment.toString(),
//     'to',
//     commitment.toString()
//   );
//   
//   //update the smart contract
//   let transaction = await Mina.transaction(minadoFeePayer, () => {
//     zkapp.updateOffchain(
//       Bool(priorCommitmentInLeaf),
//       priorCommitment,
//       commitment,
//       leafWitness,
//       storedNewStorageNumber,
//       storedNewStorageSignature
//     );
//     zkapp.sign(zkappKey);
//   });
//   await transaction.send();

//   let postIntertionRoot = zkapp.storageTreeRoot.get();
//   zkapp.storageTreeRoot.assertEquals(postIntertionRoot);
//   
//     'OFF-CHAIN ROOT POST IMPLEMENTATION',
//     postIntertionRoot.toString()
//   );
// }
async function returnAddresses() {
  let object = {
    user: userAccountAddress,
    zkapp: zkappAddress,
    feePayer: minadoFeePayerAccount,
  };
  return object;
}
//   'Initial state of the merkle tree =>>',
//   zkapp.merkleTreeRoot.get().toString()
// );

//TODO ADD INTEGRATION WITH ARURO WALLET

// Creating a user account that wants to use Harpo
//TODO Replace with real address coming from AurO;
let userAccountKey = PrivateKey.random();
let userAccountAddress = userAccountKey.toPublicKey();

/**
 * Deposit  Logic
 * 1. A Minado  account that will pay the gas fees is funded DONE IN Deploy function
 * 2. A userAccount is  funded with the purpose of depositing into our harpoAccount.
 * Note: In a real implementation this would not happen as the account already has a balance
 * 3. A commitment needs to be created  C(0) = H(S(0),N(0))
 * 3.1 A Secret is created using Poseidon
 * 3.2 A Nullifier is created for avoiding double spending
 * 3.3 The Secret and the Nullifier is hashed and the commitment is created
 * 4. A note needs to be created
 *
 * 4.1 The first function will be generateNote(currency, ammount, deposit), which will return an object note={currency : currency, deposit: deposit, ammount:ammount}
 * 4.2 Generate not String = Turn note object into string [concataniting strings]
 * 4.3 Recieves notString and parses an object note
 *
 * 4. The Merkle path root must be verified.
 * 5. Add commitment to the Merkle Tree
 * 6. Send funds from useraccount to MerkleTree
 */
/**
 * 2. A userAccount is  funded with the purpose of depositing into our harpoAccount.
 * Note: Will not happen in a real implementation
 * TODO: Replace with Auro wallet Logic
 */
async function deposit(amount: Number) {
  //TODO: Should this be INT or UINT?
  // zkapp.updateMerkleTree(Field(9))
  /**
   * 2. A userAccount is  funded with the purpose of depositing into our harpoAccount.
   */
  // await depositTestFunds();
  let initialBalanceUser = getAccountBalance(userAccountAddress).toString();
  let initialBalanceZkApp = getAccountBalance(zkappAddress).toString();
  let initialBalanceFeePayer = getAccountBalance(
    minadoFeePayerAccount
  ).toString();
  
  
  
  /**
   * 3. A commitment needs to be created  C(0) = H(S(0),N(0))
   */
  let nullifier = await createNullifier(userAccountAddress);
  let secret = Field.random();
  let commitment = await createCommitment(nullifier, secret);
  
  
  
  
  //TODO: DELETE
  // await emitNullifierEvent(Field(1));
  await updateMerkleTree(commitment);
  await sendFundstoMixer(userAccountKey, amount);
  const note = {
    currency: 'Mina',
    amount: new UInt64(amount),
    nullifier: nullifier,
    secret: secret,
  };

  const noteString = generateNoteString(note);
  let finalBalanceUser = getAccountBalance(userAccountAddress).toString();
  let finalBalanceZkApp = getAccountBalance(zkappAddress).toString();
  let finalBalanceFeePayer = getAccountBalance(
    minadoFeePayerAccount
  ).toString();
  
  
  
  // await emitNullifierEvent(Field(1))
  return noteString;
}
//TODO: Change type
function normalizeDepositEvents(depositEvent: any) {
  let newEvents = [];
  for (let i = 0; i < depositEvent.length; i++) {
    let element = depositEvent[i].event;
    //**BUG HERE */
    let eventsNormalized = element.toFields(null);
    //TODO:CHeck if we want this as string
    let object = {
      commitment: eventsNormalized[0],
      leafIndex: eventsNormalized[1]?.toString(),
      timeStamp: eventsNormalized[2]?.toString(),
    };
    newEvents.push(object);
  }
  return newEvents;
}
//TODO: Check why when sending more 100 mina is causing an overflow
//Overflow happens if there is not enough money to cover the gas fees.
async function depositTestFunds() {
  let tx2 = await Mina.transaction(minadoFeePayer, () => {
    AccountUpdate.fundNewAccount(minadoFeePayer);
    let update = AccountUpdate.createSigned(minadoFeePayer);
    update.send({ to: userAccountAddress, amount: 1000 });
    
  });
  
  await tx2.send();
  
}

async function updateMerkleTree(commitment: Field) {
  let tx3 = await Mina.transaction(minadoFeePayer, () => {
    zkapp.updateMerkleTree(commitment);
    zkapp.sign(zkappKey);
  });
  await tx3.send();
  const rawMerkleTree = zkapp.merkleTreeRoot.get().toString();
  
  const newIndex = zkapp.lastIndexAdded.get().toBigInt();
  
}
async function emitNullifierEvent(nullifierHash: Field) {
  let tx3 = await Mina.transaction(minadoFeePayer, () => {
    zkapp.emitNullifierEvent(nullifierHash);
    zkapp.sign(zkappKey);
  });
  await tx3.send();
}

function getAccountBalance(address: any) {
  return Mina.getBalance(address);
}

function getAccountBalanceString(address: any) {
  return Mina.getBalance(address).toString();
}

/**
 * Function to create Nullifier Nullifier: H ( Spending Key, rho )
 * Spending key: Public key
 * Rho: Private key
 */

async function createNullifier(publicKey: PublicKey) {
  let keyString = publicKey.toFields();
  let secret = Field.random();
  if (secret.toString().trim().length !== 77) {
    secret = Field.random();
  }
  //TODO: DELETE
  
  //TODO: Sometimes this has is a lenght sometimes is another one
  let nullifierHash = Poseidon.hash([...keyString, secret]);
  
  return nullifierHash;
}

/**
 * Function to create  the Commitment C(0) = H(S(0),N(0))
 */
function createCommitment(nullifier: Field, secret: Field) {
  return Poseidon.hash([nullifier, secret]);
}

/**
 * After the commitment is added into the merkle Tree and the note is returned, the money should be send to the zkApp account
 * @param sender
 * @param amount
 */
async function sendFundstoMixer(sender: PrivateKey, amount: any) {
  let tx = await Mina.transaction(sender, () => {
    let update = AccountUpdate.createSigned(sender);
    //The userAddress is funced
    update.send({ to: zkappAddress, amount: amount });
    
    //Parece que la zkapp no puede recibir fondos
  });
  await tx.send();
}
/*
Currency, amount, netID, note => deposit(secret, nullifier)
*/
type Deposit = {
  nullifier: Field;
  secret: Field;
  commitment: Field;
};

type Note = {
  currency: string;
  amount: UInt64;
  nullifier: Field;
  secret: Field;
};
function createDeposit(nullifier: Field, secret: Field): Deposit {
  let deposit = {
    nullifier,
    secret,
    commitment: createCommitment(nullifier, secret),
  };

  return deposit;
}

function generateNoteString(note: Note): string {
  return `Minado&${note.currency}&${note.amount}&${note.nullifier}%${note.secret}&Minado`;
}

function parseNoteString(noteString: string): Note {
  const noteRegex =
    /Minado&(?<currency>\w+)&(?<amount>[\d.]+)&(?<nullifier>[0-9a-fA-F]+)%(?<secret>[0-9a-fA-F]+)&Minado/g;
  const match = noteRegex.exec(noteString);

  if (!match) {
    throw new Error('The note has invalid format');
  }

  return {
    currency: match.groups?.currency!,
    amount: new UInt64(Number(match.groups?.amount)),
    nullifier: new Field(match.groups?.nullifier!),
    secret: new Field(match.groups?.secret!),
  };
}
/**
 * 
 * Withdraw and Merkle Tree implementation 
 * 
 1. Parse note given by the user, validate the note, the address and create a deposit from it. 
 2. Generate Merkle Proof from deposit.  
 3. Validate Merkle Proof and nullifier.Fetch Nullifier events. 
 4. A nullifier event should be created in the moment of withdraw to avoid double spending. 
 */
async function withdraw(noteString: string) {
    try{
      /**Note is parsed */
      let parsedNote = parseNoteString(noteString);
      
      let deposit = createDeposit(parsedNote.nullifier, parsedNote.secret);
      /**Verofy the Merkle Path */
      await validateProof(deposit);
      let ammount =parsedNote.amount.value
      
      
      
      // zkapp.emitNullifierEvent(Field(1))
      // let getEventsNullifier = await zkapp.fetchEvents()
      // 
      /**Verify Nullifier */
      // let nullifier = Field(1);
      // zkapp.verifyNullifier(nullifier);
      /**Withdraw funds and emit nullifier event */
      
      
      
      
      await withdrawFunds(userAccountAddress,ammount)
    }
    catch (e){
      console.error(e
      )
      return "error"
    }
   
}
//TODO: Review these functions.
/**
 *
 * @param deposit Created from a note
 * Should return a Merkle Proof that will be validated by the smart contract
 */
async function validateProof(deposit: Deposit) {
  /**
   * Merkle Tree Validation.
   */
  //Find the commitment in the events
  
  let depositEvents = await getDepositEvents();
  //TODO: LEAVE AS FIELD IF NECCESARY
  // 
  let commitmentDeposit = deposit.commitment;
  //TODO PUT AMMOUNT INTO A VARIABLE

  //Search for an event with a given commitment
  let eventWithCommitment = depositEvents.find(
    (e) => e.commitment.toString() === commitmentDeposit.toString()
  );
  
  //TODO: Change this
  let leafIndex = eventWithCommitment?.leafIndex;
  //TODO: Add validations of the event

  let merkleTreeWitness = merkleTree.getWitness(BigInt(leafIndex));
  let merkleWitness = new MerkleWitness8(merkleTreeWitness);
  

  try {
    zkapp.verifyMerkleProof(eventWithCommitment?.commitment, merkleWitness);
    
  } catch (e) {
    
    
  }
  //TODO: ADD basic catch erros returns to link it with the front-end
  return true;
  //Verifying the nullifier
}
async function getDepositEvents() {
  let rawEvents = await zkapp.fetchEvents();
  let despositEvents = (await rawEvents).filter((a) => (a.type = `deposit`));
  
  let normalizedDepositEvents = normalizeDepositEvents(despositEvents);
  return normalizedDepositEvents;
}
async function getNullifierEvents() {
  let rawEvents = await zkapp.fetchEvents();
  return rawEvents.filter((a) => (a.type = `nullifier`));
}
async function isSpend(nullifier: any) {
  let nullfierEvents = getNullifierEvents();
  
}
async function initTest() {
  let noteString = await deposit(100);
  
  withdraw(noteString);
  
}
async function withdrawFunds(reciever: PublicKey, amount: any) {
  let tx = await Mina.transaction(zkappKey, () => {
    let update = AccountUpdate.createSigned(zkappKey);
    //The userAddress is funced
    update.send({ to: reciever, amount: amount });
    
    //Parece que la zkapp no puede recibir fondos
  });
  await tx.send();
  
  // 
}

// initTest();
