import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";
import ConfirmDeleteModal from "./ConfirmDeleteModal"; // Импортируем модальное окно

Modal.setAppElement("#root");

interface Collection {
  id: number;
  name: string;
}

interface NewCollection {
  name: string;
}

const API_BASE_URL = "http://194.87.102.3/api/";

const fetchCollections = async (): Promise<Collection[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1/collections`);
  return data;
};

const createCollection = async (collection: NewCollection) => {
  const { data } = await axios.post(`${API_BASE_URL}admin/api/v1/collections`, collection);
  return data;
};

const updateCollection = async (collection: Collection) => {
  const { data } = await axios.put(`${API_BASE_URL}admin/api/v1/collections/${collection.id}`, collection);
  return data;
};

const deleteCollection = async (id: number) => {
  await axios.delete(`${API_BASE_URL}admin/api/v1/collections/${id}`);
};

function CollectionList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollection, setNewCollection] = useState<NewCollection>({ name: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Состояние для модального окна подтверждения
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null); // Храним коллекцию для удаления

  const { data: collections, isLoading, error } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while creating the collection.";
      setErrorMessage(errorDetail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while updating the collection.";
      setErrorMessage(errorDetail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsDeleteModalOpen(false); // Закрываем модальное окно после успешного удаления
    },
  });

  const openDeleteModal = (collection: Collection) => {
    setCollectionToDelete(collection);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (collectionToDelete) {
      deleteMutation.mutate(collectionToDelete.id);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCollectionToDelete(null);
  };

  const openModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setNewCollection({ name: collection.name });
    } else {
      setEditingCollection(null);
      setNewCollection({ name: "" });
    }
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCollection(null);
    setNewCollection({ name: "" });
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (editingCollection) {
      updateMutation.mutate({ ...editingCollection, ...newCollection });
    } else {
      createMutation.mutate(newCollection);
    }
  };

  const filteredCollections = collections?.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container">
      <h2>Collections</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="search-container w-1/3">
          <input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => openModal()} className="button primary">
          Add Collection
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections?.length ? (
          filteredCollections.map((collection) => (
            <div key={collection.id} className="card">
              <h3 className="text-lg font-semibold">{collection.name}</h3>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openModal(collection)}
                  className="button secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(collection)} // Открываем модальное окно подтверждения
                  className="button danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full opacity-70">
            No collections found.
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
          {editingCollection ? "Edit Collection" : "Add Collection"}
        </h2>
        <div className="field-group">
          <h3>Collection Info</h3>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={newCollection.name}
              onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
              placeholder="Collection Name"
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
            {editingCollection ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={collectionToDelete?.name || ""}
      />
    </div>
  );
}

export default CollectionList;