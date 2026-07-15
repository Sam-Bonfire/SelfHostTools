import React, { useState } from 'react';
import { useProfiles } from '@packages/persistence';
import { Plus, Trash2 } from 'lucide-react';
import Tooltip from './Tooltip';

const ScenarioSelector = ({ namespace }) => {
  const { activeProfile, profiles, switchProfile, createProfile, deleteProfile } = useProfiles(namespace);
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newProfileName.trim();
    if (trimmed && !profiles.includes(trimmed)) {
      createProfile(trimmed);
      setNewProfileName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center bg-white border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-1">
        <label
          htmlFor={`scenario-${namespace}`}
          className="text-xs font-black uppercase tracking-wider mr-2 text-gray-500"
        >
          Scenario:
        </label>
        <select
          id={`scenario-${namespace}`}
          value={activeProfile}
          onChange={(e) => switchProfile(e.target.value)}
          className="bg-transparent font-bold text-sm outline-none cursor-pointer appearance-none pr-4"
        >
          {profiles.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {/* Custom arrow since appearance is none */}
        <div className="pointer-events-none absolute right-1 text-black text-[10px] font-black">▼</div>
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className="flex items-center gap-1">
          <input
            type="text"
            autoFocus
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="Name..."
            className="w-24 px-2 py-1 border-4 border-black font-bold text-sm outline-none"
          />
          <button
            type="submit"
            className="p-1 bg-green-400 border-4 border-black hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            <Plus className="w-4 h-4 text-black" />
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="p-1 bg-gray-200 border-4 border-black hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all text-xs font-black"
          >
            X
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-1">
          <Tooltip content="Add New Scenario">
            <button
              onClick={() => setIsAdding(true)}
              className="p-1.5 bg-blue-300 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all block"
            >
              <Plus className="w-4 h-4 text-black" />
            </button>
          </Tooltip>
          {profiles.length > 1 && (
            <Tooltip content="Delete Scenario">
              <button
                onClick={() => deleteProfile(activeProfile)}
                className="p-1.5 bg-red-400 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all block"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};

export default ScenarioSelector;
