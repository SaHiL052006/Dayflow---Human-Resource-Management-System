import mongoose from 'mongoose';
import Leave from '../models/Leave.js';
import User from '../models/User.js';

await mongoose.connect('mongodb://127.0.0.1:27017/dayflow_hrms');

const chloe = await User.findOne({ email: 'chloe.bennett@dayflow.com' });
if (!chloe) {
  console.error('Chloe Bennett not found in users!');
  process.exit(1);
}

// Find the pending sick leave "Admitted in hospital"
const sickLeave = await Leave.findOne({ remarks: /Admitted in hospital/i });
if (sickLeave) {
  sickLeave.employee = chloe._id;
  sickLeave.employeeId = chloe.employeeId;
  sickLeave.employeeName = chloe.name;
  sickLeave.department = chloe.jobDetails?.department || 'Marketing & Growth';
  await sickLeave.save();
  console.log(`✅ Successfully assigned Sick Leave '${sickLeave._id}' to Chloe Bennett (${chloe.employeeId} - ${chloe.name})!`);
} else {
  // Create it for Chloe
  await Leave.create({
    employee: chloe._id,
    employeeId: chloe.employeeId,
    employeeName: chloe.name,
    department: chloe.jobDetails?.department || 'Marketing & Growth',
    leaveType: 'Sick',
    startDate: '2026-08-24',
    endDate: '2026-08-25',
    daysCount: 2,
    remarks: 'Admitted in hospital',
    status: 'Pending',
  });
  console.log('✅ Created Sick Leave for Chloe Bennett!');
}

await mongoose.disconnect();
