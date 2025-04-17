const mongoose = require('mongoose');

// Connect to MongoDB with optimized settings
module.exports = async (url, database) => {
    try {
        // Optional: For better performance, set mongoose to use the MongoDB driver's new URL parser
        mongoose.set('strictQuery', false);

        // Optimized connection options
        const connectionOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Optimize connection pool size
            serverSelectionTimeoutMS: 5000, // Shorter server selection timeout
            socketTimeoutMS: 45000, // How long sockets stay idle before closing
            family: 4, // Use IPv4, skip trying IPv6
            connectTimeoutMS: 10000 // Connection timeout
        };

        // Connect to database
        await mongoose.connect(`${url}/${database}`, connectionOptions);

        console.log(`Connected to MongoDB database: ${database}`);

        // Set up connection error handling
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected, attempting to reconnect...');
        });

        // Graceful connection handling for application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed due to app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB connection close:', err);
                process.exit(1);
            }
        });

        return mongoose.connection;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};