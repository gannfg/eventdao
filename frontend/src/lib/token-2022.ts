import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

export interface TokenTransferParams {
  connection: Connection;
  payer: PublicKey; // fee payer and owner
  owner: PublicKey; // token owner (usually same as payer)
  destinationOwner: PublicKey;
  mint: PublicKey;
  amount: bigint;
  decimals: number;
}

export const getAtaForToken2022 = (owner: PublicKey, mint: PublicKey): PublicKey => {
  return getAssociatedTokenAddressSync(mint, owner, false, TOKEN_2022_PROGRAM_ID);
};

export const buildToken2022TransferTx = async ({
  connection,
  payer,
  owner,
  destinationOwner,
  mint,
  amount,
  decimals,
}: TokenTransferParams): Promise<Transaction> => {
  const tx = new Transaction();

  const sourceAta = getAtaForToken2022(owner, mint);
  const destAta = getAtaForToken2022(destinationOwner, mint);

  // Ensure source ATA exists
  const sourceInfo = await connection.getAccountInfo(sourceAta);
  if (!sourceInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        payer, // payer
        sourceAta, // ata
        owner, // owner
        mint, // mint
        TOKEN_2022_PROGRAM_ID,
      ),
    );
  }

  // Ensure destination ATA exists
  const destInfo = await connection.getAccountInfo(destAta);
  if (!destInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        payer, // payer
        destAta, // ata
        destinationOwner, // owner
        mint, // mint
        TOKEN_2022_PROGRAM_ID,
      ),
    );
  }

  const ix: TransactionInstruction = createTransferCheckedInstruction(
    sourceAta,
    mint,
    destAta,
    owner,
    amount,
    decimals,
    [],
    TOKEN_2022_PROGRAM_ID,
  );

  tx.add(ix);
  tx.feePayer = payer;
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  return tx;
};


