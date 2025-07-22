import { ProgramsModalProps } from '../../types';

export const ProgramsModal = ({ savedMints, handleSelectMint, closeModal }: ProgramsModalProps) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Select an Existing Token</h2>
        <button onClick={closeModal} className="modal-close-button">&times;</button>
      </div>
      <ul className="program-list">
        {savedMints.map((mint) => (
          <li key={mint.address} onClick={() => handleSelectMint(mint)} className="program-list-item">
            <p className="address-label">{mint.name}</p>
            <p className="address-text">{mint.address}</p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);