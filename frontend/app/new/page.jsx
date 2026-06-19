'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Clock, Tag } from 'lucide-react';

export default function NewSchedule() {
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState({ tags: [], content: '', scheduledAt: '', mediaName: '', mediaBase64: '' });
  const [previewContacts, setPreviewContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

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

  const fetchPreviewContacts = async (selectedTags) => {
    if (!selectedTags || selectedTags.length === 0) {
      setPreviewContacts([]);
      return;
    }
    try {
      const response = await axios.get(`/api/contacts?tags=${encodeURIComponent(selectedTags.join(','))}`);
      setPreviewContacts(response.data);
    } catch (error) {
      console.error('Error fetching preview contacts:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("O arquivo não pode ser maior que 5MB.");
      handleRemoveFile();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      let base64String = reader.result;
      const base64Data = base64String.split(',')[1];
      setFormData({
        ...formData,
        mediaName: file.name,
        mediaBase64: base64Data
      });
    };
    reader.onerror = error => {
      console.error("Error reading file:", error);
      alert("Erro ao ler o arquivo.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, mediaName: '', mediaBase64: '' });
    setFileInputKey(Date.now());
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (formData.tags.length === 0) {
      alert('Selecione pelo menos uma etiqueta.');
      return;
    }
    if (!formData.content && !formData.mediaBase64) {
      alert('Digite uma mensagem ou anexe um arquivo.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/schedules', formData);
      alert('Mensagem agendada com sucesso!');
      setFormData({ tags: [], content: '', scheduledAt: '', mediaName: '', mediaBase64: '' });
      setPreviewContacts([]);
      setFileInputKey(Date.now());
    } catch (err) {
      console.error(err);
      alert('Erro ao agendar mensagem.');
    } finally {
      setLoading(false);
    }
  };

  const formatEstimatedTime = (contactsCount) => {
    const seconds = contactsCount * 45;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="fade-in">
      <header>
        <h1>Novo Agendamento</h1>
        <p>Configure sua mensagem automática por etiqueta.</p>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1', minWidth: '350px', maxWidth: '600px' }}>
          <form onSubmit={handleSchedule}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Selecione a(s) Etiqueta(s)</label>
                {formData.tags.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData({ ...formData, tags: [] });
                      setPreviewContacts([]);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    Limpar Seleção
                  </button>
                )}
              </div>
              <div className="tags-checkboxes" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                {tags.length === 0 && <span style={{color: 'var(--text-dim)', fontSize: '0.875rem'}}>Nenhuma etiqueta disponível</span>}
                {tags.map(tag => (
                  <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      value={tag}
                      checked={formData.tags.includes(tag)}
                      onChange={(e) => {
                        const newTags = e.target.checked 
                          ? [...formData.tags, tag] 
                          : formData.tags.filter(t => t !== tag);
                        setFormData({ ...formData, tags: newTags });
                        fetchPreviewContacts(newTags);
                      }}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                Mensagem
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'normal' }}>Use {'{nome}'} para citar o cliente</span>
              </label>
              <textarea
                className="form-control"
                placeholder="Ex: Olá {nome}, tudo bem? (Opcional se houver anexo)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Data e Hora do Disparo</label>
              <input
                type="datetime-local"
                className="form-control"
                required
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Anexar Arquivo (Opcional - máx 5MB)</label>
                {formData.mediaName && (
                  <button 
                    type="button" 
                    onClick={handleRemoveFile}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    Limpar Arquivo
                  </button>
                )}
              </div>
              <input
                key={fileInputKey}
                type="file"
                className="form-control"
                onChange={handleFileChange}
                accept="image/*,application/pdf,video/mp4"
                style={{ padding: '0.4rem' }}
              />
              {formData.mediaName && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)' }}>
                  Arquivo selecionado: {formData.mediaName}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Agendando...' : <><Send size={18} /> Agendar Mensagem</>}
            </button>
          </form>
        </div>

        {formData.tags && formData.tags.length > 0 && (
          <div className="card glass" style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Tag size={18} /> Contatos ({previewContacts.length})
              </h3>
              {previewContacts.length > 0 && (
                <div style={{ textAlign: 'right', background: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tempo Estimado</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {formatEstimatedTime(previewContacts.length)}
                  </span>
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              Esta mensagem será enviada para os contatos com as etiquetas: <strong>{formData.tags.join(', ')}</strong>
            </p>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {previewContacts.length > 0 ? (
                    previewContacts.map((contact, i) => (
                      <tr key={i}>
                        <td>{contact.nome}</td>
                        <td style={{ color: 'var(--accent)' }}>{contact.telefone}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
                        Nenhum contato encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
