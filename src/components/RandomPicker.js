import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import peopleData from '../people/people.json';

const RandomPicker = () => {
    const { user, setUser, loadingUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [people, setPeople] = useState([]);
    const [coupled, setCoupled] = useState([]);
    const [randomColleague, setRandomColleague] = useState(null);
    const [isPicking, setIsPicking] = useState(false);

    // Зареждаме хората
    useEffect(() => {
        setPeople(peopleData);
        setCoupled([]); // Ако имаш API, може да fetch-неш тук
    }, []);

    // Redirect към login ако няма user
    useEffect(() => {
        if (!loadingUser && !user) {
            navigate('/login');
        }
    }, [user, loadingUser, navigate]);

    const pickRandomColleague = async () => {
        if (!user) return;

        const alreadyPickedEmails = coupled.map(c => c.receiver.email);

        const availablePeople = people.filter(
            p => p.email !== user.email && !alreadyPickedEmails.includes(p.email)
        );

        if (availablePeople.length === 0) {
            alert('Всички колеги вече са изтеглени! 🎅');
            return;
        }

        setIsPicking(true);

        setTimeout(async () => {
            const randomIndex = Math.floor(Math.random() * availablePeople.length);
            const selected = availablePeople[randomIndex];

            // Записваме само името и имейла
            const pair = {
                giver: {
                    name: user.name,
                    email: user.email,
                    photoUrl: user.photoUrl
                },
                receiver: {
                    name: selected.name,
                    email: selected.email,
                    photoUrl: selected.photoUrl
                }
            };

            try {
                await fetch('http://localhost:5000/api/save-coupled', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pair })
                });
            } catch (err) {
                console.error('Грешка при записа на двойката:', err);
            }

            // Обновяваме локалния state
            setCoupled(prev => [...prev, pair]);
            setRandomColleague(selected);

            // Обновяваме user с последния избран колега (само името и имейла)
            setUser(prev => ({
                ...prev,
                lastPicked: {
                    name: selected.name,
                    email: selected.email,
                    photoUrl: selected.photoUrl
                }
            }));

            setIsPicking(false);

            // Навигация към профила
            navigate('/profile');
        }, 1000);
    };

    if (loadingUser || !user) return <p>⏳ Зареждане...</p>;

    return (
        <div className="random-picker-container">
            <h2>Коледен Рандомайзер 🎅</h2>

            <button onClick={pickRandomColleague} disabled={isPicking}>
                {isPicking ? 'Избирам...' : 'Изтегли Колега!'}
            </button>

            {randomColleague && (
                <div className="result-card">
                    <h3>Избран колега:</h3>
                    <p><strong>{randomColleague.name}</strong></p>
                    <p>{randomColleague.email}</p>
                </div>
            )}
        </div>
    );
};

export default RandomPicker;
