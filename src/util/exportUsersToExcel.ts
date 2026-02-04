import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

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
  const dir = path.join(process.cwd(), 'public/exports');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fileName = `users-${Date.now()}.xlsx`;
  const filePath = path.join(dir, fileName);

  await workbook.xlsx.writeFile(filePath);

  return {
    fileName,
    filePath,
  };
};
