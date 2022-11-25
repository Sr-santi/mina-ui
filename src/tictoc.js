/* eslint-env node */
// helper for printing timings

export { tic, toc };

let timingStack = [];
let i = 0;

/**
 *
 * @param {string} label
 */
function tic(label = `Run command ${i++}`) {
  
  timingStack.push([label, Date.now()]);
}

function toc() {
  let [label, start] = timingStack.pop();
  let time = (Date.now() - start) / 1000;
  
}
