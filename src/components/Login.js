import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const LoginForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [error, setError] = useState('');
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    // Автоматично пренасочване, ако user вече е логнат
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else navigate('/profile');
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

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();

        try {
            // Проверка за админ
            if (name.toLowerCase() === 'тодор янчев' && email === 'admin@admin.com') {
                setUser({ name, email, role: 'admin' });
                return;
            }

            // Създаваме ключ: name-email
            const key = name.toLowerCase().replace(/\s+/g, '-') + '-' + email;
            const docRef = doc(db, 'people', key);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                setError('❌ Няма потребител с това име и имейл.');
                return;
            }

            const userData = docSnap.data();
            setUser({ id: docSnap.id, ...userData });
            setFormData({ name: '', email: '' });

        } catch (err) {
            console.error('Грешка при проверката на потребителя:', err);
            setError('⚠️ Проблем при проверката. Опитайте пак.');
        }
    };

    return (
        <div className="login-form-container">

            <div className='info'>
                <h3>Добре дошли</h3>
                <p>Моля попълнете две имена и служебният си имейл</p>
            </div>
            <br />
            <form onSubmit={handleSubmit} className="form-style">
                <div className="form-group">
                    <label>Име:</label>
                    <input
                        type='text'
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder='Име и Фамилия'
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Имейл:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        placeholder='example@imotipremier.com'
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
