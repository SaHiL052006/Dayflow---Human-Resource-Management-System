import mongoose from 'mongoose';
import Leave from '../models/Leave.js';
import User from '../models/User.js';

await mongoose.connect('mongodb://127.0.0.1:27017/dayflow_hrms');

const leaves = await Leave.find().populate('employee', 'name email employeeId').sort({ createdAt: -1 });
console.log('--- ALL LEAVES IN DATABASE ---');
for (const l of leaves) {
  console.log({
    id: l._id,
    employeeFieldId: l.employee?._id,
    employeeFieldName: l.employee?.name,
    employeeFieldEmail: l.employee?.email,
    employeeFieldEmpId: l.employee?.employeeId,
    schemaEmployeeId: l.employeeId,
    schemaEmployeeName: l.employeeName,
    leaveType: l.leaveType,
    remarks: l.remarks,
    startDate: l.startDate,
    endDate: l.endDate,
    status: l.status,
    createdAt: l.createdAt,
  });
}

await mongoose.disconnect();
