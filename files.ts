import * as fs from 'fs/promises';
import * as path from 'path';

async function displayFiles() {
  try {
    // Define the directory path
    const folderPath = path.join(__dirname, '..', 'Public', 'My_xml');

    // Read the directory
    const files = await fs.readdir(folderPath);

    // Display files
    console.log('Files in My_myxm folder:');
    files.forEach((file) => {
      console.log(file);
    });
  } catch (error) {
    console.error('Error reading directory:', error.message);
  }
}

// Call the function
displayFiles();
