'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, Filter, Search, Loader } from 'lucide-react';

export default function ActiveChats() {
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/active-chats');
            const allChats = res.data.chats || [];
            
            // Filtra os ativos (se a API já não trouxe filtrado)
            const activeChats = allChats.filter(chat => 
                chat.status === 'active' || chat.status === 'open' || !chat.status
            );

            setChats(activeChats);
            
            // Extrai departamentos unicos
            const deps = new Set();
            activeChats.forEach(chat => {
                const depName = getDepartmentName(chat);
                if (depName) deps.add(depName);
            });
            setDepartments(Array.from(deps).sort());
            setFilteredChats(activeChats);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar os chats ativos.');
        } finally {
            setLoading(false);
        }
    };

    const getDepartmentName = (chat) => {
        if (!chat) return 'Sem Departamento';
        if (typeof chat.department === 'string') return chat.department;
        if (chat.department && chat.department.name) return chat.department.name;
        if (chat.departmentName) return chat.departmentName;
        return 'Sem Departamento';
    };

    const getContactName = (chat) => {
        if (!chat) return 'Desconhecido';
        if (chat.contact && chat.contact.name) return chat.contact.name;
        if (chat.contactName) return chat.contactName;
        if (chat.name) return chat.name;
        return 'Desconhecido';
    };

    const getContactPhone = (chat) => {
        if (!chat) return 'N/A';
        if (chat.contact && (chat.contact.number || chat.contact.whatsapp)) return chat.contact.number || chat.contact.whatsapp;
        if (chat.contactPhone) return chat.contactPhone;
        if (chat.phone) return chat.phone;
        if (chat.whatsapp) return chat.whatsapp;
        return 'N/A';
    };

    const getAttendantName = (chat) => {
        if (!chat) return 'Sem Atendente';
        if (typeof chat.user === 'string') return chat.user;
        if (chat.user && chat.user.name) return chat.user.name;
        if (chat.attendantName) return chat.attendantName;
        return 'Sem Atendente';
    };

    useEffect(() => {
        let result = chats;

        if (selectedDepartment) {
            result = result.filter(chat => getDepartmentName(chat) === selectedDepartment);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(chat => 
                getContactName(chat).toLowerCase().includes(query) || 
                getContactPhone(chat).includes(query)
            );
        }

        setFilteredChats(result);
    }, [selectedDepartment, searchQuery, chats]);

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Chats Ativos</h1>
                    <p>Liste e filtre os chats que estão atualmente ativos no SM Click.</p>
                </div>
                <button className="btn btn-primary" onClick={fetchChats} disabled={loading}>
                    Atualizar Lista
                </button>
            </header>

            <div className="card glass" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            <Search size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Buscar Contato
                        </label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Nome ou telefone..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            <Filter size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/> Filtrar por Departamento
                        </label>
                        <select 
                            className="form-control"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            <option value="">Todos os Departamentos</option>
                            {departments.map(dep => (
                                <option key={dep} value={dep}>{dep}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <MessageCircle size={20} color="var(--accent)" />
                        Resultados ({filteredChats.length})
                    </h3>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                        <Loader size={32} className="spin" style={{ marginBottom: '1rem' }} />
                        <p>Buscando chats ativos...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nome do Cliente</th>
                                    <th>Telefone</th>
                                    <th>Departamento</th>
                                    <th>Atendente</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredChats.length > 0 ? (
                                    filteredChats.map((chat, i) => (
                                        <tr key={chat.id || i}>
                                            <td>{getContactName(chat)}</td>
                                            <td style={{ color: 'var(--accent)' }}>{getContactPhone(chat)}</td>
                                            <td>
                                                <span style={{ 
                                                    background: 'rgba(255,255,255,0.05)', 
                                                    padding: '0.2rem 0.5rem', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {getDepartmentName(chat)}
                                                </span>
                                            </td>
                                            <td>{getAttendantName(chat)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
                                            Nenhum chat ativo encontrado com os filtros atuais.
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
