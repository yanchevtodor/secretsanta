import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

const ProfileForm = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(null); // null = не е зареден
    const [drawResult, setDrawResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const placeholderImg = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    useEffect(() => {
        if (!user?.id) return; // Вече трябва да имаме уникален id от login

        const loadData = async () => {
            setLoading(true);
            try {
                // Зареждаме всички хора
                const peopleSnap = await getDocs(collection(db, "people"));
                const peopleList = peopleSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Зареждаме текущия потребител
                const userData = peopleList.find(p => p.id === user.id);
                if (!userData) throw new Error("Потребителят не е намерен!");

                setProfileData({
                    ...userData,
                    preferredGift: userData.preferredGift || '',
                    hobbies: userData.hobbies || '',
                    interests: userData.interests || '',
                    photoUrl: userData.photoUrl || placeholderImg
                });

                // Зареждаме всички двойки
                const coupledSnap = await getDocs(collection(db, "coupled"));
                const coupledList = coupledSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Търсим дали текущият user вече е изтеглил някого
                const match = coupledList.find(c => c.giverId === user.id);

                if (match) {
                    const receiverFull = peopleList.find(p => p.id === match.receiverId);
                    setDrawResult({
                        ...receiverFull,
                        preferredGift: receiverFull?.preferredGift || '',
                        hobbies: receiverFull?.hobbies || '',
                        interests: receiverFull?.interests || ''
                    });
                } else {
                    setDrawResult(null);
                }

            } catch (err) {
                console.error("Грешка при зареждане на профила:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!profileData?.id) return alert('Моля, влез първо.');

        try {
            setLoading(true);
            const userRef = doc(db, "people", profileData.id);
            await setDoc(userRef, profileData, { merge: true });

            setUser(profileData); // обновяваме UserContext
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('⚠️ Грешка при записа!');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return <h3>⚠️ Моля, влез в системата първо!</h3>;
    if (loading || !profileData) return <p className='loading'>⏳ Зареждане на профила...</p>;

    return (
        <div className="profile-form-container">
            <div className="profile-header">
                <button className="logout-button" onClick={handleLogout}>🚪 Изход</button>
            </div>
            <div className='pair'>
                <section className="profile-section">
                    <h3>Моят профил</h3>
                    <div className='result-card'>

                        <img
                            src={profileData.photoUrl}
                            alt={profileData.name}
                            className="profile-photo"
                        />
                        <h2>{profileData.name}</h2>
                        <p>{profileData.email}</p>

                        {!isEditing ? (
                            <div>
                                <p><strong>Предпочитан подарък:</strong> {profileData.preferredGift || '—'}</p>
                                <p><strong>Хобита:</strong> {profileData.hobbies || '—'}</p>
                                <p><strong>Интереси:</strong> {profileData.interests || '—'}</p>
                                <button onClick={() => setIsEditing(true)}>✏️ Редактирай</button>
                            </div>
                        ) : (
                            <div className="profile-edit">
                                <input
                                    name="preferredGift"
                                    value={profileData.preferredGift}
                                    onChange={handleChange}
                                    placeholder="Подарък..."
                                    type='text'
                                />
                                <textarea
                                    name="hobbies"
                                    value={profileData.hobbies}
                                    onChange={handleChange}
                                    placeholder="Хобита..."
                                    type='text'
                                />
                                <textarea
                                    name="interests"
                                    value={profileData.interests}
                                    onChange={handleChange}
                                    placeholder="Интереси..."
                                    type='text'
                                />
                                <button onClick={handleSave}>💾 Запази</button>
                                <button onClick={() => setIsEditing(false)}>❌ Откажи</button>
                            </div>
                        )}
                    </div>
                </section>
                <div className="gift-container">
                    <img src="/Gift_Box_in_Red_PNG_Clipart-276.png" alt="Gift" className="gift-img" />
                </div>
                <section className="draw-section">
                    <h3>Моят коледен колега</h3>
                    {drawResult ? (
                        <div className="result-card">
                            <img
                                src={drawResult.photoUrl}
                                alt={drawResult.name}
                                className="profile-photo"
                            />
                            <h2>{drawResult.name}</h2>
                            <p>{drawResult.email}</p>
                            <div>
                                <p><strong>Предпочитан подарък:</strong> {drawResult.preferredGift || 'няма въведени'}</p>
                                <p><strong>Интереси:</strong> {drawResult.interests || 'няма въведени'}</p>
                                <p><strong>Хобита:</strong> {drawResult.hobbies || 'няма въведени'}</p>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/random')}>Изтегли своя колега 🎁</button>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProfileForm;
