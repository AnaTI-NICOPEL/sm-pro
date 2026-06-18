import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Send,
  Calendar,
  Tag,
  History,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  List,
  X,
  ClipboardList,
  Download,
  Users,
  Activity,
  FileText,
  RefreshCw,
  Play,
  MessageSquare,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [leadsSubTab, setLeadsSubTab] = useState('active'); // 'active' or 'logs'
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showManualLeadModal, setShowManualLeadModal] = useState(false);
  const [selectedLeadForReply, setSelectedLeadForReply] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [newLeadForm, setNewLeadForm] = useState({ phone: '', name: '', firstMessage: '' });
  const [inspectPayload, setInspectPayload] = useState(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/webhook-logs`);
      setWebhookLogs(response.data);
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchLeads(), fetchWebhookLogs()]);
    setTimeout(() => setIsRefreshing(false), 500); // Visual feedback duration
  };

  const handleCreateManualLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/leads`, {
        phone: newLeadForm.phone,
        name: newLeadForm.name,
        first_message: newLeadForm.firstMessage
      });
      setNewLeadForm({ phone: '', name: '', firstMessage: '' });
      setShowManualLeadModal(false);
      fetchLeads();
      alert('Lead criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar lead manual.');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Excluir somente este registro de medição? A conversa no SM Click não será alterada.')) return;
    try {
      await axios.delete(`${API_BASE}/leads/${id}`);
      fetchLeads();
    } catch (error) {
      alert('Erro ao excluir lead.');
    }
  };

  const handleClearAllLeads = async () => {
    if (!window.confirm('Apagar TODOS os registros locais de medição? Nenhuma conversa será encerrada ou alterada no SM Click.')) return;
    try {
      await axios.post(`${API_BASE}/leads/clear`);
      fetchLeads();
    } catch (error) {
      alert('Erro ao limpar leads.');
    }
  };

  const handleSimulateReply = async (e) => {
    e.preventDefault();
    if (!selectedLeadForReply) return;
    try {
      await axios.post(`${API_BASE}/leads/${selectedLeadForReply.id}/simulate-reply`, {
        reply_message: replyText
      });
      setReplyText('');
      setSelectedLeadForReply(null);
      setShowSimulateModal(false);
      fetchLeads();
      alert('Primeira mensagem da MARIA simulada e tempo calculado com sucesso!');
    } catch (error) {
      alert('Erro ao simular resposta.');
    }
  };

  const handleClearWebhookLogs = async () => {
    if (!window.confirm('Deseja limpar todos os logs de webhook?')) return;
    try {
      await axios.post(`${API_BASE}/webhook-logs/clear`);
      fetchWebhookLogs();
    } catch (error) {
      alert('Erro ao limpar logs.');
    }
  };
  const [importStatus, setImportStatus] = useState({
    status: 'idle',
    totalContacts: 0,
    contactsProcessed: 0,
    contactsSaved: 0,
    currentPage: 0,
    totalPages: 0,
    currentBatch: 0,
    totalBatches: 0,
    nextBatchTime: null,
    nextBatchCountdown: 0,
    elapsedTime: 0,
    logs: []
  });

  const fetchImportStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/import/status`);
      setImportStatus(response.data);
    } catch (error) {
      console.error('Error fetching import status:', error);
    }
  };

  useEffect(() => {
    let interval = null;
    if (activeTab === 'import' || importStatus.status === 'running' || importStatus.status === 'paused_delay') {
      fetchImportStatus();
      interval = setInterval(fetchImportStatus, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, importStatus.status]);

  const handleStartImport = async () => {
    try {
      await axios.post(`${API_BASE}/import/start`);
      fetchImportStatus();
    } catch (error) {
      alert('Erro ao iniciar importação.');
    }
  };

  const handleCancelImport = async () => {
    if (!window.confirm('Deseja realmente interromper a importação? O progresso até aqui é mantido no banco.')) return;
    try {
      await axios.post(`${API_BASE}/import/cancel`);
      fetchImportStatus();
    } catch (error) {
      alert('Erro ao interromper importação.');
    }
  };

  const handlePauseImport = async () => {
    try {
      await axios.post(`${API_BASE}/import/pause`);
      fetchImportStatus();
    } catch (error) {
      alert('Erro ao pausar importação.');
    }
  };

  const handleResumeImport = async () => {
    try {
      await axios.post(`${API_BASE}/import/resume`);
      fetchImportStatus();
    } catch (error) {
      alert('Erro ao retomar importação.');
    }
  };

  const [tags, setTags] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [fullLogs, setFullLogs] = useState([]);
  const [formData, setFormData] = useState({
    tags: [],
    content: '',
    scheduledAt: '',
    mediaName: '',
    mediaBase64: ''
  });
  const [loading, setLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [fileInputKey, setFileInputKey] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Filtros Histórico
  const [historyFilterText, setHistoryFilterText] = useState('');
  const [historyFilterStatus, setHistoryFilterStatus] = useState('all');
  const [historyFilterTag, setHistoryFilterTag] = useState('');

  // Filtros Logs
  const [logsFilterText, setLogsFilterText] = useState('');
  const [logsFilterStatus, setLogsFilterStatus] = useState('all');
  const [logsFilterTag, setLogsFilterTag] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData({ ...formData, mediaName: '', mediaBase64: '' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. O limite recomendado é 5MB.');
      e.target.value = '';
      setFormData({ ...formData, mediaName: '', mediaBase64: '' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        mediaName: file.name,
        mediaBase64: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, mediaName: '', mediaBase64: '' });
    setFileInputKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchTags();
    fetchSchedules();
    fetchFullLogs();
    setLogsPage(1);
    setHistoryPage(1);
    setHistoryFilterText('');
    setHistoryFilterStatus('all');
    setHistoryFilterTag('');
    setLogsFilterText('');
    setLogsFilterStatus('all');
    setLogsFilterTag('');
    
    if (activeTab === 'leads') {
      fetchLeads();
      fetchWebhookLogs();
    }
  }, [activeTab]);

  // Atualiza o cronômetro visual a cada segundo e consulta novas medições periodicamente.
  useEffect(() => {
    if (activeTab !== 'leads') return undefined;

    const clockInterval = window.setInterval(() => setClockNow(Date.now()), 1000);
    const refreshInterval = window.setInterval(() => {
      fetchLeads();
      fetchWebhookLogs();
    }, 5000);

    return () => {
      window.clearInterval(clockInterval);
      window.clearInterval(refreshInterval);
    };
  }, [activeTab]);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tags`);
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await axios.post(`${API_BASE}/tags`, { name: newTagName });
      setNewTagName('');
      fetchTags();
    } catch (error) {
      alert('Erro ao adicionar etiqueta. Verifique se ela já existe.');
    }
  };

  const handleDeleteTag = async (name) => {
    if (!window.confirm(`Excluir a etiqueta "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/tags/${name}`);
      fetchTags();
    } catch (error) {
      alert('Erro ao excluir etiqueta.');
    }
  };

  const handleEditTag = async (oldName) => {
    const newName = window.prompt('Novo nome para a etiqueta:', oldName);
    if (!newName || newName === oldName) return;
    
    try {
      await axios.put(`${API_BASE}/tags/${oldName}`, { newName });
      fetchTags();
    } catch (error) {
      alert('Erro ao editar etiqueta. O nome já pode estar em uso.');
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_BASE}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (!formData.tags || formData.tags.length === 0) {
        alert('Selecione pelo menos uma etiqueta.');
        setLoading(false);
        return;
      }
      if (!formData.content && !formData.mediaBase64) {
        alert('Por favor, digite uma mensagem ou anexe um arquivo.');
        setLoading(false);
        return;
      }
      await axios.post(`${API_BASE}/schedule`, formData);
      setFormData({ tags: [], content: '', scheduledAt: '', mediaName: '', mediaBase64: '' });
      setFileInputKey(prev => prev + 1);
      setPreviewContacts([]);
      fetchSchedules();
      alert('Mensagem agendada com sucesso!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao agendar mensagem.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async (id) => {
    if (loading) return;
    if (!window.confirm('Deseja enviar esta mensagem agora para todos os contatos da etiqueta?')) return;
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/disparar/${id}`);
      fetchSchedules();
      alert('Disparo iniciado com sucesso!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erro ao iniciar disparo.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (id) => {
    if (!window.confirm('Deseja realmente excluir este agendamento e todos os seus logs de envio? Esta ação não pode ser desfeita.')) return;
    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/cancelar/${id}`);
      fetchSchedules();
      fetchFullLogs();
      alert('Agendamento e logs excluídos com sucesso!');
    } catch (error) {
      alert('Erro ao excluir agendamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('ATENÇÃO: Deseja realmente APAGAR TODO O HISTÓRICO e TODOS OS LOGS de envio? Esta ação é definitiva e não poderá ser desfeita.')) return;
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/clear-history`);
      fetchSchedules();
      fetchFullLogs();
      alert('Todo o histórico e logs foram apagados com sucesso!');
    } catch (error) {
      alert('Erro ao limpar histórico.');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSchedule = async (id) => {
    if (loading) return;
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/pausar/${id}`);
      fetchSchedules();
    } catch (error) {
      alert('Erro ao pausar disparo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSchedule = async (id) => {
    if (loading) return;
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/retomar/${id}`);
      fetchSchedules();
    } catch (error) {
      alert('Erro ao retomar disparo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (messageId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/logs/${messageId}`);
      setSelectedLogs(response.data);
      setShowLogsModal(true);
    } catch (error) {
      alert('Erro ao carregar logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFullLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/logs`);
      setFullLogs(response.data);
    } catch (error) {
      console.error('Error fetching full logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEstimatedTime = (totalContacts) => {
    if (totalContacts === 0) return '0s';
    // 45 segundos de intervalo entre envios + 5s base para o primeiro
    const totalSeconds = ((totalContacts - 1) * 45) + 5; 
    
    if (totalSeconds < 60) return `${totalSeconds} segundos`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) return `${minutes}m ${seconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${seconds}s`;
  };

  const exportToExcel = (data, filename, columns) => {
    const formattedData = data.map(item => {
      const row = {};
      columns.forEach(col => {
        let val = item[col.key];
        if (col.format) val = col.format(val);
        row[col.header] = val;
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExportLogs = (filter = 'all') => {
    const columns = [
      { header: 'Data/Hora', key: 'sent_at', format: (v) => format(new Date(v), 'dd/MM/yyyy HH:mm:ss') },
      { header: 'Etiqueta', key: 'tag' },
      { header: 'Mensagem', key: 'content' },
      { header: 'Contato', key: 'contact_name' },
      { header: 'Telefone', key: 'contact_number' },
      { header: 'Status', key: 'status' },
      { header: 'Erro', key: 'error' }
    ];
    let data = fullLogs;
    if (filter === 'success') data = fullLogs.filter(l => l.status === 'success');
    if (filter === 'failed') data = fullLogs.filter(l => l.status === 'failed');
    if (data.length === 0) return alert('Nenhum log encontrado para este filtro.');
    exportToExcel(data, `logs_envio_${filter}`, columns);
  };

  const handleExportHistory = () => {
    const columns = [
      { header: 'ID', key: 'id' },
      { header: 'Etiqueta', key: 'tag' },
      { header: 'Mensagem', key: 'content' },
      { header: 'Data Agendada', key: 'scheduled_at', format: (v) => format(new Date(v), 'dd/MM/yyyy HH:mm') },
      { header: 'Status', key: 'status' }
    ];
    exportToExcel(schedules, 'historico_mensagens', columns);
  };

  const handleExportSpecificLogs = (filter = 'all') => {
    if (!selectedLogs || selectedLogs.length === 0) return;
    const columns = [
      { header: 'Data/Hora', key: 'sent_at', format: (v) => format(new Date(v), 'dd/MM/yyyy HH:mm:ss') },
      { header: 'Contato', key: 'contact_name' },
      { header: 'Telefone', key: 'contact_number' },
      { header: 'Status', key: 'status' },
      { header: 'Erro', key: 'error' }
    ];
    let data = selectedLogs;
    if (filter === 'success') data = selectedLogs.filter(l => l.status === 'success');
    if (filter === 'failed') data = selectedLogs.filter(l => l.status === 'failed');
    if (data.length === 0) return alert('Nenhum log encontrado para este filtro.');

    const safeTag = (data[0].tag || 'Sem_Etiqueta').replace(/[/\\?%*:|"<>]/g, '-');
    const dateStr = format(new Date(), 'dd-MM');
    exportToExcel(data, `LOGS ${safeTag} ${dateStr} ${filter.toUpperCase()}`, columns);
  };

  const renderFullLogs = () => {
    // Filtra logs em memória
    const filteredLogs = fullLogs.filter(log => {
      const matchText = logsFilterText === '' || 
        (log.contact_name || '').toLowerCase().includes(logsFilterText.toLowerCase()) ||
        (log.contact_number || '').toLowerCase().includes(logsFilterText.toLowerCase()) ||
        (log.content || '').toLowerCase().includes(logsFilterText.toLowerCase());
      const matchStatus = logsFilterStatus === 'all' || log.status === logsFilterStatus;
      const matchTag = logsFilterTag === '' || (log.tag || '').includes(logsFilterTag);
      return matchText && matchStatus && matchTag;
    });

    const totalLogsPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const currentLogs = filteredLogs.slice((logsPage - 1) * ITEMS_PER_PAGE, logsPage * ITEMS_PER_PAGE);

    const uniqueLogTags = [...new Set(fullLogs.map(l => l.tag).filter(Boolean))];

    return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Logs de Envio</h1>
          <p>Histórico completo de todas as mensagens processadas pelo sistema.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => handleExportLogs('success')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Download size={18} /> Sucessos
          </button>
          <button className="btn btn-secondary" onClick={() => handleExportLogs('failed')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Download size={18} /> Falhas
          </button>
          <button className="btn" onClick={() => handleExportLogs('all')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Download size={18} /> Tudo
          </button>
        </div>
      </header>

      {/* Barra de Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-control"
          style={{ flex: '1', minWidth: '180px', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          type="text"
          placeholder="Buscar por contato, telefone ou mensagem..."
          value={logsFilterText}
          onChange={e => { setLogsFilterText(e.target.value); setLogsPage(1); }}
        />
        <select
          className="form-control"
          style={{ width: '150px', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          value={logsFilterStatus}
          onChange={e => { setLogsFilterStatus(e.target.value); setLogsPage(1); }}
        >
          <option value="all">Todos os status</option>
          <option value="success">Enviado</option>
          <option value="failed">Falhou</option>
        </select>
        <select
          className="form-control"
          style={{ width: '180px', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          value={logsFilterTag}
          onChange={e => { setLogsFilterTag(e.target.value); setLogsPage(1); }}
        >
          <option value="">Todas as etiquetas</option>
          {uniqueLogTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(logsFilterText || logsFilterStatus !== 'all' || logsFilterTag) && (
          <button
            className="btn"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-dim)', background: 'none', border: '1px solid var(--border)' }}
            onClick={() => { setLogsFilterText(''); setLogsFilterStatus('all'); setLogsFilterTag(''); setLogsPage(1); }}
          >
            Limpar filtros
          </button>
        )}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          {filteredLogs.length} resultado(s)
        </span>
      </div>

      <div className="card glass">
        <div style={{ overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Etiqueta</th>
                <th>Mensagem</th>
                <th>Contato</th>
                <th>Telefone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map(log => (
                <tr key={log.id}>
                  <td>{format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm:ss')}</td>
                  <td><span className="status-badge status-pending" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)' }}>{log.tag}</span></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.content}
                  </td>
                  <td>{log.contact_name}</td>
                  <td>{log.contact_number}</td>
                  <td>
                    <span className={`status-badge status-${log.status}`}>
                      {log.status === 'success' ? 'Enviado' : 'Falhou'}
                    </span>
                    {log.error && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
                        {log.error}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    {fullLogs.length === 0 ? 'Nenhum log de envio registrado até o momento.' : 'Nenhum log encontrado para os filtros selecionados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredLogs.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              className="btn" 
              style={{ padding: '0.5rem 1rem' }}
              disabled={logsPage === 1} 
              onClick={() => setLogsPage(logsPage - 1)}
            >
              Anterior
            </button>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              Página {logsPage} de {totalLogsPages || 1}
            </span>
            <button 
              className="btn" 
              style={{ padding: '0.5rem 1rem' }}
              disabled={logsPage === totalLogsPages || totalLogsPages === 0} 
              onClick={() => setLogsPage(logsPage + 1)}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  )};

  const renderImportContacts = () => {
    const progressPercent = importStatus.totalContacts 
      ? Math.min(100, Math.round((importStatus.contactsProcessed / importStatus.totalContacts) * 100))
      : 0;

    const getStatusText = (status) => {
      switch (status) {
        case 'idle': return 'Ocioso';
        case 'running': return 'Importando contatos...';
        case 'paused_delay': return 'Intervalo de Segurança';
        case 'paused_user': return 'Pausado';
        case 'completed': return 'Concluído';
        case 'failed': return 'Falhou';
        case 'cancelled': return 'Cancelado';
        default: return status;
      }
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'idle': return 'status-badge status-pending';
        case 'running': return 'status-badge status-sending';
        case 'paused_delay': return 'status-badge status-paused';
        case 'paused_user': return 'status-badge status-paused';
        case 'completed': return 'status-badge status-success';
        case 'failed': return 'status-badge status-failed';
        case 'cancelled': return 'status-badge status-failed';
        default: return 'status-badge';
      }
    };

    const formatSeconds = (totalSecs) => {
      const minutes = Math.floor(totalSecs / 60);
      const remainingSecs = totalSecs % 60;
      if (minutes > 0) return `${minutes}m ${remainingSecs}s`;
      return `${remainingSecs}s`;
    };

    return (
      <div className="fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Importar Contatos do SM Click</h1>
            <p>Busca automática de contatos, filtragem e cadastro no PostgreSQL Neon.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['idle', 'completed', 'failed', 'cancelled'].includes(importStatus.status) ? (
              <button className="btn btn-primary" onClick={handleStartImport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <Download size={18} /> Iniciar Importação
              </button>
            ) : importStatus.status === 'paused_user' ? (
              <>
                <button className="btn btn-primary" onClick={handleResumeImport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                  <CheckCircle2 size={18} /> Retomar
                </button>
                <button className="btn" onClick={handleCancelImport} style={{ background: 'var(--danger)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                  <X size={18} /> Interromper
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={handlePauseImport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                  <Clock size={18} /> Pausar
                </button>
                <button className="btn" onClick={handleCancelImport} style={{ background: 'var(--danger)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                  <X size={18} /> Interromper
                </button>
              </>
            )}
          </div>
        </header>

        {/* Alerta de Pausa */}
        {importStatus.status === 'paused_delay' && (
          <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Clock size={24} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Intervalo de segurança ativo!</strong>
              <span>Aguardando para evitar sobrecarga. Próximo lote de 1000 contatos iniciará em <strong>{formatSeconds(importStatus.nextBatchCountdown)}</strong>.</span>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card glass">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Status da Importação</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className={getStatusBadgeClass(importStatus.status)} style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                {getStatusText(importStatus.status)}
              </span>
            </div>
          </div>

          <div className="card glass">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Contatos Analisados</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0' }}>
              {importStatus.contactsProcessed} / {importStatus.totalContacts}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Página {importStatus.currentPage} de {importStatus.totalPages}
            </span>
          </div>

          <div className="card glass">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Contatos Salvos (Com Tags)</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', color: 'var(--success)' }}>
              {importStatus.contactsSaved}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Cadastrados no PostgreSQL
            </span>
          </div>

          <div className="card glass">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Progresso dos Lotes</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0' }}>
              {importStatus.currentBatch} / {importStatus.totalBatches}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Lotes de 1000 contatos
            </span>
          </div>

          <div className="card glass">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Tempo Decorrido</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0' }}>
              {formatSeconds(importStatus.elapsedTime)}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Duração da importação
            </span>
          </div>

          <div className="card glass">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Tempo Restante Estimado</p>
            <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', color: 'var(--accent)' }}>
              {(() => {
                if (importStatus.status === 'idle') return 'Aguardando...';
                if (importStatus.status === 'completed') return 'Concluído';
                if (['failed', 'cancelled'].includes(importStatus.status)) return '-';
                
                const pagesLeft = Math.max(0, importStatus.totalPages - importStatus.currentPage + 1);
                const batchesLeft = Math.max(0, importStatus.totalBatches - importStatus.currentBatch);
                
                const apiTimeLeft = Math.ceil((pagesLeft / 10) * 0.6);
                const pauseTimeLeft = batchesLeft * 120;
                const currentPauseTime = importStatus.status === 'paused_delay' ? importStatus.nextBatchCountdown : 0;
                
                const totalSecondsLeft = apiTimeLeft + pauseTimeLeft + currentPauseTime;
                return formatSeconds(totalSecondsLeft);
              })()}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Previsão de conclusão
            </span>
          </div>

        </div>

        {/* Barra de Progresso */}
        {importStatus.status !== 'idle' && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Progresso Total</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--accent)' }}>{progressPercent}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  background: 'linear-gradient(90deg, var(--accent) 0%, #38bdf8 100%)', 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  transition: 'width 0.4s ease' 
                }} 
              />
            </div>
          </div>
        )}

        {/* Painel de Logs em tempo real */}
        <div className="card glass">
          <h3 style={{ marginBottom: '1rem' }}>Atividades em Tempo Real</h3>
          <div 
            style={{ 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: '8px', 
              padding: '1rem', 
              fontFamily: 'monospace', 
              fontSize: '0.85rem', 
              height: '250px', 
              overflowY: 'auto', 
              color: '#34d399', 
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column-reverse'
            }}
          >
            {importStatus.logs && importStatus.logs.length > 0 ? (
              importStatus.logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '0.25rem', whiteSpace: 'pre-wrap' }}>
                  {log}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '5rem 0' }}>
                Nenhuma atividade registrada. Clique em "Iniciar Importação" para começar.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (

    <div className="fade-in">
      <header>
        <h1>Dashboard</h1>
        <p>Visão geral dos disparos automáticos.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Mensagens Enviadas</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{fullLogs.filter(l => l.status === 'success').length}</h2>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Agendamentos Pendentes</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{schedules.filter(s => s.status === 'pending').length}</h2>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)' }}>
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="card glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Falhas de Envio</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{fullLogs.filter(l => l.status === 'failed').length}</h2>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Últimos Agendamentos</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Etiqueta</th>
              <th>Mensagem</th>
              <th>Data de Disparo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.slice(0, 5).map(schedule => (
              <tr key={schedule.id}>
                <td><span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tag size={14} /> {schedule.tag}</span></td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{schedule.content}</td>
                <td>{format(new Date(schedule.scheduled_at), 'dd/MM/yyyy HH:mm')}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`status-badge status-${schedule.status}`}>{schedule.status}</span>
                    <button 
                      className="btn-icon" 
                      title="Ver Logs de Envio"
                      onClick={() => fetchLogs(schedule.id)}
                    >
                      <List size={16} />
                    </button>
                    {(schedule.status === 'pending' || schedule.status === 'paused') && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {schedule.status === 'pending' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleSendNow(schedule.id)}
                            disabled={loading}
                          >
                            {loading ? 'Processando...' : 'Enviar Agora'}
                          </button>
                        )}
                        {schedule.status === 'paused' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleResumeSchedule(schedule.id)}
                            disabled={loading}
                          >
                            Retomar
                          </button>
                        )}
                        <button 
                          className="btn btn-icon btn-icon-danger" 
                          title="Cancelar Agendamento"
                          onClick={() => handleCancelSchedule(schedule.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {schedule.status === 'sending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handlePauseSchedule(schedule.id)}
                          disabled={loading}
                        >
                          Pausar
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const [previewContacts, setPreviewContacts] = useState([]);

  const fetchPreviewContacts = async (selectedTags) => {
    if (!selectedTags || selectedTags.length === 0) {
      setPreviewContacts([]);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE}/contacts?tags=${encodeURIComponent(selectedTags.join(','))}`);
      setPreviewContacts(response.data);
    } catch (error) {
      console.error('Error fetching preview contacts:', error);
    }
  };

  const renderNewMessage = () => (
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
              Esta mensagem será enviada para os seguintes contatos com as etiquetas <strong>{formData.tags.join(', ')}</strong>:
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
                        <td>{contact.name}</td>
                        <td style={{ color: 'var(--accent)' }}>{contact.number}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
                        Nenhum contato encontrado com esta etiqueta.
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

  const renderTags = () => (
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

  const formatResponseTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '-';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  const renderLeadsMonitoring = () => {
    const measuredLeads = leads.filter(lead => lead.answered_at && lead.response_time !== null);
    const waitingLeads = leads.filter(lead => !lead.answered_at);
    const avgSeconds = measuredLeads.length > 0
      ? Math.round(measuredLeads.reduce((sum, lead) => sum + Number(lead.response_time || 0), 0) / measuredLeads.length)
      : null;
    const fastestSeconds = measuredLeads.length > 0
      ? Math.min(...measuredLeads.map(lead => Number(lead.response_time || 0)))
      : null;
    const overFiveMinutes = measuredLeads.filter(lead => Number(lead.response_time) > 300).length;

    return (
      <div className="fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Monitoramento de Leads</h1>
            <p>
              Calcula o intervalo entre a primeira mensagem do cliente e a primeira mensagem da atendente <strong>MARIA</strong>.
              Nenhuma conversa é encerrada pelo sistema.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} /> {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowManualLeadModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem' }}
            >
              <Play size={16} /> Simular Novo Lead
            </button>
            <button
              className="btn"
              onClick={leadsSubTab === 'active' ? handleClearAllLeads : handleClearWebhookLogs}
              style={{
                border: '1px solid var(--danger)',
                borderRadius: '8px',
                color: 'var(--danger)',
                background: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem 1rem'
              }}
            >
              <Trash2 size={16} /> Limpar Registros
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1.5rem' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              borderBottom: leadsSubTab === 'active' ? '2px solid var(--accent)' : '2px solid transparent',
              color: leadsSubTab === 'active' ? 'var(--accent)' : 'var(--text-dim)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: leadsSubTab === 'active' ? 'bold' : 'normal',
              fontSize: '0.95rem'
            }}
            onClick={() => setLeadsSubTab('active')}
          >
            Medições ({leads.length})
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              borderBottom: leadsSubTab === 'logs' ? '2px solid var(--accent)' : '2px solid transparent',
              color: leadsSubTab === 'logs' ? 'var(--accent)' : 'var(--text-dim)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: leadsSubTab === 'logs' ? 'bold' : 'normal',
              fontSize: '0.95rem'
            }}
            onClick={() => setLeadsSubTab('logs')}
          >
            Logs do Webhook ({webhookLogs.length})
          </button>
        </div>

        {leadsSubTab === 'active' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="card glass">
                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Total de medições</p>
                <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{leads.length}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Registros mantidos no painel</span>
              </div>
              <div className="card glass" style={{ borderLeft: '3px solid var(--warning)' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Aguardando a MARIA</p>
                <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--warning)' }}>{waitingLeads.length}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Cronômetros ainda em andamento</span>
              </div>
              <div className="card glass" style={{ borderLeft: '3px solid var(--success)' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Tempos calculados</p>
                <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--success)' }}>{measuredLeads.length}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Primeira mensagem da MARIA registrada</span>
              </div>
              <div className="card glass" style={{ borderLeft: '3px solid var(--accent)' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Tempo médio</p>
                <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--accent)' }}>
                  {avgSeconds !== null ? formatResponseTime(avgSeconds) : '-'}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Mais rápido: {fastestSeconds !== null ? formatResponseTime(fastestSeconds) : '-'} · Acima de 5 min: {overFiveMinutes}
                </span>
              </div>
            </div>

            <div className="card glass" style={{ marginBottom: '2rem', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Activity size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)' }}>Webhook do SM Click</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
                    O evento <strong>new-chat</strong> registra o primeiro horário. Esse mesmo endpoint também precisa receber o evento da mensagem enviada pela atendente para localizar a primeira mensagem da <strong>MARIA</strong> e calcular a diferença.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <code style={{ flex: 1, minWidth: '260px', padding: '0.5rem 0.75rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '6px', fontSize: '0.85rem', color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {window.location.origin}/api/webhook/smclick
                    </code>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/webhook/smclick`);
                        alert('Link copiado!');
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                  <p style={{ margin: '0.75rem 0 0', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Nome monitorado: <strong>MARIA</strong>. Mensagens de robôs ou de outros atendentes são ignoradas. Os payloads recebidos ficam disponíveis na aba de logs para conferência.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Medições de primeira resposta</h3>
              <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Primeira mensagem do cliente</th>
                      <th>Recebida em</th>
                      <th>Situação da medição</th>
                      <th>Primeira mensagem da MARIA</th>
                      <th>Tempo calculado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => {
                      const measured = Boolean(lead.answered_at && lead.response_time !== null);
                      const elapsed = measured
                        ? Number(lead.response_time)
                        : Math.max(0, Math.round((clockNow - new Date(lead.created_at).getTime()) / 1000));

                      return (
                        <tr key={lead.id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{lead.customer_name}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{lead.customer_phone}</span>
                            </div>
                          </td>
                          <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span
                              style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--accent)' }}
                              onClick={() => setSelectedLeadDetails(lead)}
                            >
                              {lead.first_message || '-'}
                            </span>
                          </td>
                          <td>{format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm:ss')}</td>
                          <td>
                            <span className={`status-badge ${measured ? 'status-success' : 'status-pending'}`}>
                              {measured ? 'Tempo calculado' : 'Aguardando MARIA'}
                            </span>
                          </td>
                          <td>
                            {lead.answered_at ? format(new Date(lead.answered_at), 'dd/MM/yyyy HH:mm:ss') : '-'}
                          </td>
                          <td>
                            {!measured ? (
                              <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={14} className="spin-slow" /> Em andamento ({formatResponseTime(elapsed)})
                              </span>
                            ) : (
                              <span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatResponseTime(elapsed)}</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => setSelectedLeadDetails(lead)}
                              >
                                <Eye size={12} /> Ver
                              </button>
                              {!measured && (
                                <button
                                  className="btn btn-primary"
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                  onClick={() => {
                                    setSelectedLeadForReply(lead);
                                    setShowSimulateModal(true);
                                  }}
                                >
                                  <MessageSquare size={12} /> Simular MARIA
                                </button>
                              )}
                              <button
                                className="btn-icon btn-icon-danger"
                                onClick={() => handleDeleteLead(lead.id)}
                                title="Excluir somente a medição local"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                          Nenhuma medição registrada. O painel aguardará o primeiro webhook new-chat.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h3>Histórico de webhooks recebidos (últimos 100)</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Confira o nome do atendente e o resultado aplicado a cada payload.
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Evento</th>
                    <th>Telefone</th>
                    <th>Atendente</th>
                    <th>Processamento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {webhookLogs.map(log => (
                    <tr key={log.id}>
                      <td>{format(new Date(log.received_at), 'dd/MM/yyyy HH:mm:ss')}</td>
                      <td>
                        <span className="status-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)' }}>
                          {log.event_type}
                        </span>
                      </td>
                      <td>{log.customer_phone || '-'}</td>
                      <td>{log.attendant_name || '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{log.processing_result || '-'}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => setInspectPayload(log)}
                        >
                          <FileText size={12} /> Inspecionar payload
                        </button>
                      </td>
                    </tr>
                  ))}
                  {webhookLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                        Nenhum payload recebido. Configure o endpoint no SM Click e faça um teste.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const totalHistoryPages = Math.ceil(schedules.length / ITEMS_PER_PAGE);
  const currentSchedules = schedules.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <Send size={24} />
          <span>SM Click Pro</span>
        </div>

        <nav className="nav-links">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            <Activity size={20} />
            <span>Monitoramento</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <Download size={20} />
            <span>Importar Contatos</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`}
            onClick={() => setActiveTab('tags')}
          >
            <Tag size={20} />
            <span>Etiquetas</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <Calendar size={20} />
            <span>Agendar</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={20} />
            <span>Histórico</span>
          </div>
          <div
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <ClipboardList size={20} />
            <span>Logs de Envio</span>
          </div>

          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'import' && renderImportContacts()}
        {activeTab === 'tags' && renderTags()}

        {activeTab === 'new' && renderNewMessage()}
        {activeTab === 'history' && (
          <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1>Histórico de Mensagens</h1>
                <p>Todas as mensagens agendadas e seus respectivos status.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {schedules.length > 0 && (
                  <button className="btn" onClick={handleClearAllHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', background: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} /> Limpar Histórico e Logs
                  </button>
                )}
                <button className="btn" onClick={handleExportHistory} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                  <Download size={18} /> Exportar
                </button>
              </div>
            </header>

            {/* Barra de Filtros Histórico */}
            {schedules.length > 0 && (() => {
              const uniqueHistoryTags = [...new Set(schedules.map(s => s.tag).filter(Boolean))];
              return (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    className="form-control"
                    style={{ flex: '1', minWidth: '180px', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                    type="text"
                    placeholder="Buscar por mensagem..."
                    value={historyFilterText}
                    onChange={e => { setHistoryFilterText(e.target.value); setHistoryPage(1); }}
                  />
                  <select
                    className="form-control"
                    style={{ width: '160px', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                    value={historyFilterStatus}
                    onChange={e => { setHistoryFilterStatus(e.target.value); setHistoryPage(1); }}
                  >
                    <option value="all">Todos os status</option>
                    <option value="pending">Pendente</option>
                    <option value="sending">Enviando</option>
                    <option value="sent">Enviado</option>
                    <option value="failed">Falhou</option>
                    <option value="paused">Pausado</option>
                  </select>
                  <select
                    className="form-control"
                    style={{ width: '180px', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                    value={historyFilterTag}
                    onChange={e => { setHistoryFilterTag(e.target.value); setHistoryPage(1); }}
                  >
                    <option value="">Todas as etiquetas</option>
                    {uniqueHistoryTags.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {(historyFilterText || historyFilterStatus !== 'all' || historyFilterTag) && (
                    <button
                      className="btn"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-dim)', background: 'none', border: '1px solid var(--border)' }}
                      onClick={() => { setHistoryFilterText(''); setHistoryFilterStatus('all'); setHistoryFilterTag(''); setHistoryPage(1); }}
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              );
            })()}
            <div className="card">
              {(() => {
                const filteredSchedules = schedules.filter(s => {
                  const matchText = historyFilterText === '' ||
                    (s.content || '').toLowerCase().includes(historyFilterText.toLowerCase()) ||
                    (s.tag || '').toLowerCase().includes(historyFilterText.toLowerCase());
                  const matchStatus = historyFilterStatus === 'all' || s.status === historyFilterStatus;
                  const matchTag = historyFilterTag === '' || (s.tag || '').includes(historyFilterTag);
                  return matchText && matchStatus && matchTag;
                });
                const totalHistoryPages = Math.ceil(filteredSchedules.length / 10);
                const currentSchedules = filteredSchedules.slice((historyPage - 1) * 10, historyPage * 10);

                return (
                  <>
                    {(historyFilterText || historyFilterStatus !== 'all' || historyFilterTag) && (
                      <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {filteredSchedules.length} resultado(s) encontrado(s)
                      </div>
                    )}
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Etiqueta</th>
                          <th>Mensagem</th>
                          <th>Data Agendada</th>
                          <th>Envios</th>
                          <th>Duração</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSchedules.map(schedule => (
                          <tr key={schedule.id}>
                            <td><Tag size={14} /> {schedule.tag}</td>
                            <td>{schedule.content}</td>
                            <td>{format(new Date(schedule.scheduled_at), 'dd/MM/yyyy HH:mm')}</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: '130px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{schedule.total_count || 0} total</span>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                                  <span style={{ color: 'var(--success)' }}>
                                    {schedule.success_count || 0} sucessos
                                  </span>
                                  <span style={{ color: 'var(--danger)' }}>
                                    {schedule.failed_count || 0} falhas
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              {schedule.start_time && schedule.end_time ? (
                                (() => {
                                  const start = new Date(schedule.start_time);
                                  const end = new Date(schedule.end_time);
                                  const diffSecs = Math.max(0, Math.round((end - start) / 1000));
                                  if (diffSecs < 60) return `${diffSecs}s`;
                                  const mins = Math.floor(diffSecs / 60);
                                  const secs = diffSecs % 60;
                                  if (mins < 60) return `${mins}m ${secs}s`;
                                  const hours = Math.floor(mins / 60);
                                  const remainingMins = mins % 60;
                                  return `${hours}h ${remainingMins}m ${secs}s`;
                                })()
                              ) : (
                                <span style={{ color: 'var(--text-dim)' }}>-</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span className={`status-badge status-${schedule.status}`}>{schedule.status}</span>
                                <button 
                                  className="btn-icon" 
                                  title="Ver Logs de Envio"
                                  onClick={() => fetchLogs(schedule.id)}
                                >
                                  <List size={16} />
                                </button>
                                {schedule.status === 'pending' && (
                                  <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    onClick={() => handleSendNow(schedule.id)}
                                    disabled={loading}
                                  >
                                    {loading ? 'Processando...' : 'Enviar Agora'}
                                  </button>
                                )}
                                {schedule.status === 'paused' && (
                                  <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    onClick={() => handleResumeSchedule(schedule.id)}
                                    disabled={loading}
                                  >
                                    Retomar
                                  </button>
                                )}
                                {schedule.status === 'sending' && (
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    onClick={() => handlePauseSchedule(schedule.id)}
                                    disabled={loading}
                                  >
                                    Pausar
                                  </button>
                                )}
                                {schedule.status !== 'sending' && (
                                  <button 
                                    className="btn btn-icon btn-icon-danger" 
                                    title="Excluir Agendamento e Logs"
                                    onClick={() => handleCancelSchedule(schedule.id)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredSchedules.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                              {schedules.length === 0 ? 'Nenhum agendamento encontrado.' : 'Nenhum resultado para os filtros selecionados.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {filteredSchedules.length > 10 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '0.5rem 1rem' }}
                          disabled={historyPage === 1} 
                          onClick={() => setHistoryPage(historyPage - 1)}
                        >
                          Anterior
                        </button>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
                          Página {historyPage} de {totalHistoryPages || 1}
                        </span>
                        <button 
                          className="btn" 
                          style={{ padding: '0.5rem 1rem' }}
                          disabled={historyPage === totalHistoryPages || totalHistoryPages === 0} 
                          onClick={() => setHistoryPage(historyPage + 1)}
                        >
                          Próxima
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
        {activeTab === 'leads' && renderLeadsMonitoring()}
        {activeTab === 'logs' && renderFullLogs()}
        {activeTab === 'settings' && (
          <div className="fade-in">
            <header>
              <h1>Configurações</h1>
              <p>Ajuste sua integração com o SM Click.</p>
            </header>
            <div className="card" style={{ maxWidth: '600px' }}>
              <div className="form-group">
                <label>API Key</label>
                <input type="password" className="form-control" value="••••••••••••••••" readOnly />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Configurada com a variável SMCLICK_API_KEY no servidor.</p>
              </div>
              <div className="form-group">
                <label>Base URL</label>
                <input type="text" className="form-control" defaultValue="https://api.smclick.com.br" />
              </div>
              <button className="btn btn-primary">Salvar Alterações</button>
            </div>
          </div>
        )}
      </main>

      {showLogsModal && selectedLogs && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h3>Detalhes do Envio</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => handleExportSpecificLogs('success')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <Download size={16} /> Sucessos
                </button>
                <button className="btn btn-secondary" onClick={() => handleExportSpecificLogs('failed')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <Download size={16} /> Falhas
                </button>
                <button className="btn btn-primary" onClick={() => handleExportSpecificLogs('all')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <Download size={16} /> Tudo
                </button>
                <button className="btn-icon" onClick={() => setShowLogsModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Contato</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.contact_name}</td>
                      <td>{log.contact_number}</td>
                      <td>
                        <span className={`status-badge status-${log.status}`}>
                          {log.status === 'success' ? 'Enviado' : 'Falhou'}
                        </span>
                        {log.error && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '0.25rem' }}>
                            {log.error}
                          </div>
                        )}
                      </td>
                      <td>{format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm:ss')}</td>
                    </tr>
                  ))}
                  {selectedLogs.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                        Nenhum log encontrado. O disparo pode estar pendente ou em processamento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Simular primeira mensagem da MARIA */}
      {showSimulateModal && selectedLeadForReply && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Simular primeira mensagem da MARIA</h3>
              <button className="btn-icon" onClick={() => { setShowSimulateModal(false); setSelectedLeadForReply(null); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSimulateReply}>
              <div className="modal-body" style={{ padding: '1rem 0' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                  Simule somente o horário e o conteúdo da primeira mensagem da atendente <strong>MARIA</strong> para <strong>{selectedLeadForReply.customer_name}</strong> ({selectedLeadForReply.customer_phone}). Isso não envia mensagem nem encerra conversa.
                </p>
                <div className="form-group">
                  <label>Primeira mensagem da MARIA</label>
                  <textarea
                    className="form-control"
                    placeholder="Ex: Olá! Como posso te ajudar hoje?"
                    required
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'end', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  type="button"
                  onClick={() => { setShowSimulateModal(false); setSelectedLeadForReply(null); }}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit">
                  Registrar simulação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Simular Novo Lead */}
      {showManualLeadModal && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Simular Entrada de Lead</h3>
              <button className="btn-icon" onClick={() => setShowManualLeadModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateManualLead}>
              <div className="modal-body" style={{ padding: '1rem 0' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                  Simule a chegada de um novo lead que iniciou uma conversa no WhatsApp (gatilho do webhook).
                </p>
                <div className="form-group">
                  <label>Telefone / WhatsApp</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 5511999999999"
                    required
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nome do Cliente</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: João da Silva"
                    required
                    value={newLeadForm.name}
                    onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Mensagem de Entrada</label>
                  <textarea
                    className="form-control"
                    placeholder="Ex: Gostaria de saber mais sobre o produto..."
                    required
                    value={newLeadForm.firstMessage}
                    onChange={e => setNewLeadForm({ ...newLeadForm, firstMessage: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'end', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-secondary" 
                  type="button" 
                  onClick={() => setShowManualLeadModal(false)}
                >
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit">
                  Criar Lead Simulado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes da Conversa do Lead */}
      {selectedLeadDetails && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Detalhes do Lead</h3>
              <button className="btn-icon" onClick={() => setSelectedLeadDetails(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>CLIENTE</span>
                  <strong>{selectedLeadDetails.customer_name}</strong>
                  <span style={{ fontSize: '0.875rem', display: 'block', color: 'var(--accent)' }}>{selectedLeadDetails.customer_phone}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>TEMPO DE RESPOSTA</span>
                  <strong>
                    {selectedLeadDetails.answered_at
                      ? formatResponseTime(selectedLeadDetails.response_time)
                      : 'Aguardando a primeira mensagem da MARIA...'}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '12px 12px 12px 0', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                    Cliente em {format(new Date(selectedLeadDetails.created_at), 'dd/MM/yyyy HH:mm:ss')}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    {selectedLeadDetails.first_message || 'Novo chat iniciado'}
                  </p>
                </div>

                {selectedLeadDetails.answered_at ? (
                  <div style={{ alignSelf: 'flex-end', maxWidth: '85%', background: 'rgba(59, 130, 246, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px 12px 0 12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', display: 'block', marginBottom: '0.25rem', textAlign: 'right' }}>
                      Primeira mensagem da MARIA em {format(new Date(selectedLeadDetails.answered_at), 'dd/MM/yyyy HH:mm:ss')}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                      {selectedLeadDetails.maria_message}
                    </p>
                  </div>
                ) : (
                  <div style={{ alignSelf: 'center', margin: '1rem 0', color: 'var(--warning)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="spin-slow" /> Aguardando a primeira mensagem da MARIA...
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedLeadDetails(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inspecionar Payload Webhook */}
      {inspectPayload && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Inspeção de Webhook</h3>
              <button className="btn-icon" onClick={() => setInspectPayload(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1rem 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>EVENTO</span>
                  <strong style={{ color: 'var(--accent)' }}>{inspectPayload.event_type}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>PROCESSAMENTO</span>
                  <strong>{inspectPayload.processing_result || '-'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>ATENDENTE</span>
                  <strong>{inspectPayload.attendant_name || '-'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>RECEBIDO EM</span>
                  <strong>{format(new Date(inspectPayload.received_at), 'dd/MM/yyyy HH:mm:ss')}</strong>
                </div>
              </div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                JSON Bruto Recebido (Payload)
              </label>
              <pre style={{ 
                background: 'rgba(0,0,0,0.4)', 
                padding: '1rem', 
                borderRadius: '8px', 
                overflow: 'auto', 
                maxHeight: '350px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#34d399',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {JSON.stringify(JSON.parse(inspectPayload.payload), null, 2)}
              </pre>
            </div>
            <div style={{ display: 'flex', justifyContent: 'end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setInspectPayload(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
