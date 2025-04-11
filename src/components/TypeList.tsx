import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

interface Type {
  id: number;
  name: string;
}

interface NewType {
  name: string;
}

const API_BASE_URL = "http://194.87.102.3/api/";


const fetchTypes = async (): Promise<Type[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1
/types`);
  return data;
};

const createType = async (type: NewType) => {
  const { data } = await axios.post(`${API_BASE_URL}admin/api/v1
/types`, type);
  return data;
};

const updateType = async (type: Type) => {
  const { data } = await axios.put(`${API_BASE_URL}admin/api/v1
/types/${type.id}`, type);
  return data;
};

const deleteType = async (id: number) => {
  await axios.delete(`${API_BASE_URL}admin/api/v1
/types/${id}`);
};

function TypeList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<Type | null>(null);
  const [newType, setNewType] = useState<NewType>({ name: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: types, isLoading, error } = useQuery({
    queryKey: ["types"],
    queryFn: fetchTypes,
  });

  const createMutation = useMutation({
    mutationFn: createType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["types"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while creating the type.";
      setErrorMessage(errorDetail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["types"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while updating the type.";
      setErrorMessage(errorDetail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteType,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["types"] }),
  });

  const openModal = (type?: Type) => {
    if (type) {
      setEditingType(type);
      setNewType({ name: type.name });
    } else {
      setEditingType(null);
      setNewType({ name: "" });
    }
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setNewType({ name: "" });
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (editingType) {
      updateMutation.mutate({ ...editingType, ...newType });
    } else {
      createMutation.mutate(newType);
    }
  };

  const filteredTypes = types?.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container">
      <h2>Types</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="search-container w-1/3">
          <input
            type="text"
            placeholder="Search types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => openModal()} className="button primary">
          Add Type
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTypes?.length ? (
          filteredTypes.map((type) => (
            <div key={type.id} className="card">
              <h3 className="text-lg font-semibold">{type.name}</h3>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openModal(type)}
                  className="button secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(type.id)}
                  className="button danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full opacity-70">
            No types found.
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
          {editingType ? "Edit Type" : "Add Type"}
        </h2>
        <div className="field-group">
          <h3>Type Info</h3>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              placeholder="Type Name"
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
            {editingType ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default TypeList;