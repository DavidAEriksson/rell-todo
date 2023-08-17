"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pcl = __importStar(require("postchain-client"));
// Constants
const adminPubkey = Buffer.from("031b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f", "hex");
const adminPrivkey = Buffer.from("0101010101010101010101010101010101010101010101010101010101010101", "hex");
const nodeUrl = "http://localhost:7740/";
const blockchainRID = "11F6F7A21E30BDB7B134F90D414A7E23D60CAECED27775F46D9D02955BF3888C";
// Helper function to create Chromia client
function createChromiaClient() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield pcl.createClient({
            nodeURLPool: nodeUrl,
            blockchainRID: blockchainRID,
        });
    });
}
// Transaction function
function performTransaction(name, args, isUpdate = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const chromiaClient = yield createChromiaClient();
        const operation = isUpdate
            ? {
                name: "update_todo",
                args: args,
            }
            : {
                name: "create_todo",
                args: args,
            };
        const { status, statusCode, transactionRID } = yield chromiaClient.signAndSendUniqueTransaction({
            operations: [operation],
            signers: [adminPubkey],
        }, { privKey: adminPrivkey, pubKey: adminPubkey });
        return transactionRID;
    });
}
// Query function
function performQuery(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const chromiaClient = yield createChromiaClient();
        const queryArgs = {
            id: id,
        };
        return yield chromiaClient.query("get_todo", queryArgs);
    });
}
// Main function
function main() {
    return __awaiter(this, void 0, void 0, function* () {
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
            const transactionRID = yield performTransaction("update_todo", [id, text, completed], true);
            console.log("Update transaction RID:", transactionRID);
            const queryResult = yield performQuery(id);
            console.log("Updated todo:", queryResult);
        }
        else {
            const transactionRID = yield performTransaction("create_todo", [
                "My first todo",
            ]);
            console.log("Create transaction RID:", transactionRID);
            const id = Number.parseInt(cmdargs[0]);
            const queryResult = yield performQuery(id);
            console.log("Todo:", queryResult);
        }
    });
}
// Call the main function
main();
