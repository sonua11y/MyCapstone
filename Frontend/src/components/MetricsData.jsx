import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import { Zap, Lightbulb, AlertCircle, Bike } from 'lucide-react';

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
                const fillingResponse = await fetch('http://localhost:5000/students/filling-status');
                const fillingData = await fillingResponse.json();
                const fastFillingCount = fillingData.find(d => d.type === "Fast Filling")?.count || 0;

                // Fetch total girls
                const girlsResponse = await fetch('http://localhost:5000/students/girls');
                const girlsData = await girlsResponse.json();
                const totalGirls = Object.values(girlsData).reduce((sum, count) => sum + count, 0);

                // Fetch semester fee paid students
                const semFeeResponse = await fetch('http://localhost:5000/students/sem-fee-paid');
                const semFeeData = await semFeeResponse.json();
                const semFeePaid = semFeeData.reduce((sum, item) => sum + item.fees, 0);

                // Fetch withdrawn students
                const withdrawnResponse = await fetch('http://localhost:5000/students/withdrawals');
                const withdrawnData = await withdrawnResponse.json();
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