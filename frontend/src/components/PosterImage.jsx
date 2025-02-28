import React from 'react';

const PosterImage = ({ src, alt, ...props }) => {
    const imageUrl = src
        ? (src.startsWith('http') || src.startsWith('/uploads') ? src : `/uploads/${src}`)
        : '';
    return <img src={imageUrl} alt={alt} {...props} />;
};

export default PosterImage;
