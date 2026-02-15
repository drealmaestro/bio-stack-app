import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function TestStorage() {
    const { user, setUser, templates, addTemplate } = useStore();
    const [nameInput, setNameInput] = useState('');

    // Hydration check
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) return <div>Loading storage...</div>;

    return (
        <div className="p-4 border border-yellow-500 m-4 rounded">
            <h2 className="text-xl font-bold text-primary mb-2">Storage Test</h2>

            <div className="mb-4">
                <h3 className="font-bold">Current User:</h3>
                <pre className="bg-gray-800 p-2 rounded">
                    {user ? JSON.stringify(user, null, 2) : 'No User'}
                </pre>
                <button
                    onClick={() => setUser({
                        name: 'Bio Hacker',
                        age: 47,
                        goals: ['Hypertrophy'],
                        experience_level: 'Advanced',
                        stats: { weight: [], body_fat: [] }
                    })}
                    className="bg-primary text-black px-4 py-2 mt-2 rounded"
                >
                    Set Test User
                </button>
            </div>

            <div>
                <h3 className="font-bold">Templates ({templates.length}):</h3>
                <div className="flex gap-2 mt-2">
                    <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="bg-gray-800 border p-2 rounded text-white"
                        placeholder="Template Name"
                    />
                    <button
                        onClick={() => {
                            addTemplate({
                                id: crypto.randomUUID(),
                                name: nameInput,
                                exercises: []
                            });
                            setNameInput('');
                        }}
                        className="bg-secondary text-white px-4 py-2 rounded"
                    >
                        Add Template
                    </button>
                </div>
                <ul className="mt-2 text-sm text-gray-400">
                    {templates.map(t => <li key={t.id}>{t.name}</li>)}
                </ul>
            </div>
        </div>
    );
}
