import React from 'react';
import UploadForm from '../components/UploadForm';

const Home: React.FC = () => {
    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Talking Photo APP</h1>
            <UploadForm />
        </div>
    );
};

export default Home;
