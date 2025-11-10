import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import peopleData from '../people/people.json';
import coupledData from '../people/coupled.json';

const RandomPicker = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [people, setPeople] = useState([]);
    const [coupled, setCoupled] = useState([]);
    const [randomColleague, setRandomColleague] = useState(null);
    const [isPicking, setIsPicking] = useState(false);

    useEffect(() => {
        // Зареждаме локалните данни
        setPeople(peopleData);
        setCoupled(coupledData);
    }, []);

    const pickRandomColleague = () => {
        if (!user) {
            alert('Моля, влез с акаунта си първо!');
            return;
        }

        // Вземаме имейлите на вече избраните
        const alreadyPickedEmails = coupled.map(c => c.receiver.email);

        // Филтрираме: себе си и вече изтеглените
        const availablePeople = people.filter(
            p => p.email !== user.email && !alreadyPickedEmails.includes(p.email)
        );

        if (availablePeople.length === 0) {
            alert('Всички колеги вече са изтеглени! 🎅');
            return;
        }

        setIsPicking(true);

        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * availablePeople.length);
            const selected = availablePeople[randomIndex];
            setRandomColleague(selected);
            setIsPicking(false);

            // Добавяме двойката в state (ако искаш да се вижда веднага)
            setCoupled(prev => [
                ...prev,
                {
                    giver: { name: user.name, email: user.email },
                    receiver: selected
                }
            ]);

            // Ако имаш бекенд за запис, можеш тук да го извикаш
            // fetch('http://localhost:5000/api/save-coupled', ...)

            // navigate('/profile'); // Можеш да го редиректнеш, ако желаеш
        }, 1000);
    };

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
