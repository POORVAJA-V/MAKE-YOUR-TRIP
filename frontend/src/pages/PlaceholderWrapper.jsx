import React from 'react';
import PageWrapper from '../components/PageWrapper';

const PlaceholderWrapper = ({ title }) => (
    <PageWrapper>
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-gray-500 mt-4">Feature fully prepared in the backend, frontend UI coming shortly.</p>
    </PageWrapper>
);

export default PlaceholderWrapper;
