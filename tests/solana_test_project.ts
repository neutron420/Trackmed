import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTestProject } from "../target/types/solana_test_project";

describe("solana_test_project", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .SolanaTestProject as Program<SolanaTestProject>;

  it("Runs hello instruction", async () => {
    await program.methods
      .hello()
      .accounts({})
      .rpc();

    console.log(" hello instruction executed");
  });
});
