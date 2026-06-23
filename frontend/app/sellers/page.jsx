'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Users, Clock, MessageSquare, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSellerId, setExpandedSellerId] = useState(null);
  const [sellerChats, setSellerChats] = useState({});
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [newSeller, setNewSeller] = useState({ name: '', attendant_id: '', department_id: '', photo_base64: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingSellerId, setEditingSellerId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [startDate, endDate]);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`/api/sellers/dashboard?start=${startDate}&end=${endDate}`);
      setDashboardData(res.data);
    console.log('Dashboard data fetched:', res.data);
      const sellersRes = await axios.get('/api/sellers');
      setSellers(sellersRes.data);
    console.log('Sellers list fetched:', sellersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async (sellerId, page = 1) => {
    try {
      const res = await axios.get(`/api/sellers/${sellerId}/chats?page=${page}&start=${startDate}&end=${endDate}`);
      setSellerChats(prev => ({ ...prev, [sellerId]: res.data }));
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const toggleSeller = (sellerId) => {
    if (expandedSellerId === sellerId) {
      setExpandedSellerId(null);
    } else {
      setExpandedSellerId(sellerId);
      if (!sellerChats[sellerId]) {
        loadChats(sellerId, 1);
      }
    }
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      if (editingSellerId) {
        await axios.put(`/api/sellers/${editingSellerId}`, newSeller);
      } else {
        await axios.post('/api/sellers', newSeller);
      }
      setShowModal(false);
      setEditingSellerId(null);
      setNewSeller({ name: '', attendant_id: '', department_id: '', photo_base64: '' });
      fetchDashboard();
    } catch (error) {
      console.error('Error saving seller:', error);
      alert(error.response?.data?.error || 'Erro ao salvar vendedor');
    }
  };

  const openEditModal = (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (seller) {
      setEditingSellerId(seller.id);
      setNewSeller({ name: seller.name, attendant_id: seller.attendant_id, department_id: seller.department_id || '', photo_base64: seller.photo_base64 || '' });
      setShowModal(true);
    }
  };

  const handleDeleteSeller = async (sellerId) => {
    if (!confirm('Tem certeza que deseja excluir este vendedor?')) return;
    try {
      await axios.delete(`/api/sellers/${sellerId}`);
      fetchDashboard();
    } catch (error) {
      console.error('Error deleting seller:', error);
      alert('Erro ao excluir vendedor');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSeller({ ...newSeller, photo_base64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatResponseTime = (seconds) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard de Vendedores</h1>
          <p>Monitoramento e ranking de atendimento por vendedor.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingSellerId(null); setNewSeller({ name: '', attendant_id: '', department_id: '', photo_base64: '' }); setShowModal(true); }}>
          + Cadastrar Vendedor
        </button>
      </header>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Data Inicial</label>
          <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Data Final</label>
          <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Ranking Lateral */}
        <div className="card glass">
          <h3>Ranking de Vendedores</h3>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dashboardData.sort((a, b) => a.avg_response_time - b.avg_response_time).map((data, index) => (
              <div key={data.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--text-dim)' }}>
                  #{index + 1}
                </div>
                {data.photo_base64 ? (
                  <img src={data.photo_base64} alt={data.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{data.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Tempo Médio: {formatResponseTime(data.avg_response_time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de Vendedores */}
        <div className="card">
          <h3>Métricas por Vendedor</h3>
          <table className="data-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Chats Abertos</th>
                <th>Chats Respondidos</th>
                <th>Tempo Médio</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.map(data => (
                <React.Fragment key={data.id}>
                  <tr 
                    style={{ cursor: 'pointer', background: expandedSellerId === data.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}
                    onClick={() => toggleSeller(data.id)}
                  >
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {expandedSellerId === data.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {data.name}
                    </td>
                    <td>{data.total_chats}</td>
                    <td>{data.answered_chats}</td>
                    <td style={{ color: 'var(--accent)' }}>{formatResponseTime(data.avg_response_time)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon" onClick={() => openEditModal(data.id)} title="Editar"><Edit2 size={16} /></button>
                      <button className="btn-icon btn-icon-danger" onClick={() => handleDeleteSeller(data.id)} title="Excluir"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                  
                  {/* Expanded Chats View */}
                  {expandedSellerId === data.id && (
                    <tr>
                      <td colSpan="5" style={{ padding: 0 }}>
                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Últimos Chats ({data.name})</h4>
                          {sellerChats[data.id] ? (
                            <table className="data-table" style={{ background: 'transparent' }}>
                              <thead>
                                <tr>
                                  <th>Cliente</th>
                                  <th>Data</th>
                                  <th>Tempo Resposta</th>
                                  <th>1ª Mensagem (MARIA)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sellerChats[data.id].chats.map(chat => (
                                  <tr key={chat.id}>
                                    <td>{chat.customer_name} ({chat.customer_phone})</td>
                                    <td>{format(new Date(chat.created_at), 'dd/MM/yyyy HH:mm')}</td>
                                    <td>{formatResponseTime(chat.response_time)}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {chat.maria_message || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-dim)' }}>Carregando chats...</div>
                          )}
                          
                          {/* Pagination controls */}
                          {sellerChats[data.id] && sellerChats[data.id].totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                              <button 
                                className="btn btn-secondary" 
                                disabled={sellerChats[data.id].page === 1}
                                onClick={() => loadChats(data.id, sellerChats[data.id].page - 1)}
                              >Anterior</button>
                              <span style={{ display: 'flex', alignItems: 'center' }}>
                                Página {sellerChats[data.id].page} de {sellerChats[data.id].totalPages}
                              </span>
                              <button 
                                className="btn btn-secondary" 
                                disabled={sellerChats[data.id].page === sellerChats[data.id].totalPages}
                                onClick={() => loadChats(data.id, sellerChats[data.id].page + 1)}
                              >Próxima</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {dashboardData.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    Nenhum vendedor encontrado ou dados insuficientes no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Vendedor */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingSellerId ? 'Editar Vendedor' : 'Cadastrar Vendedor'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={handleAddSeller}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome do Vendedor</label>
                  <input type="text" className="form-control" required value={newSeller.name} onChange={e => setNewSeller({...newSeller, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>ID do Atendente (SM Click)</label>
                  <input type="text" className="form-control" required value={newSeller.attendant_id} onChange={e => setNewSeller({...newSeller, attendant_id: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>ID do Departamento (SM Click)</label>
                  <input type="text" className="form-control" required value={newSeller.department_id} onChange={e => setNewSeller({...newSeller, department_id: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Foto (Opcional)</label>
                  <input type="file" className="form-control" accept="image/*" onChange={handlePhotoUpload} />
                  {newSeller.photo_base64 && <img src={newSeller.photo_base64} style={{ marginTop: '1rem', width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingSellerId ? 'Salvar Alterações' : 'Salvar Vendedor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
