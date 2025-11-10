import React, { useEffect, useState } from 'react';
import peopleData from '../people/people.json';
import coupledData from '../people/coupled.json';

const AdminPanel = () => {
    const [people, setPeople] = useState([]);
    const [coupled, setCoupled] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Зареждаме данните от локалните JSON файлове
        setPeople(peopleData);
        setCoupled(coupledData);
        setLoading(false);
    }, []);

    if (loading) return <p>Зареждане...</p>;

    // Всички, които вече са теглили
    const givers = coupled.map(c => c.giver.email);

    // Всички, които вече са били изтеглени
    const receivers = coupled.map(c => c.receiver.email);

    // Хора, които още не са теглили
    const notPickedYet = people.filter(p => !givers.includes(p.email));

    // Хора, които още не са били изтеглени
    const notReceivedYet = people.filter(p => !receivers.includes(p.email));

    return (
        <div className="admin-panel">
            <h1>🎄 Secret Santa - Админ Панел</h1>

            <section className="admin-section">
                <h2>🎁 Кой на кого подарява</h2>
                {coupled.length === 0 ? (
                    <p>Все още няма изтеглени двойки.</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Дарител</th>
                                <th>Имейл</th>
                                <th>🎅 Получател</th>
                                <th>Имейл</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupled.map((pair, idx) => (
                                <tr key={idx}>
                                    <td>{pair.giver.name}</td>
                                    <td>{pair.giver.email}</td>
                                    <td>{pair.receiver.name}</td>
                                    <td>{pair.receiver.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section className="admin-section">
                <h2>⏳ Хора, които още не са теглили</h2>
                {notPickedYet.length === 0 ? (
                    <p>Всички вече са теглили! 🎉</p>
                ) : (
                    <ul>
                        {notPickedYet.map((p, i) => (
                            <li key={i}>{p.name} ({p.email})</li>
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
                            <li key={i}>{p.name} ({p.email})</li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default AdminPanel;
