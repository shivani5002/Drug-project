// src/services/api.js
export const uploadNiiFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        // Remove hardcoded localhost:8000 - use relative path
        const response = await fetch('/api/nii/upload-nii', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
};

// Remove uploadImage if not used for NIfTI
