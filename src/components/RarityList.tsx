import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";
import ConfirmDeleteModal from "./ConfirmDeleteModal"; // Импортируем модальное окно

Modal.setAppElement("#root");

interface Rarity {
  id: number;
  name: string;
}

interface NewRarity {
  name: string;
}

const API_BASE_URL = "http://194.87.102.3/api/";

const fetchRarities = async (): Promise<Rarity[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1/rarities`);
  return data;
};

const createRarity = async (rarity: NewRarity) => {
  const { data } = await axios.post(`${API_BASE_URL}admin/api/v1/rarities`, rarity);
  return data;
};

const updateRarity = async (rarity: Rarity) => {
  const { data } = await axios.put(`${API_BASE_URL}admin/api/v1/rarities/${rarity.id}`, rarity);
  return data;
};

const deleteRarity = async (id: number) => {
  await axios.delete(`${API_BASE_URL}admin/api/v1/rarities/${id}`);
};

function RarityList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRarity, setEditingRarity] = useState<Rarity | null>(null);
  const [newRarity, setNewRarity] = useState<NewRarity>({ name: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Состояние для модального окна подтверждения
  const [rarityToDelete, setRarityToDelete] = useState<Rarity | null>(null); // Храним редкость для удаления

  const { data: rarities, isLoading, error } = useQuery({
    queryKey: ["rarities"],
    queryFn: fetchRarities,
  });

  const createMutation = useMutation({
    mutationFn: createRarity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rarities"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while creating the rarity.";
      setErrorMessage(errorDetail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRarity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rarities"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while updating the rarity.";
      setErrorMessage(errorDetail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRarity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rarities"] });
      setIsDeleteModalOpen(false); // Закрываем модальное окно после успешного удаления
    },
  });

  const openDeleteModal = (rarity: Rarity) => {
    setRarityToDelete(rarity);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (rarityToDelete) {
      deleteMutation.mutate(rarityToDelete.id);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRarityToDelete(null);
  };

  const openModal = (rarity?: Rarity) => {
    if (rarity) {
      setEditingRarity(rarity);
      setNewRarity({ name: rarity.name });
    } else {
      setEditingRarity(null);
      setNewRarity({ name: "" });
    }
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRarity(null);
    setNewRarity({ name: "" });
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (editingRarity) {
      updateMutation.mutate({ ...editingRarity, ...newRarity });
    } else {
      createMutation.mutate(newRarity);
    }
  };

  const filteredRarities = rarities?.filter((rarity) =>
    rarity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container">
      <h2>Rarities</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="search-container w-1/3">
          <input
            type="text"
            placeholder="Search rarities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => openModal()} className="button primary">
          Add Rarity
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRarities?.length ? (
          filteredRarities.map((rarity) => (
            <div key={rarity.id} className="card">
              <h3 className="text-lg font-semibold">{rarity.name}</h3>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openModal(rarity)}
                  className="button secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(rarity)} // Открываем модальное окно подтверждения
                  className="button danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full opacity-70">
            No rarities found.
          </p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="text-2xl font-bold mb-4">
          {editingRarity ? "Edit Rarity" : "Add Rarity"}
        </h2>
        <div className="field-group">
          <h3>Rarity Info</h3>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={newRarity.name}
              onChange={(e) => setNewRarity({ ...newRarity, name: e.target.value })}
              placeholder="Rarity Name"
            />
          </div>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}
        <div className="flex justify-end space-x-3">
          <button onClick={closeModal} className="button secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="button primary">
            {editingRarity ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={rarityToDelete?.name || ""}
      />
    </div>
  );
}

export default RarityList;