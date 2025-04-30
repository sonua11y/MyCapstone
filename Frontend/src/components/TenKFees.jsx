import React from 'react';
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const TenKFees = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch 10k fees data
                const feesResponse = await fetch("http://localhost:5000/students/tenk-fees");
                if (!feesResponse.ok) {
                    throw new Error('Failed to fetch data');
                }
                const feesData = await feesResponse.json();
                
                // Process the data to get counts
                const paidCount = feesData.filter(student => student.feePaid?.toLowerCase() === 'yes').length;
                const notPaidCount = feesData.length - paidCount;
                setData({
                    paidCount,
                    notPaidCount,
                    total: feesData.length
                });

                // Fetch last update time
                const updateResponse = await fetch("http://localhost:5000/students/last-updated");
                if (!updateResponse.ok) {
                    throw new Error('Failed to fetch last update time');
                }
                const updateData = await updateResponse.json();
                setLastUpdate(updateData.lastModified);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-red-500">Error: {error}</div>
        </div>;
    }

    if (!data) {
        return <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="animate-pulse">Loading...</div>
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