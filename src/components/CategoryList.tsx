import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";
import ConfirmDeleteModal from "./ConfirmDeleteModal"; // Импортируем модальное окно

Modal.setAppElement("#root");

interface Category {
  id: number;
  name: string;
}

interface NewCategory {
  name: string;
}

const API_BASE_URL = "http://194.87.102.3/api/";


const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1
/categories`);
  return data;
};

const createCategory = async (category: NewCategory) => {
  const { data } = await axios.post(`${API_BASE_URL}admin/api/v1
/categories`, category);
  return data;
};

const updateCategory = async (category: Category) => {
  const { data } = await axios.put(`${API_BASE_URL}admin/api/v1
/categories/${category.id}`, category);
  return data;
};

const deleteCategory = async (id: number) => {
  await axios.delete(`${API_BASE_URL}admin/api/v1
/categories/${id}`);
};

function CategoryList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<NewCategory>({ name: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Состояние для модального окна подтверждения
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null); // Храним категорию для удаления

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while creating the category.";
      setErrorMessage(errorDetail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while updating the category.";
      setErrorMessage(errorDetail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDeleteModalOpen(false); // Закрываем модальное окно после успешного удаления
    },
  });

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategory({ name: category.name });
    } else {
      setEditingCategory(null);
      setNewCategory({ name: "" });
    }
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setNewCategory({ name: "" });
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateMutation.mutate({ ...editingCategory, ...newCategory });
    } else {
      createMutation.mutate(newCategory);
    }
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container">
      <h2>Categories</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="search-container w-1/3">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => openModal()} className="button primary">
          Add Category
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories?.length ? (
          filteredCategories.map((category) => (
            <div key={category.id} className="card">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openModal(category)}
                  className="button secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(category)} // Открываем модальное окно подтверждения
                  className="button danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full opacity-70">
            No categories found.
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
          {editingCategory ? "Edit Category" : "Add Category"}
        </h2>
        <div className="field-group">
          <h3>Category Info</h3>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Category Name"
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
            {editingCategory ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={categoryToDelete?.name || ""}
      />
    </div>
  );
}

export default CategoryList;