import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

const RandomPicker = () => {
    const { user, setUser, loadingUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [people, setPeople] = useState([]);
    const [coupled, setCoupled] = useState([]);
    const [randomColleague, setRandomColleague] = useState(null);
    const [isPicking, setIsPicking] = useState(false);

    // Зареждаме хората
    useEffect(() => {
        const loadPeople = async () => {
            try {
                const peopleSnapshot = await getDocs(collection(db, 'people'));
                const peopleList = peopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setPeople(peopleList);

                // Ако user няма id, добавяме го от списъка
                if (user && !user.id) {
                    const currentUser = peopleList.find(p => p.email === user.email && p.name === user.name);
                    if (currentUser) {
                        setUser(prev => ({ ...prev, id: currentUser.id }));
                    }
                }
            } catch (err) {
                console.error('Грешка при зареждане на хората:', err);
            }
        };
        loadPeople();
    }, [user, setUser]);

    // Зареждаме вече изтеглените двойки
    useEffect(() => {
        const loadCoupled = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'coupled'));
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCoupled(list);
            } catch (err) {
                console.error('Грешка при зареждане на двойките:', err);
            }
        };
        loadCoupled();
    }, []);

    useEffect(() => {
        if (!loadingUser && !user) navigate('/login');
    }, [user, loadingUser, navigate]);

    const pickRandomColleague = async () => {
        if (!user?.id) return alert('Няма идентификатор за текущия потребител!');

        // Взема вече изтеглените receiverId-та от current user
        const alreadyPicked = coupled.filter(c => c.giverId === user.id).map(c => c.receiverId);

        const availablePeople = people.filter(
            p => p.id !== user.id && !alreadyPicked.includes(p.id)
        );

        if (availablePeople.length === 0) {
            alert('Всички колеги вече са изтеглени! 🎅');
            return;
        }

        setIsPicking(true);

        setTimeout(async () => {
            const randomIndex = Math.floor(Math.random() * availablePeople.length);
            const selected = availablePeople[randomIndex];

            const pair = {
                giverId: user.id,
                giverName: user.name,
                giverEmail: user.email,
                receiverId: selected.id,
                receiverName: selected.name,
                receiverEmail: selected.email
            };

            try {
                await addDoc(collection(db, 'coupled'), pair);
                setCoupled(prev => [...prev, pair]);
                setRandomColleague(selected);

                // Обновяваме user context с последно изтегления
                setUser(prev => ({
                    ...prev,
                    lastPicked: { name: selected.name, email: selected.email, id: selected.id }
                }));

                setIsPicking(false);
                navigate('/profile');
            } catch (err) {
                console.error('Грешка при запис на двойката:', err);
                setIsPicking(false);
            }
        }, 500);
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
