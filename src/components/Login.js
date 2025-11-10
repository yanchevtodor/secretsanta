import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const LoginForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setUser(formData); // запазваме логнатия потребител

        // проверка за админ
        if (
            formData.name.trim().toLowerCase() === 'тодор янчев' &&
            formData.email.trim().toLowerCase() === 'admin@admin.com'
        ) {
            navigate('/admin');
        } else {
            navigate('/profile');
        }

        setFormData({ name: '', email: '' });
    };

    return (
        <div className="login-form-container">
            <h3>Вход</h3>
            <form onSubmit={handleSubmit} className="form-style">
                <div className="form-group">
                    <label>Име:</label>
                    <input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Имейл:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <button className="submit-button">Вход</button>
            </form>
        </div>
    );
};

export default LoginForm;
