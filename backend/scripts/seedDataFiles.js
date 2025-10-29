const fs = require("fs").promises;
const path = require("path");

// Directory for data files
const DATA_FILES_DIR = path.join(__dirname, "../utils/datafiles");

// Sample files with different sizes and risk levels
const sampleFiles = [
  // LOW RISK FILES (small size)
  {
    filename: "Employee_Handbook_2024.pdf",
    sizeMB: 2.5,
    type: "pdf",
    description: "Company employee handbook and policies",
    isSensitive: false,
  },
  {
    filename: "Meeting_Notes_Q1.docx",
    sizeMB: 0.8,
    type: "docx",
    description: "Quarterly meeting notes",
    isSensitive: false,
  },
  {
    filename: "Project_Timeline.xlsx",
    sizeMB: 1.2,
    type: "xlsx",
    description: "Project timeline and milestones",
    isSensitive: false,
  },

  // MEDIUM RISK FILES (moderate size)
  {
    filename: "Customer_Database_Report.xlsx",
    sizeMB: 150,
    type: "xlsx",
    description: "Customer analytics and reports",
    isSensitive: true,
  },
  {
    filename: "Financial_Summary_2024.pdf",
    sizeMB: 85,
    type: "pdf",
    description: "Annual financial summary",
    isSensitive: true,
  },
  {
    filename: "Product_Designs_Archive.zip",
    sizeMB: 250,
    type: "zip",
    description: "Product design files and mockups",
    isSensitive: false,
  },

  // HIGH RISK FILES (large size)
  {
    filename: "Confidential_Client_Data.csv",
    sizeMB: 2500,
    type: "csv",
    description: "Confidential client information database",
    isSensitive: true,
  },
  {
    filename: "Payroll_Records_2024.xlsx",
    sizeMB: 1200,
    type: "xlsx",
    description: "Employee payroll and salary information",
    isSensitive: true,
  },
  {
    filename: "Backup_Database_Full.zip",
    sizeMB: 5000,
    type: "zip",
    description: "Complete database backup file",
    isSensitive: true,
  },
  {
    filename: "Source_Code_Repository.zip",
    sizeMB: 3500,
    type: "zip",
    description: "Complete source code repository",
    isSensitive: true,
  },
];

async function createMockFile(filename, sizeMB) {
  const filePath = path.join(DATA_FILES_DIR, filename);

  // Create a small text file with metadata instead of actual large files
  const content = `MOCK DATA FILE
Filename: ${filename}
Simulated Size: ${sizeMB} MB
This is a mock file for demonstration purposes.
In a real system, this would be an actual ${path.extname(filename)} file.

Generated: ${new Date().toISOString()}
`;

  await fs.writeFile(filePath, content, "utf8");
  console.log(`✅ Created mock file: ${filename} (simulated: ${sizeMB} MB)`);
}

async function seedDataFiles() {
  try {
    console.log("📁 Seeding data files...\n");

    // Ensure directory exists
    try {
      await fs.access(DATA_FILES_DIR);
      console.log("📂 Directory already exists");
    } catch {
      await fs.mkdir(DATA_FILES_DIR, { recursive: true });
      console.log("📂 Created datafiles directory");
    }

    // Create metadata file
    const metadata = {
      files: sampleFiles,
      lastUpdated: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(DATA_FILES_DIR, "metadata.json"),
      JSON.stringify(metadata, null, 2),
      "utf8"
    );
    console.log("✅ Created metadata.json\n");

    // Create mock files
    for (const file of sampleFiles) {
      await createMockFile(file.filename, file.sizeMB);
    }

    console.log("\n✨ Data files seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   Total Files: ${sampleFiles.length}`);
    console.log(
      `   Low Risk: ${sampleFiles.filter((f) => f.sizeMB < 100).length} files`
    );
    console.log(
      `   Medium Risk: ${
        sampleFiles.filter((f) => f.sizeMB >= 100 && f.sizeMB < 500).length
      } files`
    );
    console.log(
      `   High Risk: ${sampleFiles.filter((f) => f.sizeMB >= 500).length} files`
    );
    console.log(`\n📍 Location: ${DATA_FILES_DIR}\n`);
  } catch (error) {
    console.error("❌ Error seeding data files:", error);
    process.exit(1);
  }
}

// Run the seeding
seedDataFiles();
