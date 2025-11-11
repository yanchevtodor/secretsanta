import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const LoginForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [error, setError] = useState('');
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    // 🔹 Автоматично пренасочване, ако user вече е логнат
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/profile');
            }
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const name = formData.name.trim().toLowerCase();
        const email = formData.email.trim().toLowerCase();

        try {
            // 🧠 Проверка за админ
            if (name === 'тодор янчев' && email === 'admin@admin.com') {
                setUser({ name: formData.name, email: formData.email, role: 'admin' });
                return;
            }

            // 🔹 Зареждаме хората от API или локален fallback
            let people = [];
            try {
                const res = await fetch('http://localhost:5000/api/people');
                if (!res.ok) throw new Error('Server unavailable');
                people = await res.json();
            } catch {
                const localPeople = await import('../people/people.json');
                people = localPeople.default || localPeople;
            }

            // 🔹 Проверка за съществуващ потребител
            const exactUser = people.find(
                p =>
                    p.name.trim().toLowerCase() === name &&
                    p.email.trim().toLowerCase() === email
            );

            if (!exactUser) {
                setError('❌ Няма потребител с това име и имейл.');
                return;
            }

            // ✅ Влизаме успешно
            setUser(exactUser);
            setFormData({ name: '', email: '' });
        } catch (err) {
            console.error('Грешка при проверката на потребителя:', err);
            setError('⚠️ Проблем при проверката. Опитайте пак.');
        }
    };

    return (
        <div className="login-form-container">
            <h3>Вход</h3>
            <form onSubmit={handleSubmit} className="form-style">
                <div className="form-group">
                    <label>Име:</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Имейл:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button className="submit-button">Вход</button>
            </form>
        </div>
    );
};

export default LoginForm;
