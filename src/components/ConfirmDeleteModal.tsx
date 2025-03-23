import Modal from "react-modal";

Modal.setAppElement("#root");

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

function ConfirmDeleteModal({ isOpen, onRequestClose, onConfirm, itemName }: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
      <p className="mb-6">
        Are you sure you want to delete <span className="font-semibold">{itemName}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-3">
        <button onClick={onRequestClose} className="button secondary">
          Cancel
        </button>
        <button onClick={onConfirm} className="button danger">
          Delete
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteModal;