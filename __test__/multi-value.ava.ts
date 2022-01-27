import { Workspace, NearAccount } from "near-willem-workspaces-ava";
import { NEAR } from "near-units";
import { deploy, getDelta, mint, totalCost } from "./util";

// const runner = Workspace.init(
//   { initialBalance: NEAR.parse("20 N").toString() },
//   async ({ root }) => {
//     const tenk = await root.createAndDeploy(
//       "multi_value",
//       __dirname + "/../target/my_witgen_example.wasm"
//     );
//     return { tenk };
//   }
// );

// runner.test("Initial Payout", async (t, { root, tenk }) => {
//   await tenk.view("magic");
// });
