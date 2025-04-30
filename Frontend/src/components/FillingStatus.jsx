import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const FillingStatus = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/students/filling-status');
                setData(response.data);

                const updateResponse = await api.get('/students/last-updated');
                setLastUpdate(updateResponse.data.lastModified);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!data.length) {
        return <div>No data available</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Filling Status
                </h2>
                <p className="text-gray-600 mt-1">
                    Last updated: {lastUpdate || new Date().toLocaleDateString()}
                </p>
                <p className="text-gray-500 mt-2">
                    Distribution of fast and slow filling colleges
                </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FillingStatus; 