'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Tag, CheckCircle2, XCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/logs', {
        params: {
          page,
          limit: 100,
          status: filter,
          search
        }
      });
      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchInput);
      if (page !== 1) setPage(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1>Logs de Envio</h1>
          <p>Histórico detalhado de todas as mensagens disparadas.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar por telefone..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ paddingLeft: '35px', minWidth: '220px' }}
            />
          </div>
          <select 
            className="form-control" 
            value={filter} 
            onChange={handleFilterChange}
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
          <>
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
                  {(logs || []).map(log => (
                    <tr key={log.id}>
                      <td>
                        {(() => {
                          try {
                            if (!log.sent_at) return '-';
                            const d = new Date(log.sent_at);
                            if (isNaN(d.getTime())) return '-';
                            return format(d, 'dd/MM/yyyy HH:mm:ss');
                          } catch (e) {
                            return '-';
                          }
                        })()}
                      </td>
                      <td style={{ fontWeight: '500' }}>{log.contact_number}</td>
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
                        {log.error || 'Enviado com sucesso'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {log.smclick_message_id || '-'}
                      </td>
                    </tr>
                  ))}
                  {(logs || []).length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                        Nenhum log encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                  Mostrando total de {total} registros
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={handlePrevPage} 
                    disabled={page === 1}
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span style={{ fontSize: '0.9rem', margin: '0 0.5rem' }}>
                    Página {page} de {totalPages}
                  </span>
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleNextPage} 
                    disabled={page === totalPages}
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
