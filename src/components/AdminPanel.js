import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import peopleData from '../people/people.json';
import coupledData from '../people/coupled.json';

const AdminPanel = () => {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [people, setPeople] = useState([]);
    const [coupled, setCoupled] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPeople(peopleData);
        setCoupled(coupledData);
        setLoading(false);
    }, []);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <p>Зареждане...</p>;

    const givers = coupled.map(c => c.giver.email);
    const receivers = coupled.map(c => c.receiver.email);
    const notPickedYet = people.filter(p => !givers.includes(p.email));
    const notReceivedYet = people.filter(p => !receivers.includes(p.email));

    const placeholderImg = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>🎄 Secret Santa - Админ Панел</h1>
                <button className="logout-button" onClick={handleLogout}>🚪 Изход</button>
            </div>

            <div className="admin-table">
                <h2>🎁 Кой на кого подарява</h2>
                {coupled.length === 0 ? (
                    <p>Все още няма изтеглени двойки.</p>
                ) : (
                    <div className="admin-cards-container">
                        {coupled.length === 0 ? (
                            <p>Все още няма изтеглени двойки.</p>
                        ) : (
                            coupled.map((pair, idx) => (
                                <div key={idx} className="admin-card">
                                    {/* Giver */}
                                    <div className="person-card">
                                        <img
                                            src={pair.giver.photoUrl || '/images/placeholder.png'}
                                            alt={pair.giver.name}
                                            className="profile-photo-small"
                                        />
                                        <div className="person-info">
                                            <p className="name">{pair.giver.name}</p>
                                            <p className="email">{pair.giver.email}</p>
                                        </div>
                                    </div>

                                    {/* Gift Icon */}
                                    <div className="gift-container">
                                        <img
                                            src="/Gift_Box_in_Red_PNG_Clipart-276.png"
                                            alt="Gift"
                                            className="gift-img"
                                        />
                                    </div>

                                    {/* Receiver */}
                                    <div className="person-card">
                                        <img
                                            src={pair.receiver.photoUrl || '/images/placeholder.png'}
                                            alt={pair.receiver.name}
                                            className="profile-photo-small"
                                        />
                                        <div className="person-info">
                                            <p className="name">{pair.receiver.name}</p>
                                            <p className="email">{pair.receiver.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                )}
            </div>

            <section className="admin-section">
                <h2>⏳ Хора, които още не са теглили</h2>
                {notPickedYet.length === 0 ? (
                    <p>Всички вече са теглили! 🎉</p>
                ) : (
                    <ul>
                        {notPickedYet.map((p, i) => (
                            <li key={i}>
                                <img
                                    src={p.photoUrl || placeholderImg}
                                    alt={p.name}
                                    className="profile-photo-small"
                                />{' '}
                                <p>{p.name} ({p.email})</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="admin-section">
                <h2>🎅 Хора, които още не са били изтеглени</h2>
                {notReceivedYet.length === 0 ? (
                    <p>Всички вече са изтеглени! 🎁</p>
                ) : (
                    <ul>
                        {notReceivedYet.map((p, i) => (
                            <li key={i}>
                                <img
                                    src={p.photoUrl || placeholderImg}
                                    alt={p.name}
                                    className="profile-photo-small"
                                />{' '}
                                <p>{p.name} ({p.email})</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default AdminPanel;
