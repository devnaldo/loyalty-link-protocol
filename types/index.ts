export interface SavedMint {
  address: string;
  name: string;
  createdAt: string;
}

export interface ViewProps {
  isTransitioning: boolean;
}

export interface InitialViewProps extends ViewProps {
  handleCreateMint: () => Promise<void>;
  isLoading: boolean;
  tokenName: string;
  setTokenName: (name: string) => void;
  savedMints: SavedMint[];
  openModal: () => void;
}

export interface MintingViewProps extends ViewProps {
  activeMint: SavedMint;
  createTxSignature: string | null;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  mintQuantity: number;
  setMintQuantity: (quantity: number) => void;
  handleMintPoints: () => Promise<void>;
  isLoading: boolean;
  mintTxSignature: string | null;
  handleGoToInitialView: () => void;
  openModal: () => void;
}

export interface ProgramsModalProps {
  savedMints: SavedMint[];
  handleSelectMint: (mint: SavedMint) => void;
  closeModal: () => void;
}

export interface HeaderProps {
  isClient: boolean;
  handleLogoClick: () => void;
}