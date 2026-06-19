'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Edit2, Trash2 } from 'lucide-react';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await axios.get('/api/tags');
      setTags(res.data.map(t => t.name));
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await axios.post('/api/tags', { name: newTagName });
      setNewTagName('');
      fetchTags();
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar etiqueta. Pode já existir.');
    }
  };

  const handleEditTag = async (oldTag) => {
    const newName = prompt('Novo nome para a etiqueta:', oldTag);
    if (!newName || newName === oldTag) return;
    try {
      await axios.put(`/api/tags/${oldTag}`, { newName });
      fetchTags();
    } catch (err) {
      console.error(err);
      alert('Erro ao editar etiqueta.');
    }
  };

  const handleDeleteTag = async (tag) => {
    if (!confirm(`Excluir etiqueta "${tag}"?`)) return;
    try {
      await axios.delete(`/api/tags/${tag}`);
      fetchTags();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir etiqueta.');
    }
  };

  return (
    <div className="fade-in">
      <header>
        <h1>Gerenciar Etiquetas</h1>
        <p>Cadastre manualmente as etiquetas que deseja utilizar para os disparos.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Adicionar Nova Etiqueta</h3>
          <form onSubmit={handleAddTag}>
            <div className="form-group">
              <label>Nome da Etiqueta</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: quinzenal, rota-segunda"
                required
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Cadastrar Etiqueta
            </button>
          </form>
        </div>

        <div className="card glass">
          <h3 style={{ marginBottom: '1.5rem' }}>Etiquetas Cadastradas</h3>
          <div className="tags-list">
            {tags.map(tag => (
              <div key={tag} className="tag-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Tag size={18} className="text-accent" />
                  <span style={{ fontWeight: '500' }}>{tag}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleEditTag(tag)}
                    className="btn-icon"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteTag(tag)}
                    className="btn-icon btn-icon-danger"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {tags.length === 0 && (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                Nenhuma etiqueta cadastrada.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
