import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

interface Type {
  id: number;
  name: string;
}

interface DamageInfo {
  armor: {
    arms: number;
    head: number;
    legs: number;
    chest: number;
    stomach: number;
  };
  no_armor: {
    arms: number;
    head: number;
    legs: number;
    chest: number;
    stomach: number;
  };
}

interface Weapon {
  id: number;
  name: string;
  type: Type;
  damage: number;
  fire_rate: number;
  recoil: number;
  range: number;
  mobility: number;
  armor_penetration: number;
  penetration_power: number;
  ammo: number;
  cost: number;
  damage_info: DamageInfo;
  slug: string;
}

interface NewWeapon {
  name: string;
  type_id: number;
  damage: number;
  fire_rate: number;
  recoil: number;
  range: number;
  mobility: number;
  armor_penetration: number;
  penetration_power: number;
  ammo: number;
  cost: number;
  damage_info: DamageInfo;
}

const API_BASE_URL = "http://localhost:8000";

const fetchWeapons = async (): Promise<Weapon[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/admin/api/v1/weapons`);
  return data;
};

const fetchTypes = async (): Promise<Type[]> => {
  const { data } = await axios.get(`${API_BASE_URL}/admin/api/v1/types`);
  return data;
};

const createWeapon = async (weapon: NewWeapon) => {
  const { data } = await axios.post(`${API_BASE_URL}/admin/api/v1/weapons`, weapon);
  return data;
};

const updateWeapon = async (weapon: Weapon) => {
  const { data } = await axios.put(`${API_BASE_URL}/admin/api/v1/weapons/${weapon.id}`, weapon);
  return data;
};

const deleteWeapon = async (id: number) => {
  await axios.delete(`${API_BASE_URL}/admin/api/v1/weapons/${id}`);
};

function WeaponList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWeapon, setEditingWeapon] = useState<Weapon | null>(null);
  const [newWeapon, setNewWeapon] = useState<NewWeapon>({
    name: "",
    type_id: 0,
    damage: 0,
    fire_rate: 0,
    recoil: 0,
    range: 0,
    mobility: 0,
    armor_penetration: 0,
    penetration_power: 0,
    ammo: 0,
    cost: 0,
    damage_info: {
      armor: { arms: 0, head: 0, legs: 0, chest: 0, stomach: 0 },
      no_armor: { arms: 0, head: 0, legs: 0, chest: 0, stomach: 0 },
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: weapons, isLoading, error } = useQuery({
    queryKey: ["weapons"],
    queryFn: fetchWeapons,
  });

  const { data: types, isLoading: typesLoading } = useQuery({
    queryKey: ["types"],
    queryFn: fetchTypes,
  });

  const createMutation = useMutation({
    mutationFn: createWeapon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weapons"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while creating the weapon.";
      setErrorMessage(errorDetail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateWeapon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weapons"] });
      setErrorMessage(null);
      closeModal();
    },
    onError: (error: any) => {
      const errorDetail = error.response?.data?.detail || "An error occurred while updating the weapon.";
      setErrorMessage(errorDetail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWeapon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weapons"] }),
  });

  const openModal = (weapon?: Weapon) => {
    if (weapon) {
      setEditingWeapon(weapon);
      setNewWeapon({
        name: weapon.name,
        type_id: weapon.type.id ?? 0,
        damage: weapon.damage,
        fire_rate: weapon.fire_rate,
        recoil: weapon.recoil,
        range: weapon.range,
        mobility: weapon.mobility,
        armor_penetration: weapon.armor_penetration,
        penetration_power: weapon.penetration_power,
        ammo: weapon.ammo,
        cost: weapon.cost,
        damage_info: weapon.damage_info,
      });
    } else {
      setEditingWeapon(null);
      setNewWeapon({
        name: "",
        type_id: 0,
        damage: 0,
        fire_rate: 0,
        recoil: 0,
        range: 0,
        mobility: 0,
        armor_penetration: 0,
        penetration_power: 0,
        ammo: 0,
        cost: 0,
        damage_info: {
          armor: { arms: 0, head: 0, legs: 0, chest: 0, stomach: 0 },
          no_armor: { arms: 0, head: 0, legs: 0, chest: 0, stomach: 0 },
        },
      });
    }
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWeapon(null);
    setNewWeapon({
      name: "",
      type_id: 0,
      damage: 0,
      fire_rate: 0,
      recoil: 0,
      range: 0,
      mobility: 0,
      armor_penetration: 0,
      penetration_power: 0,
      ammo: 0,
      cost: 0,
      damage_info: {
        armor: { arms: 0, head: 0, legs: 0, chest: 0, stomach: 0 },
        no_armor: { arms: 0, head: 0, legs: 0, chest: 0, stomach: 0 },
      },
    });
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (editingWeapon) {
      updateMutation.mutate({ ...editingWeapon, ...newWeapon });
    } else {
      createMutation.mutate(newWeapon);
    }
  };

  const filteredWeapons = weapons?.filter((weapon) =>
    weapon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container">
      <h2>Weapons</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="search-container w-1/3">
          <input
            type="text"
            placeholder="Search weapons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => openModal()} className="button primary">
          Add Weapon
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWeapons?.length ? (
          filteredWeapons.map((weapon) => (
            <div key={weapon.id} className="card">
              <h3 className="text-lg font-semibold">{weapon.name}</h3>
              <p className="text-sm opacity-80">Damage: {weapon.type.name}</p>
              <p className="text-sm opacity-80">Damage: {weapon.damage}</p>
              <p className="text-sm opacity-80">Fire Rate: {weapon.fire_rate}</p>
              <p className="text-sm opacity-80">Recoil: {weapon.recoil}</p>
              <p className="text-sm opacity-80">Range: {weapon.range}</p>
              <p className="text-sm opacity-80">Mobility: {weapon.mobility}</p>
              <p className="text-sm opacity-80">Armor Penetration: {weapon.armor_penetration}</p>
              <p className="text-sm opacity-80">Penetration Power: {weapon.penetration_power}</p>
              <p className="text-sm opacity-80">Ammo: {weapon.ammo}</p>
              <p className="text-sm opacity-80">Cost: ${weapon.cost}</p>
              <div className="mt-2">
                <p className="text-sm font-medium">Damage (With Armor):</p>
                <p className="text-sm opacity-80">Arms: {weapon.damage_info.armor.arms}</p>
                <p className="text-sm opacity-80">Head: {weapon.damage_info.armor.head}</p>
                <p className="text-sm opacity-80">Legs: {weapon.damage_info.armor.legs}</p>
                <p className="text-sm opacity-80">Chest: {weapon.damage_info.armor.chest}</p>
                <p className="text-sm opacity-80">Stomach: {weapon.damage_info.armor.stomach}</p>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">Damage (No Armor):</p>
                <p className="text-sm opacity-80">Arms: {weapon.damage_info.no_armor.arms}</p>
                <p className="text-sm opacity-80">Head: {weapon.damage_info.no_armor.head}</p>
                <p className="text-sm opacity-80">Legs: {weapon.damage_info.no_armor.legs}</p>
                <p className="text-sm opacity-80">Chest: {weapon.damage_info.no_armor.chest}</p>
                <p className="text-sm opacity-80">Stomach: {weapon.damage_info.no_armor.stomach}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openModal(weapon)}
                  className="button secondary flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(weapon.id)}
                  className="button danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full opacity-70">
            No weapons found.
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
          {editingWeapon ? "Edit Weapon" : "Add Weapon"}
        </h2>

        {/* Основные характеристики */}
        <div className="field-group">
        <div className="field-group">
          <label htmlFor="type_id">Type</label>
          <select
            id="type_id"
            value={newWeapon.type_id}
            onChange={(e) => setNewWeapon({ ...newWeapon, type_id: Number(e.target.value) })}
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
          <h3>Basic Info</h3>
          <div>
            <label>Name</label>
            <input
              type="text"
              value={newWeapon.name}
              onChange={(e) => setNewWeapon({ ...newWeapon, name: e.target.value })}
              placeholder="Weapon Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label>Damage</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage}
                onChange={(e) => setNewWeapon({ ...newWeapon, damage: Number(e.target.value) })}
                placeholder="Damage"
              />
            </div>
            <div>
              <label>Fire Rate</label>
              <input
                type="number"
                step="1"
                value={newWeapon.fire_rate}
                onChange={(e) => setNewWeapon({ ...newWeapon, fire_rate: Number(e.target.value) })}
                placeholder="Fire Rate"
              />
            </div>
            <div>
              <label>Recoil</label>
              <input
                type="number"
                step="1"
                value={newWeapon.recoil}
                onChange={(e) => setNewWeapon({ ...newWeapon, recoil: Number(e.target.value) })}
                placeholder="Recoil"
              />
            </div>
            <div>
              <label>Range</label>
              <input
                type="number"
                step="1"
                value={newWeapon.range}
                onChange={(e) => setNewWeapon({ ...newWeapon, range: Number(e.target.value) })}
                placeholder="Range"
              />
            </div>
            <div>
              <label>Mobility</label>
              <input
                type="number"
                step="1"
                value={newWeapon.mobility}
                onChange={(e) => setNewWeapon({ ...newWeapon, mobility: Number(e.target.value) })}
                placeholder="Mobility"
              />
            </div>
            <div>
              <label>Armor Penetration</label>
              <input
                type="number"
                step="1"
                value={newWeapon.armor_penetration}
                onChange={(e) => setNewWeapon({ ...newWeapon, armor_penetration: Number(e.target.value) })}
                placeholder="Armor Penetration"
              />
            </div>
            <div>
              <label>Penetration Power</label>
              <input
                type="number"
                step="1"
                value={newWeapon.penetration_power}
                onChange={(e) => setNewWeapon({ ...newWeapon, penetration_power: Number(e.target.value) })}
                placeholder="Penetration Power"
              />
            </div>
            <div>
              <label>Ammo</label>
              <input
                type="number"
                step="1"
                value={newWeapon.ammo}
                onChange={(e) => setNewWeapon({ ...newWeapon, ammo: Number(e.target.value) })}
                placeholder="Ammo"
              />
            </div>
            <div>
              <label>Cost</label>
              <input
                type="number"
                step="1"
                value={newWeapon.cost}
                onChange={(e) => setNewWeapon({ ...newWeapon, cost: Number(e.target.value) })}
                placeholder="Cost"
              />
            </div>
          </div>
        </div>

        {/* Damage (With Armor) */}
        <div className="field-group">
          <h3>Damage (With Armor)</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label>Arms</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.armor.arms}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      armor: { ...newWeapon.damage_info.armor, arms: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Arms (Armor)"
              />
            </div>
            <div>
              <label>Head</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.armor.head}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      armor: { ...newWeapon.damage_info.armor, head: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Head (Armor)"
              />
            </div>
            <div>
              <label>Legs</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.armor.legs}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      armor: { ...newWeapon.damage_info.armor, legs: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Legs (Armor)"
              />
            </div>
            <div>
              <label>Chest</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.armor.chest}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      armor: { ...newWeapon.damage_info.armor, chest: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Chest (Armor)"
              />
            </div>
            <div>
              <label>Stomach</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.armor.stomach}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      armor: { ...newWeapon.damage_info.armor, stomach: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Stomach (Armor)"
              />
            </div>
          </div>
        </div>

        {/* Damage (No Armor) */}
        <div className="field-group">
          <h3>Damage (No Armor)</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label>Arms</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.no_armor.arms}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      no_armor: { ...newWeapon.damage_info.no_armor, arms: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Arms (No Armor)"
              />
            </div>
            <div>
              <label>Head</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.no_armor.head}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      no_armor: { ...newWeapon.damage_info.no_armor, head: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Head (No Armor)"
              />
            </div>
            <div>
              <label>Legs</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.no_armor.legs}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      no_armor: { ...newWeapon.damage_info.no_armor, legs: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Legs (No Armor)"
              />
            </div>
            <div>
              <label>Chest</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.no_armor.chest}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      no_armor: { ...newWeapon.damage_info.no_armor, chest: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Chest (No Armor)"
              />
            </div>
            <div>
              <label>Stomach</label>
              <input
                type="number"
                step="1"
                value={newWeapon.damage_info.no_armor.stomach}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    damage_info: {
                      ...newWeapon.damage_info,
                      no_armor: { ...newWeapon.damage_info.no_armor, stomach: Number(e.target.value) },
                    },
                  })
                }
                placeholder="Stomach (No Armor)"
              />
            </div>
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
            {editingWeapon ? "Update" : "Create"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default WeaponList;