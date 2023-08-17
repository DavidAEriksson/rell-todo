import * as pcl from "postchain-client";

// Constants
const adminPubkey = Buffer.from(
  "031b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f",
  "hex",
);
const adminPrivkey = Buffer.from(
  "0101010101010101010101010101010101010101010101010101010101010101",
  "hex",
);
const nodeUrl = "http://localhost:7740/";
const blockchainRID =
  "11F6F7A21E30BDB7B134F90D414A7E23D60CAECED27775F46D9D02955BF3888C";

// Helper function to create Chromia client
async function createChromiaClient() {
  return await pcl.createClient({
    nodeURLPool: nodeUrl,
    blockchainRID: blockchainRID,
  });
}

// Transaction function
async function performTransaction(
  name: string,
  args: any[],
  isUpdate: boolean = false,
) {
  const chromiaClient = await createChromiaClient();

  const operation = isUpdate
    ? {
        name: "update_todo",
        args: args,
      }
    : {
        name: "create_todo",
        args: args,
      };

  const { transactionRID } = await chromiaClient.signAndSendUniqueTransaction(
    {
      operations: [operation],
      signers: [adminPubkey],
    },
    { privKey: adminPrivkey, pubKey: adminPubkey },
  );

  return transactionRID;
}

// Query function
async function performQuery(id: number) {
  const chromiaClient = await createChromiaClient();
  const queryArgs: pcl.QueryArguments = {
    id: id,
  };
  return await chromiaClient.query("get_todo", queryArgs);
}

// Main function
async function main() {
  const cmdargs = process.argv.slice(2);

  if (cmdargs.length === 0) {
    console.log("Usage: node filename.js [update] [args]");
    return;
  }

  if (cmdargs[0] === "update") {
    if (cmdargs.length < 4) {
      console.log("Usage: node filename.js update [id] [text] [completed]");
      return;
    }

    const id = Number.parseInt(cmdargs[1]);
    const text = cmdargs[2];
    const completed = cmdargs[3] === "true";

    const transactionRID = await performTransaction(
      "update_todo",
      [id, text, completed],
      true,
    );
    console.log("Update transaction RID:", transactionRID);

    const queryResult = await performQuery(id);
    console.log("Updated todo:", queryResult);
  } else {
    const transactionRID = await performTransaction("create_todo", [
      "My first todo",
    ]);
    console.log("Create transaction RID:", transactionRID);

    const id = Number.parseInt(cmdargs[0]);
    const queryResult = await performQuery(id);
    console.log("Todo:", queryResult);
  }
}

// Call the main function
main();
