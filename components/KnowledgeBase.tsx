
import React, { useState } from 'react';
import { Persona, ObjectionTemplate } from '../types';

interface KnowledgeBaseProps {
  personas: Persona[];
  setPersonas: React.Dispatch<React.SetStateAction<Persona[]>>;
  objections: ObjectionTemplate[];
  setObjections: React.Dispatch<React.SetStateAction<ObjectionTemplate[]>>;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  personas,
  setPersonas,
  objections,
  setObjections,
}) => {
  const [activeTab, setActiveTab] = useState<'personas' | 'objections'>('personas');
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [newPersona, setNewPersona] = useState<Omit<Persona, 'id'>>({
    name: '',
    role: '',
    industry: '',
    companySize: '',
    painPoints: [''],
  });

  const [newObjection, setNewObjection] = useState<Omit<ObjectionTemplate, 'id'>>({
    category: '',
    trigger: '',
    response: '',
  });

  const handleAddPersona = () => {
    setPersonas([...personas, { ...newPersona, id: Date.now().toString() }]);
    setIsAdding(false);
    setNewPersona({ name: '', role: '', industry: '', companySize: '', painPoints: [''] });
  };

  const handleAddObjection = () => {
    setObjections([...objections, { ...newObjection, id: Date.now().toString() }]);
    setIsAdding(false);
    setNewObjection({ category: '', trigger: '', response: '' });
  };

  const handlePainPointChange = (index: number, value: string) => {
    const updated = [...newPersona.painPoints];
    updated[index] = value;
    setNewPersona({ ...newPersona, painPoints: updated });
  };

  const addPainPointField = () => {
    setNewPersona({ ...newPersona, painPoints: [...newPersona.painPoints, ''] });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setActiveTab('personas'); setIsAdding(false); }}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'personas'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Prospect Personas
        </button>
        <button
          onClick={() => { setActiveTab('objections'); setIsAdding(false); }}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'objections'
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Objection Library
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">
             {activeTab === 'personas' ? 'Defined Personas' : 'Objection Handling Playbook'}
           </h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
             {activeTab === 'personas'
               ? 'The AI will try to match the prospect in the call to one of these profiles.'
               : 'The AI will reference these scripts when it hears matching objections.'}
           </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          {isAdding ? 'Cancel' : activeTab === 'personas' ? '+ Add Persona' : '+ Add Objection'}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in transition-colors duration-500">
          {activeTab === 'personas' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Persona Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="e.g. Enterprise Eddie"
                    value={newPersona.name}
                    onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Role/Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="e.g. CTO / VP Engineering"
                    value={newPersona.role}
                    onChange={(e) => setNewPersona({ ...newPersona, role: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="e.g. Fintech"
                    value={newPersona.industry}
                    onChange={(e) => setNewPersona({ ...newPersona, industry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company Size</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="e.g. 1000+ employees"
                    value={newPersona.companySize}
                    onChange={(e) => setNewPersona({ ...newPersona, companySize: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Key Pain Points</label>
                {newPersona.painPoints.map((pt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-slate-900 dark:text-white mb-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                    placeholder="e.g. Slow deployment cycles"
                    value={pt}
                    onChange={(e) => handlePainPointChange(idx, e.target.value)}
                  />
                ))}
                <button onClick={addPainPointField} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium">
                  + Add another pain point
                </button>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleAddPersona}
                  className="w-full py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all active:scale-95"
                >
                  Save Persona
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  value={newObjection.category}
                  onChange={(e) => setNewObjection({ ...newObjection, category: e.target.value })}
                >
                  <option value="">Select Category...</option>
                  <option value="Price">Price / Budget</option>
                  <option value="Timing">Timing / Urgency</option>
                  <option value="Authority">Authority / Decision Maker</option>
                  <option value="Product">Feature / Competitor</option>
                  <option value="Trust">Trust / Risk</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Trigger Phrase (What the prospect says)</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  placeholder="e.g. 'We don't have budget for this right now'"
                  value={newObjection.trigger}
                  onChange={(e) => setNewObjection({ ...newObjection, trigger: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Ideal Response Script</label>
                <textarea
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md h-24 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  placeholder="e.g. I understand. Budget is often a concern. However, most clients find that..."
                  value={newObjection.response}
                  onChange={(e) => setNewObjection({ ...newObjection, response: e.target.value })}
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleAddObjection}
                  className="w-full py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all active:scale-95"
                >
                  Save Objection Template
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'personas' ? (
          personas.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors duration-500">
              No personas defined yet. Add one to help the AI identify your prospects.
            </div>
          ) : (
            personas.map((persona) => (
              <div key={persona.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">{persona.name}</h3>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full font-medium">
                    {persona.role}
                  </span>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {persona.industry} • {persona.companySize}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Pain Points</h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                    {persona.painPoints.map((pt, i) => (
                      <li key={i} className="truncate">{pt}</li>
                    ))}
                  </ul>
                </div>
                <button 
                    onClick={() => setPersonas(personas.filter(p => p.id !== persona.id))}
                    className="mt-4 text-xs text-red-500 hover:text-red-700 active:scale-95 transition-transform"
                >
                    Delete
                </button>
              </div>
            ))
          )
        ) : (
          objections.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors duration-500">
              No objection templates defined yet. Add common objections to guide the AI's analysis.
            </div>
          ) : (
            objections.map((obj) => (
              <div key={obj.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                    {obj.category}
                  </span>
                </div>
                <p className="font-medium text-slate-900 dark:text-white mb-2">"{obj.trigger}"</p>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-1">Ideal Response</p>
                  <p className="text-sm text-emerald-900 dark:text-emerald-200 italic">"{obj.response}"</p>
                </div>
                 <button 
                    onClick={() => setObjections(objections.filter(o => o.id !== obj.id))}
                    className="mt-4 text-xs text-red-500 hover:text-red-700 active:scale-95 transition-transform"
                >
                    Delete
                </button>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
