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



class MixerZkapp extends SmartContract {
  //state variables 
  @state(Field) commitment1 = State<Field>();
  @state(Field) commitment2 = State<Field>();

  @state(Field) hits1 = State<Field>();
  @state(Field) hits2 = State<Field>();

  @state(Field) guessX = State<Field>();
  @state(Field) guessY = State<Field>();

  @state(Field) turn = State<Field>();

}

// setup
const Local = Mina.LocalBlockchain();
Mina.setActiveInstance(Local);
let feePayer = Local.testAccounts[0].privateKey;

//TODO: ADD STATE INTERFACE
type Interface = {
  
  // getState(): { commitment1: string; commitment2: string, hits1: string, hits2: string, turn: string, guessX: string, guessY: string };
};
let isDeploying = null as null | Interface;

async function deploy() {
  if (isDeploying) return isDeploying;

  let zkappKey = PrivateKey.random();
  let zkappAddress = zkappKey.toPublicKey();
  tic('compile');
  let { verificationKey } = await MixerZkapp.compile();
  toc();
//TODO ADD MERKLE TREE STATE VARIABLE 
  // let zkappInterface = {
  //   getState() {
  //     return getState(zkappAddress);
  //   },
  // };

  let zkapp = new MixerZkapp(zkappAddress);
  let tx = await Mina.transaction(feePayer, () => {
    AccountUpdate.fundNewAccount(feePayer);
    zkapp.deploy({ zkappKey, verificationKey });
  });
  await tx.send().wait();

  isDeploying = null;
  // return zkappInterface;
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
