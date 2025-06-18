export function validate(config) {
    const requiredFields = [
        'numberThreads',
        'numberDocuments',
        'batchSize',
        'timeStepMs',
        'address',
        'db',
        'collection'
    ];

    const missingFields = requiredFields.filter(field => config[field] === undefined);

    if (missingFields.length > 0) {
        const error = new Error(`❌ Missing required config fields: ${missingFields.join(', ')}`);
        error.missingFields = missingFields;
        throw error;
    }
}
