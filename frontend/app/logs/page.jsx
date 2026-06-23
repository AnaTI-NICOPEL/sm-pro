'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Tag, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'success') return log.status === 'success';
    if (filter === 'failed') return log.status === 'failed';
    return true;
  });

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Logs de Envio</h1>
          <p>Histórico detalhado de todas as mensagens disparadas.</p>
        </div>
        <div>
          <select 
            className="form-control" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="all">Todos os Status</option>
            <option value="success">Sucesso</option>
            <option value="failed">Falhas</option>
          </select>
        </div>
      </header>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            <Clock size={24} className="spin-slow" style={{ marginBottom: '1rem' }} />
            <p>Carregando logs...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Mensagem do Sistema</th>
                  <th>ID Mensagem (SM Click)</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>{format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm:ss')}</td>
                    <td style={{ fontWeight: '500' }}>{log.telefone}</td>
                    <td>
                      {log.status === 'success' ? (
                        <span className="status-badge status-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}>
                          <CheckCircle2 size={14} /> Sucesso
                        </span>
                      ) : (
                        <span className="status-badge status-failed" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}>
                          <XCircle size={14} /> Falha
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: log.status === 'failed' ? 'var(--danger)' : 'var(--text-dim)', maxWidth: '250px', whiteSpace: 'normal' }}>
                      {log.error_message || 'Enviado com sucesso'}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {log.smclick_message_id || '-'}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                      Nenhum log encontrado para o filtro selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
