import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import { Zap, Lightbulb, AlertCircle, Bike } from 'lucide-react';
import api from '../utils/api';

const MetricsData = () => {
    const [metrics, setMetrics] = useState({
        fastFillingColleges: 0,
        totalGirls: 0,
        semFeePaid: 0,
        withdrawn: 0
    });

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // Fetch fast filling colleges
                const fillingResponse = await api.get('/students/fast-slow-filling-colleges');
                const fillingData = fillingResponse.data;
                const fastFillingCount = fillingData.fastFillingColleges.length;

                // Fetch total girls
                const girlsResponse = await api.get('/students/girls');
                const girlsData = girlsResponse.data;
                const totalGirls = Object.values(girlsData).reduce((sum, count) => sum + count, 0);

                // Fetch semester fee paid students
                const semFeeResponse = await api.get('/students/sem-fee-paid');
                const semFeeData = semFeeResponse.data;
                const semFeePaid = semFeeData.reduce((sum, item) => sum + item.fees, 0);

                // Fetch withdrawn students
                const withdrawnResponse = await api.get('/students/withdrawals');
                const withdrawnData = withdrawnResponse.data;
                const withdrawn = withdrawnData.reduce((sum, item) => sum + item.count, 0);

                setMetrics({
                    fastFillingColleges: fastFillingCount,
                    totalGirls,
                    semFeePaid,
                    withdrawn
                });
            } catch (error) {
                console.error("Error fetching metrics:", error);
            }
        };

        fetchMetrics();
    }, []);

    if (!metrics) return <div>Loading metrics...</div>;

    return (
        <div className="metrics-container">
            <div className="metrics-grid">
                <MetricCard
                    title="Fast Filling Colleges"
                    value={metrics.fastFillingColleges}
                    bgColor="bg-yellow"
                    icon={<Zap size={25} color="#000" />}
                />
                <MetricCard
                    title="Number of Girls"
                    value={metrics.totalGirls}
                    bgColor="bg-blue"
                    icon={<Lightbulb size={25} color="#000" />}
                />
                <MetricCard
                    title="No. of Semester Fee Paid Students"
                    value={metrics.semFeePaid}
                    bgColor="bg-orange"
                    icon={<AlertCircle size={25} color="#000" />}
                />
                <MetricCard
                    title="Withdrawn seats"
                    value={metrics.withdrawn}
                    bgColor="bg-pink"
                    icon={<Bike size={25} color="#000" />}
                />
            </div>
        </div>
    );
};

export default MetricsData; 