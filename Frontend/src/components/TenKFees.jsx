import React from 'react';
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import api from '../utils/api';

const TenKFees = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch both data in parallel
                const [feesResponse, updateResponse] = await Promise.all([
                    api.get('/students/tenk-fees'),
                    api.get('/students/last-updated')
                ]);
                
                // Process the fees data to get counts
                const feesData = feesResponse.data;
                const paidCount = feesData.filter(student => student.feePaid?.toLowerCase() === 'yes').length;
                const notPaidCount = feesData.length - paidCount;
                setData({
                    paidCount,
                    notPaidCount,
                    total: feesData.length
                });

                setLastUpdate(updateResponse.data.lastModified);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="animate-pulse">Loading...</div>
        </div>;
    }

    if (error) {
        return <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-red-500">Error: {error}</div>
        </div>;
    }

    if (!data) {
        return <div className="bg-white p-4 rounded-lg shadow-md">
            <div>No data available</div>
        </div>;
    }

    const chartData = {
        labels: ["Paid", "Not Paid"],
        datasets: [
            {
                data: [data.paidCount, data.notPaidCount],
                backgroundColor: ["#4CAF50", "#f44336"],
                borderColor: ["#4CAF50", "#f44336"],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            },
            title: {
                display: true,
                text: `Total Students: ${data.total}`,
                position: 'bottom'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: Math.ceil(Math.max(data.paidCount, data.notPaidCount) / 5),
                },
            },
        },
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    10K Fees Distribution
                </h2>
                <p className="text-sm text-gray-600">
                    Last updated: {lastUpdate}
                </p>
            </div>
            <div className="h-64">
                <Bar data={chartData} options={options} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.paidCount}</div>
                    <div className="text-sm text-gray-600">Paid</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{data.notPaidCount}</div>
                    <div className="text-sm text-gray-600">Not Paid</div>
                </div>
            </div>
        </div>
    );
};

export default TenKFees; 