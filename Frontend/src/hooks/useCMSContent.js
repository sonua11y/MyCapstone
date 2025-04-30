import { useState, useEffect } from 'react';

const useCMSContent = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Original local data structure
                const structuredContent = {
                    metrics: {
                        FastFillingColleges: "Fast Filling Colleges",
                        TotalGirls: "Number of Girls",
                        TotalColleges: "No. of Semester Fee Paid Students",
                        TotalStudents: "Withdrawn seats"
                    },
                    admissionsSection: {
                        Title: "Student Admissions Through Years",
                        Subtitle: "Distribution of students across different colleges",
                        Description: "Detailed view of admission trends"
                    },
                    tenKFeesSection: {
                        Title: "10K Fees Distribution",
                        Subtitle: "Distribution of students who have paid 10K fees",
                        Description: "Track 10K fee payments"
                    },
                    fillingStatusSection: {
                        Title: "Filling Status",
                        Subtitle: "College filling trends",
                        Description: "Monitor college filling rates"
                    },
                    semFeeTableSection: {
                        Title: "Semester Fee Table",
                        Subtitle: "Fee structure details",
                        Description: "View semester-wise fee details"
                    },
                    feeCollectionSection: {
                        Title: "Fee Collection",
                        Subtitle: "Payment collection status",
                        Description: "Track fee collection progress"
                    },
                    centralContent: {
                        Title: "Dashboard Overview",
                        Subtitle: "Comprehensive view",
                        Description: "Main dashboard content"
                    },
                    collegeWiseSection: {
                        Title: "College-wise Analysis",
                        Subtitle: "Individual college statistics",
                        Description: "Detailed college performance"
                    }
                };

                setContent(structuredContent);
                setLoading(false);
            } catch (err) {
                console.error('Error setting up content:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return { content, loading, error };
};

export default useCMSContent; 