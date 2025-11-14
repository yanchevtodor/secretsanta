import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
const AdminPanel = () => {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [people, setPeople] = useState([]);
    const [coupled, setCoupled] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPerson, setEditingPerson] = useState(null);
    const [newPerson, setNewPerson] = useState({ name: '', email: '', photoUrl: '' });
    const [activeTab, setActiveTab] = useState('couples');

    const placeholderImg = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const peopleSnapshot = await getDocs(collection(db, 'people'));
                const peopleList = peopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPeople(peopleList);

                const coupledSnapshot = await getDocs(collection(db, 'coupled'));
                const coupledList = coupledSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCoupled(coupledList);
            } catch (err) {
                console.error('Грешка при зареждането на данни:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getPhoto = (id) => {
        const person = people.find(p => p.id === id);
        return person?.photoUrl || placeholderImg;
    };

    const pickedIds = coupled.map(c => c.giverId);
    const receivedIds = coupled.map(c => c.receiverId);
    const notPickedYet = people.filter(p => !pickedIds.includes(p.id));
    const notReceivedYet = people.filter(p => !receivedIds.includes(p.id));

    // Функции за управление на хора
    const handleEdit = (person) => setEditingPerson(person);
    const handleSaveEdit = async () => {
        if (!editingPerson) return;
        try {
            const userRef = doc(db, 'people', editingPerson.id);
            await setDoc(userRef, editingPerson, { merge: true });
            setPeople(prev => prev.map(p => p.id === editingPerson.id ? editingPerson : p));
            setEditingPerson(null);
        } catch (err) {
            console.error('Грешка при записа на промяната:', err);
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Сигурни ли сте, че искате да изтриете този човек?')) return;
        try {
            await deleteDoc(doc(db, 'people', id));
            setPeople(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Грешка при изтриване:', err);
        }
    };
    const handleAddPerson = async () => {
        if (!newPerson.name || !newPerson.email) return alert('Името и имейлът са задължителни!');
        try {
            const docRef = await addDoc(collection(db, 'people'), newPerson);
            setPeople(prev => [...prev, { id: docRef.id, ...newPerson }]);
            setNewPerson({ name: '', email: '', photoUrl: '' });
        } catch (err) {
            console.error('Грешка при добавянето:', err);
        }
    };

    if (loading) return <p>Зареждане...</p>;

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>🎄 Secret Santa - Админ Панел</h1>
                <button className="logout-button" onClick={handleLogout}>🚪 Изход</button>
            </div>

            <div className="tabs">
                <button
                    className={activeTab === 'couples' ? 'active' : ''}
                    onClick={() => setActiveTab('couples')}
                >
                    🎁 Двойки
                </button>
                <button
                    className={activeTab === 'pending' ? 'active' : ''}
                    onClick={() => setActiveTab('pending')}
                >
                    ⏳ Неизтеглени
                </button>
                <button
                    className={activeTab === 'people' ? 'active' : ''}
                    onClick={() => setActiveTab('people')}
                >
                    👥 Всички хора
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'couples' && (
                    <div className="admin-table">
                        <h2>🎁 Кой на кого подарява</h2>
                        {coupled.length === 0 ? <p>Все още няма изтеглени двойки.</p> : (
                            <div className="admin-cards-container">
                                {coupled.map((pair, idx) => (
                                    <div key={idx} className="admin-card">
                                        <div className="person-card">
                                            <img src={getPhoto(pair.giverId)} alt={pair.giverName} className="profile-photo-small" />
                                            <div className="person-info">
                                                <p className="name">{pair.giverName}</p>
                                                <p className="email">{pair.giverEmail}</p>
                                            </div>
                                        </div>

                                        <div className="gift-container">
                                            <img src="/Gift_Box_in_Red_PNG_Clipart-276.png" alt="Gift" className="gift-img" />
                                        </div>

                                        <div className="person-card">
                                            <img src={getPhoto(pair.receiverId)} alt={pair.receiverName} className="profile-photo-small" />
                                            <div className="person-info">
                                                <p className="name">{pair.receiverName}</p>
                                                <p className="email">{pair.receiverEmail}</p>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div className="admin-section long-list">
                        <div>
                            <h2>⏳ Хора, които още не са теглили</h2>
                            {notPickedYet.length === 0 ? <p>Всички вече са теглили! 🎉</p> : (
                                <ul>
                                    {notPickedYet.map((p) => (
                                        <li key={p.id}>
                                            <img src={p.photoUrl || placeholderImg} alt={p.name} className="profile-photo-small" />{' '}
                                            <p>{p.name}</p>
                                            <p>{p.email}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <h2>🎅 Хора, които още не са били изтеглени</h2>
                            {notReceivedYet.length === 0 ? <p>Всички вече са изтеглени! 🎁</p> : (
                                <ul>
                                    {notReceivedYet.map((p) => (
                                        <li key={p.id}>
                                            <img src={p.photoUrl || placeholderImg} alt={p.name} className="profile-photo-small" />{' '}
                                            <p>{p.name}</p>
                                            <p>{p.email}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'people' && (
                    <div className="admin-section">
                        <h2>👥 Всички хора</h2>
                        <ul>
                            {people.map(p => (
                                <li key={p.id} className="person-item">
                                    <img src={p.photoUrl || placeholderImg} alt={p.name} className="profile-photo-small" />
                                    <input
                                        type="text"
                                        value={editingPerson?.id === p.id ? editingPerson.name : p.name}
                                        disabled={editingPerson?.id !== p.id}
                                        onChange={(e) => setEditingPerson(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                    <input
                                        type="email"
                                        value={editingPerson?.id === p.id ? editingPerson.email : p.email}
                                        disabled={editingPerson?.id !== p.id}
                                        onChange={(e) => setEditingPerson(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                    {editingPerson?.id === p.id ? (
                                        <button onClick={handleSaveEdit}>💾</button>
                                    ) : (
                                        <button onClick={() => handleEdit(p)}>✏️</button>
                                    )}
                                    <button onClick={() => handleDelete(p.id)}>🗑️</button>
                                </li>
                            ))}
                        </ul>

                        <h3>➕ Добавяне на нов човек</h3>
                        <input
                            type="text"
                            placeholder="Име"
                            value={newPerson.name}
                            onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <input
                            type="email"
                            placeholder="Имейл"
                            value={newPerson.email}
                            onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
                        />
                        <input
                            type="text"
                            placeholder="Снимка URL"
                            value={newPerson.photoUrl}
                            onChange={(e) => setNewPerson(prev => ({ ...prev, photoUrl: e.target.value }))}
                        />
                        <button onClick={handleAddPerson}>Добави човек</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
