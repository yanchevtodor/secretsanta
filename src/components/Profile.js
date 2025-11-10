import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const ProfileForm = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        preferredGift: '',
        hobbies: '',
        interests: ''
    });
    const [drawResult, setDrawResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🧠 Зареждаме данни за профила и изтегления колега
    useEffect(() => {
        if (!user?.email) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // 1️⃣ Зареждаме people.json
                const peopleRes = await fetch('http://localhost:5000/api/people');
                const people = await peopleRes.json();
                const existing = people.find(p => p.email === user.email);
                if (existing) {
                    setProfileData({
                        preferredGift: existing.preferredGift || '',
                        hobbies: existing.hobbies || '',
                        interests: existing.interests || ''
                    });
                    setUser(prev => ({ ...prev, ...existing }));
                }

                // 2️⃣ Проверяваме дали има изтеглен колега
                const coupleRes = await fetch(`http://localhost:5000/api/get-coupled/${user.email}`);
                const coupleData = await coupleRes.json();
                if (coupleData.found) {
                    setDrawResult(coupleData.receiver);
                } else {
                    setDrawResult(null);
                }
            } catch (err) {
                console.error('Грешка при зареждане на профила:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.email, setUser]);

    // 🖊️ Промяна в инпутите
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    // 💾 Запазваме профила
    const handleSave = async () => {
        if (!user?.email) return alert('Моля, влез първо.');

        const updatedUser = { ...user, ...profileData };
        try {
            setLoading(true);
            await fetch('http://localhost:5000/api/update-person', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            });

            setUser(updatedUser);
            alert('✅ Профилът е запазен успешно!');
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('⚠️ Грешка при записа!');
        } finally {
            setLoading(false);
        }
    };

    // 🚪 Излизане от акаунта
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) {
        return <h3>⚠️ Моля, влез в системата първо!</h3>;
    }

    return (
        <div className="profile-form-container">
            <div className="profile-header">
                <h2>👤 Профил на {user.name}</h2>
                <button className="logout-button" onClick={handleLogout}>🚪 Изход</button>
            </div>

            {loading && <p>⏳ Зареждане...</p>}

            {/* 🧾 МОЯТ ПРОФИЛ */}
            <section className="profile-section">
                <h3>🧾 Моите данни</h3>

                {!isEditing ? (
                    <div>
                        <p><strong>Предпочитан подарък:</strong> {profileData.preferredGift || '—'}</p>
                        <p><strong>Хобита:</strong> {profileData.hobbies || '—'}</p>
                        <p><strong>Интереси:</strong> {profileData.interests || '—'}</p>
                        <button className="edit-button" onClick={() => setIsEditing(true)}>✏️ Редактирай</button>
                    </div>
                ) : (
                    <div className="profile-edit">
                        <div className="form-group">
                            <label>Предпочитан подарък:</label>
                            <input
                                name="preferredGift"
                                value={profileData.preferredGift}
                                onChange={handleChange}
                                placeholder="Книга, шоколад, сувенир..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Хобита:</label>
                            <textarea
                                name="hobbies"
                                value={profileData.hobbies}
                                onChange={handleChange}
                                placeholder="Фотография, готвене, спорт..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Интереси:</label>
                            <textarea
                                name="interests"
                                value={profileData.interests}
                                onChange={handleChange}
                                placeholder="Изкуство, технологии, кино..."
                            />
                        </div>
                        <button className="submit-button" onClick={handleSave}>💾 Запази</button>
                        <button className="cancel-button" onClick={() => setIsEditing(false)}>❌ Откажи</button>
                    </div>
                )}
            </section>

            <hr style={{ margin: '20px 0' }} />

            {/* 🎁 МОЯТ КОЛЕДЕН КОЛЕГА */}
            <section className="draw-section">
                <h3>🎅 Моят коледен колега</h3>

                {drawResult ? (
                    <div className="result-card">
                        <p><strong>Име:</strong> {drawResult.name}</p>
                        <p><strong>Имейл:</strong> {drawResult.email}</p>
                        <p><strong>Интереси:</strong> {drawResult.interests || 'няма въведени'}</p>
                        <p><strong>Хобита:</strong> {drawResult.hobbies || 'няма въведени'}</p>
                    </div>
                ) : (
                    <div>
                        <p>🎁 Все още не си изтеглил колега!</p>
                        <button className="submit-button" onClick={() => navigate('/random')}>
                            Изтегли своя колега
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProfileForm;
