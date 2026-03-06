import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const DebugStreams = () => {
    const [status, setStatus] = useState('Initializing...');
    const [response, setResponse] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const runSetup = async () => {
            try {
                setStatus('Running setup_test_data.php...');
                const res = await api.get('/setup-test-data');
                setResponse(res.data);
                setStatus('Success! Data populated.');
            } catch (error) {
                console.error("Setup failed", error);
                setStatus('Failed: ' + (error.response?.data?.message || error.message));
                setResponse(error.response?.data);
            }
        };

        runSetup();
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Debug Streams & Data</h1>
            <div className="mb-4">
                <strong>Status:</strong> {status}
            </div>
            {response && (
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(response, null, 2)}
                </pre>
            )}
            <br />
            <div className="flex gap-4">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Go back to Dashboard
                </button>
                <button 
                     onClick={() => window.location.reload()}
                     className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Retry
                </button>
            </div>
        </div>
    );
};

export default DebugStreams;
