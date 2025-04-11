// src/components/ItemList.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";
import ConfirmDeleteModal from "./ConfirmDeleteModal"; // Импортируем модальное окно

Modal.setAppElement("#root");

interface Type {
  id: number;
  name: string;
}

interface Rarity {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Collection {
  id: number;
  name: string;
}

interface Weapon {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  photo?: string;
  type: Type;
  rarity: Rarity;
  category: Category;
  collection: Collection;
  weapon: Weapon;
  created_at: string;
}

interface NewItem {
  name: string;
  photo?: string;
  type_id: number;
  rarity_id: number;
  category_id: number;
  collection_id: number;
  weapon_id: number;
}

const API_BASE_URL = "http://194.87.102.3/api/";

const fetchItems = async (): Promise<Item[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1/items`);
  return data;
};

const fetchTypes = async (): Promise<Type[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1/types`);
  return data;
};

const fetchRarities = async (): Promise<Rarity[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1/rarities`);
  return data;
};

const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1/categories`);
  return data;
};

const fetchCollections = async (): Promise<Collection[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1/collections`);
  return data;
};

const fetchWeapon = async (): Promise<Weapon[]> => {
  const { data } = await axios.get(`${API_BASE_URL}admin/api/v1/weapons`);
  return data;
};

const createItem = async (item: NewItem) => {
  const { data } = await axios.post(`${API_BASE_URL}admin/api/v1/items`, item);
  return data;
};

const updateItem = async (item: Item) => {
  const { data } = await axios.put(`${API_BASE_URL}admin/api/v1/items/${item.id}`, item);
  return data;
};

const deleteItem = async (id: number) => {
  await axios.delete(`${API_BASE_URL}admin/api/v1/items/${id}`);
};

function ItemList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState<NewItem>({
    name: "",
    type_id: 0,
    rarity_id: 0,
    category_id: 0,
    collection_id: 0,
    weapon_id: 0,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Состояние для модального окна подтверждения
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null); // Храним элемент для удаления

  const { data: items, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  const { data: types, isLoading: typesLoading } = useQuery({
    queryKey: ["types"],
    queryFn: fetchTypes,
  });

  const { data: rarities, isLoading: raritiesLoading } = useQuery({
    queryKey: ["rarities"],
    queryFn: fetchRarities,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
  });

  const { data: weapons, isLoading: weaponsLoading } = useQuery({
    queryKey: ["weapons"],
    queryFn: fetchWeapon,
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while creating the item.";
      setErrorMessage(errorDetail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while updating the item.";
      setErrorMessage(errorDetail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      setIsDeleteModalOpen(false); // Закрываем модальное окно после успешного удаления
    },
  });

  const openModal = (item?: Item) => {
    console.log("Opening modal with item:", item);
    if (item) {
      setEditingItem(item);
      const updatedItem = {
        name: item.name,
        type_id: item.type?.id ?? 0, // Извлекаем id из вложенного объекта
        rarity_id: item.rarity?.id ?? 0,
        category_id: item.category?.id ?? 0,
        collection_id: item.collection?.id ?? 0,
        weapon_id: item.weapon?.id ?? 0,
      };
      console.log("Setting newItem:", updatedItem);
      setNewItem(updatedItem);
    } else {
      setEditingItem(null);
      setNewItem({
        name: "",
        type_id: 0,
        rarity_id: 0,
        category_id: 0,
        collection_id: 0,
        weapon_id: 0,
      });
    }
    setPhotoFile(null);
    setErrorMessage(null);
    // Убедимся, что данные загружены перед открытием модального окна
    if (weapons && types && rarities && categories && collections) {
      setIsModalOpen(true);
    } else {
      console.log("Data not fully loaded yet:", { weapons, types, rarities, categories, collections });
      setErrorMessage("Please wait, data is still loading...");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setNewItem({
      name: "",
      type_id: 0,
      rarity_id: 0,
      category_id: 0,
      collection_id: 0,
      weapon_id: 0,
    });
    setPhotoFile(null);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (
      newItem.type_id === 0 ||
      newItem.rarity_id === 0 ||
      newItem.category_id === 0 ||
      newItem.collection_id === 0 ||
      newItem.weapon_id === 0
    ) {
      setErrorMessage("Please select all required fields.");
      return;
    }

    if (!newItem.name.trim()) {
      setErrorMessage("Item name is required.");
      return;
    }

    let photoPath: string | undefined;

    if (photoFile) {
      const formData = new FormData();
      formData.append("file", photoFile);
      try {
        const { data } = await axios.post(`${API_BASE_URL}admin/api/v1/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        photoPath = data.path;
      } catch (error) {
        console.error("Error uploading photo:", error);
        setErrorMessage("Failed to upload photo.");
        return;
      }
    }

    const itemData = {
      ...newItem,
      photo: photoPath || editingItem?.photo,
    };

    if (editingItem) {
      updateMutation.mutate({ ...editingItem, ...itemData });
    } else {
      createMutation.mutate(itemData);
    }
  };

  const openDeleteModal = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (itemsLoading || typesLoading || raritiesLoading || categoriesLoading || collectionsLoading || weaponsLoading) {
    return <div>Loading...</div>;
  }

  if (itemsError) return <div>Error: {(itemsError as Error).message}</div>;

  return (
    <div className="container">
      <h2>Items</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="search-container w-1/3">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => openModal()} className="button primary">
          Add Item
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems?.length ? (
          filteredItems.map((item) => (
            <div key={item.id} className="card">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm opacity-80">Weapon: {item.weapon.name}</p>
              <p className="text-sm opacity-80">Type: {item.type.name}</p>
              <p className="text-sm opacity-80">Rarity: {item.rarity.name}</p>
              <p className="text-sm opacity-80">Category: {item.category.name}</p>
              <p className="text-sm opacity-80">Collection: {item.collection.name}</p>
              <p className="text-sm opacity-80">
                Created: {new Date(item.created_at).toLocaleString()}
              </p>
              {item.photo && (
                <img
                  src={`${API_BASE_URL}${item.photo}`}
                  alt={item.name}
                  className="w-40 h-40 object-cover"
                />
              )}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openModal(item)}
                  className="button secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(item)} // Открываем модальное окно подтверждения
                  className="button danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full opacity-70">
            No items found.
          </p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="text-2xl font-bold mb-6">
          {editingItem ? "Edit Item" : "Add Item"}
        </h2>
        <div className="field-group">
          <label htmlFor="name">Item Name</label>
          <input
            id="name"
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Item Name"
          />
        </div>
        <div className="field-group">
          <label htmlFor="weapon_id">Weapon</label>
          <select
            id="weapon_id"
            value={newItem.weapon_id}
            onChange={(e) => setNewItem({ ...newItem, weapon_id: Number(e.target.value) })}
          >
            <option value={0} disabled>
              {weaponsLoading ? "Loading..." : "Выберите оружие"}
            </option>
            {weapons?.map((weapon) => (
              <option key={weapon.id} value={weapon.id}>
                {weapon.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="type_id">Type</label>
          <select
            id="type_id"
            value={newItem.type_id}
            onChange={(e) => setNewItem({ ...newItem, type_id: Number(e.target.value) })}
          >
            <option value={0} disabled>
              {typesLoading ? "Loading..." : "Выберите тип"}
            </option>
            {types?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="rarity_id">Rarity</label>
          <select
            id="rarity_id"
            value={newItem.rarity_id}
            onChange={(e) => setNewItem({ ...newItem, rarity_id: Number(e.target.value) })}
          >
            <option value={0} disabled>
              {raritiesLoading ? "Loading..." : "Выберите редкость"}
            </option>
            {rarities?.map((rarity) => (
              <option key={rarity.id} value={rarity.id}>
                {rarity.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="category_id">Category</label>
          <select
            id="category_id"
            value={newItem.category_id}
            onChange={(e) => setNewItem({ ...newItem, category_id: Number(e.target.value) })}
          >
            <option value={0} disabled>
              {categoriesLoading ? "Loading..." : "Выберите категорию"}
            </option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="collection_id">Collection</label>
          <select
            id="collection_id"
            value={newItem.collection_id}
            onChange={(e) => setNewItem({ ...newItem, collection_id: Number(e.target.value) })}
          >
            <option value={0} disabled>
              {collectionsLoading ? "Loading..." : "Выберите коллекцию"}
            </option>
            {collections?.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="photo">Photo</label>
          {editingItem && editingItem.photo && (
            <p className="text-sm opacity-70 mb-1">
              Current Photo: <a href={`${API_BASE_URL}${editingItem.photo}`} target="_blank" rel="noopener noreferrer">View</a>
            </p>
          )}
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            className="mb-4"
          />
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}
        <div className="flex justify-end space-x-3">
          <button onClick={closeModal} className="button secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} className="button primary">
            {editingItem ? "Update" : "Create"}
          </button>
        </div>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name || ""}
      />
    </div>
  );
}

export default ItemList;