import React, { useEffect, useState } from 'react';

const ListPeople = () => {
    const [people, setPeople] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/people')
            .then(res => res.json())
            .then(data => setPeople(data))
            .then(data => console.log(data));
    }, []);

    return (
        <div>
            <h2>Списък с колеги</h2>
            <ul>
                {people.map((p, i) => (
                    <li key={i}>
                        <strong>{p.name}</strong> — {p.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListPeople;
