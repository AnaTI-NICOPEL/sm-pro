'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    apiKey: '',
    baseUrl: 'https://api.smclick.com.br'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/settings', settings);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <header>
        <h1>Configurações do Sistema</h1>
        <p>Ajuste as credenciais de acesso à API do SM Click.</p>
      </header>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
          <SettingsIcon size={24} />
          <h3 style={{ margin: 0 }}>Credenciais da API</h3>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-dim)' }}>Carregando configurações...</p>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>API Key (SM Click)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Insira sua chave de API"
                required
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem', display: 'block' }}>
                Você pode encontrar ou gerar sua API Key no painel do SM Click.
              </span>
            </div>

            <div className="form-group">
              <label>URL Base da API</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: https://api.smclick.com.br"
                required
                value={settings.baseUrl}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem', display: 'block' }}>
                O padrão geralmente é https://api.smclick.com.br
              </span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : <><Save size={18} /> Salvar Configurações</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
