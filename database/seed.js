const { User, Session, File, Chunk } = require('./models');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Clear existing data (optional, but ensures clean seed)
    await Chunk.destroy({ where: {} });
    await File.destroy({ where: {} });
    await Session.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create sample users
    const users = await User.bulkCreate([
      { email: 'alice@example.com' },
      { email: 'bob@example.com' },
      { email: 'charlie@example.com' },
    ]);
    console.log(`Created ${users.length} users`);

    // Create sessions for each user
    const sessions = [];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
    for (const user of users) {
      const session = await Session.create({
        id: uuidv4(),
        user_id: user.id,
        session_token: uuidv4(),
        expires_at: expiresAt,
      });
      sessions.push(session);
    }
    console.log(`Created ${sessions.length} sessions`);

    // Create files for each session
    const files = [];
    for (const session of sessions) {
      const file = await File.create({
        id: uuidv4(),
        session_id: session.id,
        original_filename: `sample_data_${Math.floor(Math.random() * 100)}.xlsx`,
        s3_key: `uploads/${session.id}/${uuidv4()}.xlsx`,
        upload_timestamp: new Date(),
        file_size: Math.floor(Math.random() * 5000000) + 1000000, // 1MB-5MB
        status: 'completed',
      });
      files.push(file);
    }
    console.log(`Created ${files.length} files`);

    // Create chunks for each file
    const chunks = [];
    for (const file of files) {
      // Create 3 overlapping chunks per file
      for (let i = 0; i < 3; i++) {
        const chunk = await Chunk.create({
          id: uuidv4(),
          file_id: file.id,
          chunk_index: i,
          token_count: 500,
          overlap_start: i * 450, // 500 token chunk with 50 overlap => start at 0, 450, 900
          overlap_end: (i + 1) * 500 - 50, // end at 450, 950, 1450
          content: `This is the content of chunk ${i} for file ${file.original_filename}. It contains sample text for testing the overlapping chunk strategy.`,
          milvus_vector_id: null, // Will be populated after embedding
        });
        chunks.push(chunk);
      }
    }
    console.log(`Created ${chunks.length} chunks`);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close Sequelize connection
    try {
      await User.sequelize.close();
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

seedDatabase();