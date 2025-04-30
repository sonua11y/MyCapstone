import { useState, useEffect } from 'react';

const useLastUpdate = () => {
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const fetchLastUpdate = async () => {
            try {
                // For now, just use the current time since the endpoint doesn't exist
                setLastUpdate(new Date().toISOString());
            } catch (error) {
                console.error('Error fetching last update time:', error);
            }
        };

        fetchLastUpdate();
    }, []);

    return { lastUpdate };
};

export default useLastUpdate; 