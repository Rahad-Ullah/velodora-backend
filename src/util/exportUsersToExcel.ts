import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';

export const exportUsersToExcel = async (users: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  // Define Columns
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Role', key: 'role', width: 15 },
    { header: 'Contact', key: 'contact', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 25 },
  ];

  // Add rows
  users.forEach(user => {
    worksheet.addRow({
      name: user.name,
      email: user.email,
      role: user.role,
      contact: user.contact,
      createdAt: new Date(user.createdAt).toLocaleString(),
    });
  });

  // Ensure folder exists
  const dir = path.join(process.cwd(), 'public', 'exports');
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  // Delete old files (>2 minutes)
  const files = await fs.readdir(dir);
  const now = Date.now();

  await Promise.all(
    files
      .filter(f => f.endsWith('.xlsx'))
      .map(async file => {
        const timestamp = Number(file.replace('users-', '').replace('.xlsx', ''));
        if (!isNaN(timestamp) && timestamp < now - 5 * 60 * 1000) {
          await fs.unlink(path.join(dir, file));
        }
      })
  );

  // Write new Excel
  const fileName = `users-${Date.now()}.xlsx`;
  const filePath = path.join(dir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return { fileName, filePath };
};
