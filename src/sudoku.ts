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
  Circuit
} from 'snarkyjs';
import { tic, toc } from './tictoc';

export { deploy };

await isReady;

export const BOARD_WIDTH = 4;
// class Board extends CircuitValue {
//   @matrixProp(Field, BOARD_WIDTH, BOARD_WIDTH) value: Field[][];

//   constructor(value: number[][]) {
//     super();
//     this.value = value.map((row) => row.map(Field));
//   }

//   hash() {
//     return Poseidon.hash(this.value.flat());
//   }
// }
class MixerZkapp extends SmartContract {
  //state variables 
  @state(Field) commitment1 = State<Field>();
  @state(Field) commitment2 = State<Field>();

  @state(Field) hits1 = State<Field>();
  @state(Field) hits2 = State<Field>();

  @state(Field) guessX = State<Field>();
  @state(Field) guessY = State<Field>();

  @state(Field) turn = State<Field>();

  @method update(y: Field) {
    console.log('Just for compiling');
  }

}

// setup
const Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);
// a test account that pays all the fees, and puts additional funds into the zkapp
//For our Mixer case the HarpoFeePayer will be the HarpoAccount
let minadoFeePayer = Local.testAccounts[0].privateKey;
let minadoFeePayerAccount = minadoFeePayer.toPublicKey();

// ZK APP ACCOUNT 
  let zkappKey = PrivateKey.random();
  let zkappAddress = zkappKey.toPublicKey();
//This initial balance will fund our harpoFeePayer
let initialBalance = 10_000_000_000;

//TODO: ADD STATE INTERFACE
type Interface = {
  
  // getState(): { commitment1: string; commitment2: string, hits1: string, hits2: string, turn: string, guessX: string, guessY: string };
};
let isDeploying = null as null | Interface;

async function deploy() {
  if (isDeploying) return isDeploying;
  tic('compile');
  let { verificationKey } = await MixerZkapp.compile();
  console.log("VERIFICATION", verificationKey)
  toc();
//TODO ADD MERKLE TREE STATE VARIABLE 
  // let zkappInterface = {
  //   getState() {
  //     return getState(zkappAddress);
  //   },
  // };

  let zkapp = new MixerZkapp(zkappAddress);
  let tx = await Mina.transaction(minadoFeePayer, () => {
    AccountUpdate.fundNewAccount(minadoFeePayer,{initialBalance});
    zkapp.deploy({ zkappKey,verificationKey });
    console.log('Minado wallet funded succesfully');
  });
  await tx.send().wait();

  isDeploying = null;
  // return zkappInterface;
}

//TODO ADD INTEGRATION WITH ARURO WALLET

// Creating a user account that wants to use Harpo
//TODO Replace with real address coming from AurO;
let userAccountKey = PrivateKey.random();
let userAccountAddress = userAccountKey.toPublicKey();


/**
 * Deposit  Logic
 * 1. A Minado  account that will pay the gas feeds is funded DONE IN Deploy function
 * 2. A userAccount is  funded with the purpose of depositing into our harpoAccount.
 * Note: In a real implementation this would not happen as the account already has a balance
 * 3. A commitment needs to be created  C(0) = H(S(0),N(0))
 * 3.1 A Secret is created using Poseidon
 * 3.2 A Nullifier is created for avoiding double spending
 * 3.3 The Secret and the Nullifier is hashed and the commitment is created
 * 4. The Merkle path root must be verified.
 * 5. Add commitment to the Merkle Tree
 * 6. Send funds from useraccount to MerkleTree
 */
/**
 * 2. A userAccount is  funded with the purpose of depositing into our harpoAccount.
 * Note: Will not happen in a real implementation
 * TODO: Replace with Auro wallet Logic
 */

async function depositTestFunds () {
  let tx2 = await Mina.transaction(minadoFeePayer, () => {
    AccountUpdate.fundNewAccount(minadoFeePayer);
    let update = AccountUpdate.createSigned(minadoFeePayer);
    //The userAddress is funced
    update.send({ to: userAccountAddress, amount: 20 });
    console.log('User account wallet funded');
  });
  console.log('Second TX');
  await tx2.send();
  console.log('UserWallet funded succesfully');
}

function verifyAccountBalance (address:any) {
  let balance= Mina.getBalance(userAccountAddress);
  console.log(`Balance from ${address} = ${balance} MINA`)
  return balance; 
}
/**
 * 3. A commitment needs to be created  C(0) = H(S(0),N(0))
 */
 let nullifier = await createNullifier(userAccountAddress);
 let commitment = await createCommitment(nullifier);

 /**
 * Function to create Nullifier Nullifier: H ( Spending Key, rho )
 * Spending key: Public key
 * Rho: Private key
 */

async function createNullifier(publicKey: PublicKey) {
  let keyString = publicKey.toFields();
  let secretField = Field.random();
  let nullifierHash = Poseidon.hash([...keyString, secretField]);

  return nullifierHash;
}

/**
 * Function to create  the Commitment C(0) = H(S(0),N(0))
 */
 async function createCommitment(nullifier: any) {
  let secret = Field.random();
  let commitment = Poseidon.hash([nullifier, secret]);
  return commitment;
}

/**
 * After the commitment is added into the merkle Tree and the note is returned, the money should be send to the zkApp account
 * @param sender
 * @param amount
 */
 async function sendFundstoMixer(sender: PrivateKey, amount: any) {
  let tx = await Mina.transaction(minadoFeePayer, () => {
    // AccountUpdate.fundNewAccount(harpoFeePayer);
    let update = AccountUpdate.createSigned(sender);
    //The userAddress is funced
    update.send({ to: zkappAddress, amount: amount });
    console.log('Sendind Funds to  Harpo Wallet');
  });
  await tx.send();
}

//TODO ADD STATE VARIABLES 
// function getState(zkappAddress: PublicKey) {
//   let zkapp = new MixerZkapp(zkappAddress);
//   let commitment1 = fieldToHex(zkapp.commitment1.get());
//   let commitment2 = fieldToHex(zkapp.commitment2.get());
//   let hits1 = zkapp.hits1.get().toString();
//   let hits2 = zkapp.hits2.get().toString();
//   let turn = zkapp.turn.get().toString();
//   let guessX = zkapp.guessX.get().toString();
//   let guessY = zkapp.guessY.get().toString();

//   return { commitment1, commitment2, hits1, hits2, turn, guessX, guessY };
// }
