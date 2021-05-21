'use strict';

module.exports.payments = async event => {
  
  // Uncomment and redeploy to simulate server delay
  // await new Promise(r => setTimeout(r, 1000));
  function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  let id = randomIntFromInterval (1, 1000);
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Your payment transaction was successfully processed.`,
        transactionId: `T${id}`,
        input: event,
      },
      null,
      2
    ),
  };
};
